<?php

//TODO: Rename items-class to items-model and split types into own model
require_once(__DIR__ . '/controller.php');
require_once(__DIR__ . '/items-class.php');

Class ItemsController extends Controller
{
    private $items;

    function __construct($params)
    {
        $this->items = new Items($params);
    }

    function find()
    {
        $date = isset($_REQUEST['date']) ? $_REQUEST['date'] : date('Y').'-'.date('m');
        if (preg_match('#([0-9]{4})-([0-9]{1,2})#', $date, $m)) {
            $result = $this->items->items($m[1], $m[2]);
        } else {
            $result = $this->error(500, 'Invalid date range');
        }

        return $result;
    }

    function create()
    {
        $data = $this->readInput();
        return $this->items->addInstance($data);
    }

    function get($id)
    {
        $result = $this->items->items($id);
        if (!$result)
            $result = $this->error(404);
        return $result;
    }

    function update($id)
    {
        $data = $this->readInput();
        if (isset($data->id) && $data->id == $id) {
            $result = $this->items->update($data);
        } else {
            $result = $this->error(500, 'Invalid request');
        }
        return $result;
    }

    function delete($id)
    {
        return $this->items->remove($id);
    }
}

?>