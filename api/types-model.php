<?php
require_once(__DIR__ . '/model.php');

Class TypesModel extends Model
{
    protected $columns = ["name", "default_value", "repeat_type", "description", "notes", "url"];

    private function select($where = "")
    {
        $conn = &$this->conn;

        if (strlen($where) > 0)
            $where = 'WHERE ' . $where;

        $sql_result = $conn->query("SELECT `id`, `name`, `description`, `repeat_type`, `default_value`, `notes`, `url` FROM `types` ".$where." ORDER BY `name` ASC");

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
        return $this->select();
    }

    function get($id)
    {
        return $this->select("`id` = ".(int)$id);
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
        $sql = $conn->prepare("INSERT INTO `types` (" . implode(",", $columns) . ") VALUES (" . implode(",", $placeholders) . ")");
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

        $sql = $conn->prepare("UPDATE `types` SET " . implode(",", $columns) . " WHERE `id` = ?");
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
                    if (count($items) > 0) {
                        $result = $items[0];
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
        $sql = $conn->prepare("DELETE FROM `types` WHERE `id` = ?");
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
?>
