<?php
require("config.php");
require("items-class.php");

$items = new Items($config);
$result = NULL;
/* Views */
if (isset($_REQUEST["views"]))
{
    $result = $items->views();
}
/* Items */
else if ($_SERVER['REQUEST_METHOD'] === 'DELETE' && strstr($_SERVER["REQUEST_URI"], "items") !== false)
{
    $m = array();
    if (preg_match('#items/([0-9]+)#', $_SERVER["REQUEST_URI"], $m)) {
        $result = $items->remove($m[1]);
    } else {
        $result = array("error" => "Malformed request");
        http_response_code(500);
    }
}
else if ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'PUT' && strstr($_SERVER["REQUEST_URI"], "items") !== false)
{
    $data = json_decode(file_get_contents("php://input"));
    if ($data) {
        if (is_array($data)) {
            $result = array();
            foreach ($data as $item) {
                $result[] = $items->update($item);
            }
        } else {
            $result = $items->update($data);
        }
    }
}
else if (isset($_REQUEST["items"]))
{
    $month = (int)(isset($_REQUEST["month"]) ? $_REQUEST["month"] : $items->defaultMonth());
    $year = (int)(isset($_REQUEST["year"]) ? $_REQUEST["year"] : $items->defaultYear());
    $result = $items->items($year, $month);
}
else if (isset($_REQUEST["addInstance"]))
{
    $data = json_decode(file_get_contents("php://input"));
    if ($data) {
        if (is_array($data)) {
            $result = array();
            foreach ($data as $item) {
                $result[] = $items->addInstance($item);
            }
        } else {
            $result = $items->addInstance($data);
        }
    } else {
        $result = $items->addInstance();
    }
}
else if (isset($_REQUEST["editInstance"]))
{
    $data = json_decode(file_get_contents("php://input"));
    $result = $items->updateColumn($data->id, $data->column, $data->value);
}
else if (isset($_REQUEST["updateInstance"]))
{
    $data = json_decode(file_get_contents("php://input"));
    $result = $items->update($data);
}
else if (isset($_REQUEST["removeInstance"]))
{
    $data = json_decode(file_get_contents("php://input"));
    $result = $items->remove($data->id);
}
/* Types */
else if (isset($_REQUEST["types"]))
{
    $result = $items->types();
}
else if (isset($_REQUEST["addType"]))
{
    $result = $items->addType();
}
else if (isset($_REQUEST["editType"]))
{
    $data = json_decode(file_get_contents("php://input"));
    $result = $items->updateType($data->id, $data->column, $data->value);
}
else if (isset($_REQUEST["removeType"]))
{
    $data = json_decode(file_get_contents("php://input"));
    $result = $items->removeType($data->id);
}
else
{
    $result = array("error" => "Invalid request");
    http_response_code(500);
}
print json_encode($result);
?>
