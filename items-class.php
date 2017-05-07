<?php

/* TODO:
 * - Create abstract Model class with RW/RO mask for fields
 * - Create Item and Type instances of Model
 * - Put Type and Model implementations in own files and include
*/

define("DEFAULT_VIEW",  "2w");
define("ITEM_INSTANCES", "bills_item_instances");
define("ITEM_TYPES", "bills_item_types");

Class Items
{
    // *** Class variables
    private $db;
    
    function __construct($params)
    {
        $this->db = new stdClass();
        $this->db->host = $params["host"];
        $this->db->user = $params["user"];
        $this->db->pass = $params["pass"];
        $this->db->database = $params["database"];

        $this->open();
    }

    function __destruct()
    {
        $this->close();
    }

    function open()
    {
        $db = &$this->db;
        $conn = new mysqli(
            $db->host,
            $db->user,
            $db->pass
            );
        if ($conn->connect_error) {
            $this->error("Connection failed: " . $conn->connect_error);
        }
        if (!$conn->select_db($db->database)) {
            $this->error("Database not found");
        }
        $db->conn = $conn;
    }

    function close()
    {
        if (isset($this->db)) {
            if (isset($this->db->conn)) {
                $this->db->conn->close();
            }
        }
    }

    function error($msg, $code=NULL)
    {
        if (is_int($code)) {
            http_response_code($code);
        }
        die($msg);
    }

    function defaultMonth()
    {
        return (int)date('m');
    }

    function defaultYear()
    {
        return (int)date('Y');
    }

    function views()
    {
        return array(
                "2w" => "Next 2 Weeks",
                "a" => "All Time",
                1 => "January", 2 => "February", 3 => "March",
                4 => "April", 5 => "May", 6 => "June",
                7 => "July", 8 => "August", 9 => "September",
                10 => "October", 11 => "November", 12 => "December"
                );
    }

    function items($year, $month, $where = "") {
        $conn = &$this->db->conn;
        if ($year > 0) {
            $where .= " AND YEAR(`due_date`) = ".$year." AND MONTH(`due_date`) = ".$month;
        }
        $sql_result = $conn->query("SELECT I.`id`, `automatic`, DATE_FORMAT(`due_date`, '%Y-%m-%d') AS due_date, `repeat_type`, `type_id`, `amount`, DATE_FORMAT(`paid_date`, '%Y-%m-%d') AS paid_date, I.`notes` FROM `bills_item_instances` AS I, `bills_item_types` AS T WHERE I.`type_id` = T.`id` ".$where. " ORDER BY `due_date` ASC, T.`name` ASC");

        $result = array();
        if ($sql_result) {
            while ($row = $sql_result->fetch_object()) {
                $result[] = $row;
            }
            $sql_result->close();
        } else {
            $this->error("Query failed: ".$conn->error, 500);
        }

        return $result;
    }

    function columns($table) {
        if ($table == ITEM_INSTANCES) {
            return array("due_date", "automatic", "amount", "paid_date", "notes", "type_id");
        } else if ($table == ITEM_TYPES) {
            return array("name", "default_value", "repeat_type", "description", "notes", "url");
        } else {
            return NULL;
        }
    }

    function validColumn($column, $table) {
        $cols = $this->columns($table);
        if ($cols) {
            return in_array($column, $cols);
        }
        return false;
    }

    function updateColumn($id, $column, $value) {
        $result = array();
        $conn = &$this->db->conn;
        $id = intval($id);
        $column = $conn->real_escape_string($column);
        $value = $conn->real_escape_string($value);
        if (strlen($value) == 0) {
            $value = NULL;
        }
        if (!$this->validColumn($column, ITEM_INSTANCES)) {
            $this->error("Invalid column", 500);
            return;
        }
        $sql = $conn->prepare("UPDATE bills_item_instances SET `".$column."` = ? WHERE `id` = ?");
        if ($sql === FALSE) {
            $this->error("Failed to compile update: ".$conn->error, 500);
        } else {
            if (!$sql->bind_param('si', $value, $id)) {
                $this->error("Failed to bind param".$sql->error, 500);
            } else {
                if (!$sql->execute()) {
                    $this->error("Failed to execute update", 500);
                } else {
                    $result = array("value" => $this->getCol($id, $column, ITEM_INSTANCES));
                }
            }
            $sql->close();
        }
        return $result;
    }

    function update($item) {
        $result = null;
        $conn = &$this->db->conn;
        if (!isset($item->id)) {
            return $this->addInstance($item);
        }
        $id = intval($item->id);
        $columns = [];
        $values = [];
        foreach ($this->columns(ITEM_INSTANCES) as $column) {
            if (!property_exists($item, $column)) {
                continue;
            }

            $value = $item->{$column};

            if (strlen($value) == 0) {
                $value = NULL;
            }

            $columns[] = "`".$column."` = ?";
            $values[] = $value;
        }

        $sql = $conn->prepare("UPDATE bills_item_instances SET " . implode(",", $columns) . " WHERE `id` = ?");
        if ($sql === FALSE) {
            $this->error("Failed to compile update: ".$conn->error, 500);
        } else {
            $params = str_repeat('s', count($values)) . "i";
            $values[] = $id;
            if (!$sql->bind_param($params, ...$values)) {
                $this->error("Failed to bind param".$sql->error, 500);
            } else {
                if (!$sql->execute()) {
                    $this->error("Failed to execute update", 500);
                } else {
                    $items = $this->items(0, 0, "AND I.`id` = ".$id);
                    if (count($items) > 0) {
                        $result = $items[0];
                    }
                }
            }
            $sql->close();
        }
        return $result;
    }

    function getCol($id, $column, $table = ITEM_INSTANCES) {
        $result = array();
        $conn = &$this->db->conn;
        $id = intval($id);
        $column = $conn->real_escape_string($column);
        if (!$this->validColumn($column, $table)) {
            $this->error("Invalid column", 500);
            return;
        }
        $sql = $conn->prepare("SELECT `".$column."` FROM `".$table."` WHERE `id` = ?");
        if ($sql === FALSE) {
            $this->error("Failed to compile update: ".$conn->error, 500);
        } else {
            if (!$sql->bind_param('i', $id)) {
                $this->error("Failed to bind param".$sql->error, 500);
            } else {
                $sql_result = $sql->execute();
                if (!$sql_result) {
                    $this->error("Failed to execute update", 500);
                } else {
                    $sql->bind_result($result);
                    $sql->fetch();
                }
            }
            $sql->close();
        }
        return $result;
    }

    function addInstance($item = null) {
        $conn = &$this->db->conn;

        if ($item) {
            $columns = [];
            $placeholders = [];
            $values = [];
            foreach ($this->columns(ITEM_INSTANCES) as $column) {
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
            $sql = $conn->prepare("INSERT INTO `bills_item_instances` (" . implode(",", $columns) . ") VALUES (" . implode(",", $placeholders) . ")");
            if ($sql) {
                $params = str_repeat('s', count($values));
                if ($sql->bind_param($params, ...$values)) {
                    $sql_result = $sql->execute();
                }
            }
        } else {
            $sql_result = $conn->query("INSERT INTO `bills_item_instances` (`due_date`) VALUES ('".date("o-n-d")."')");
        }

        if ($sql_result) {
            $result = $this->items(0, 0, " AND I.`id` = ".$conn->insert_id)[0];
        } else {
            var_dump($item);
            var_dump($columns);
            var_dump($values);
            var_dump($params);
            $this->error("Query failed: ".$conn->error, 500);
        }

        return $result;
    }

    function remove($id) {
        $result = array("result" => false);
        $conn = &$this->db->conn;
        $id = intval($id);
        $sql = $conn->prepare("DELETE FROM bills_item_instances WHERE `id` = ?");
        if ($sql === FALSE) {
            $this->error("Failed to compile update: ".$conn->error, 500);
        } else {
            if (!$sql->bind_param('i', $id)) {
                $this->error("Failed to bind param".$sql->error, 500);
            } else {
                if (!$sql->execute()) {
                    $this->error("Failed to execute update", 500);
                } else {
                    $result = array("result" => true);
                }
            }
            $sql->close();
        }
        return $result;
    }

    function types($where = "") {
        $conn = &$this->db->conn;

        $sql_result = $conn->query("SELECT `id`, `name`, `description`, `repeat_type`, `default_value`, `notes`, `url` FROM `bills_item_types` ".$where." ORDER BY `name` ASC");

        $result = array();
        if ($sql_result) {
            while ($row = $sql_result->fetch_object()) {
                $result[] = $row;
            }
            $sql_result->close();
        } else {
            $this->error("Query failed: ".$conn->error, 500);
        }

        return $result;
    }

    function updateType($id, $column, $value) {
        $result = array();
        $conn = &$this->db->conn;
        $id = intval($id);
        $column = $conn->real_escape_string($column);
        $value = $conn->real_escape_string($value);
        if (!$this->validColumn($column, ITEM_TYPES)) {
            $this->error("Invalid column", 500);
            return;
        }
        if ($column == "frequency") {
            $value = strtoupper($value);
            if (!in_array($value, array("W", "M", "Y")))
                $this->error("Invalid value for Frequency", 500);
        }
        $sql = $conn->prepare("UPDATE `bills_item_types` SET `".$column."` = ? WHERE `id` = ?");
        if ($sql === FALSE) {
            $this->error("Failed to compile update: ".$conn->error, 500);
        } else {
            if (!$sql->bind_param('si', $value, $id)) {
                $this->error("Failed to bind param".$sql->error, 500);
            } else {
                if (!$sql->execute()) {
                    $this->error("Failed to execute update", 500);
                } else {
                    $result = array("value" => $this->getCol($id, $column, ITEM_TYPES));
                }
            }
            $sql->close();
        }
        return $result;
    }

    function addType() {
        $conn = &$this->db->conn;

        $sql_result = $conn->query("INSERT INTO `bills_item_types` () VALUES ()");

        if ($sql_result) {
            $result = $this->types("WHERE `id` = ".$conn->insert_id)[0];
        } else {
            $this->error("Query failed: ".$conn->error, 500);
        }

        return $result;
    }

    function removeType($id) {
        $result = array("result" => false);
        $conn = &$this->db->conn;
        $id = intval($id);
        $sql = $conn->prepare("DELETE FROM bills_item_types WHERE `id` = ?");
        if ($sql === FALSE) {
            $this->error("Failed to compile update: ".$conn->error, 500);
        } else {
            if (!$sql->bind_param('i', $id)) {
                $this->error("Failed to bind param".$sql->error, 500);
            } else {
                if (!$sql->execute()) {
                    $this->error("Failed to execute update", 500);
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
