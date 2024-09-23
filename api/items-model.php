<?php
require_once(__DIR__ . '/model.php');

/**
 * TODO:
 *  - Replace HTTP errors with exceptions
 */

class ItemsModel extends Model
{
    protected $columns = ["due_date", "automatic", "amount", "paid_date", "notes", "type_id"];

    private function select($where = "")
    {
        $conn = &$this->conn;

        if (strlen($where) > 0)
            $where = 'AND ' . $where;

        $sql_result = $conn->query("SELECT I.`id`, `automatic`, DATE_FORMAT(`due_date`, '%Y-%m-%d') AS due_date, `repeat_type`, `type_id`, `amount`, DATE_FORMAT(`paid_date`, '%Y-%m-%d') AS paid_date, I.`notes` FROM `items` AS I, `types` AS T WHERE I.`deleted` IS NULL AND I.`type_id` = T.`id` ".$where. " ORDER BY `due_date` ASC, T.`name` ASC");

        $result = array();
        if ($sql_result) {
            while ($row = $sql_result->fetch_object()) {
                $result[] = $row;
            }
            $sql_result->close();
        } else {
            throw new Exception($conn->error);
        }

        return $result;
    }

    function find($params = [])
    {
        $from = $params['from'];
        $to = $params['to'];

        return $this->select("`due_date` BETWEEN '".$from."' AND '".$to."'");
    }

    function get($id)
    {
        $result = $this->select("I.`id` = ".(int)$id);
        if (isset($result[0]))
            return $result[0];
        else
            return NULL;
    }

    function create($item)
    {
        $conn = &$this->conn;

        $columns = [];
        $placeholders = [];
        $values = [];
        foreach ($this->columns as $column) {
            if (!property_exists($item, $column)) {
                continue;
            }

            $value = $item->{$column};

            if (strlen($value) == 0) {
                $value = NULL;
            }

            $columns[] = "`".$column."`";
            $placeholders[] = "?";
            $values[] = $value;
        }
        $sql_result = false;
        $sql = $conn->prepare("INSERT INTO `items` (" . implode(",", $columns) . ") VALUES (" . implode(",", $placeholders) . ")");
        if ($sql) {
            $params = str_repeat('s', count($values));
            if ($sql->bind_param($params, ...$values)) {
                $sql_result = $sql->execute();
            }
        }

        if ($sql_result) {
            $result = $this->get($conn->insert_id);
        } else {
            throw new Exception($conn->error);
        }

        return $result;
    }

    function update($id, $item)
    {
        $result = null;
        $conn = &$this->conn;
        $columns = [];
        $values = [];
        foreach ($this->columns as $column) {
            if (!property_exists($item, $column))
                continue;

            $value = $item->{$column};

            if (strlen($value) == 0)
                $value = NULL;

            $columns[] = "`".$column."` = ?";
            $values[] = $value;
        }

        $sql = $conn->prepare("UPDATE `items` SET " . implode(",", $columns) . " WHERE `id` = ?");
        if ($sql === FALSE) {
            $this->error("Failed to compile update: ".$conn->error, 500);
        } else {
            $params = str_repeat('s', count($values)) . "i";
            $values[] = $id;
            if (!$sql->bind_param($params, ...$values)) {
                $this->error("Failed to bind param".$sql->error, 500);
            } else {
                if (!$sql->execute()) {
                    throw new Exception($conn->error);
                } else {
                    $items = $this->get($id);
                    if (is_array($items) && count($items) > 0) {
                        $result = $items[0];
                    } else {
                        $result = $items;
                    }
                }
            }
            $sql->close();
        }
        return $result;
    }

    function delete($id)
    {
        $result = array("result" => false);
        $conn = &$this->conn;
        $id = intval($id);
        $sql = $conn->prepare("UPDATE `items` SET deleted=current_timestamp() WHERE `id` = ?");
        if ($sql === FALSE) {
            $this->error("Failed to compile update: ".$conn->error, 500);
        } else {
            if (!$sql->bind_param('i', $id)) {
                $this->error("Failed to bind param".$sql->error, 500);
            } else {
                if (!$sql->execute()) {
                    throw new Exception($conn->error);
                } else {
                    $result = array("result" => true);
                }
            }
            $sql->close();
        }
        return $result;
    }
}
