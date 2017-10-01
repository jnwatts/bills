<?php

require_once(__DIR__ . '/controller.php');
require_once(__DIR__ . '/items-class.php');

Class TypesController extends Controller
{
    private $items;

    function __construct($params)
    {
        $this->items = new Items($params);
    }

    function find()
    {
        return $this->items->types();
    }

    function create()
    {
        $data = $this->readInput();
        return $this->items->addType($data);
    }

    function get($id)
    {
        $result = $this->items->types($id);
        if (!$result)
            $result = $this->error(404);
        return $result;
    }

    function update($id)
    {
        if ($id == 1)
            return $this->error(403);

        $data = $this->readInput();
        if (isset($data->id) && $data->id == $id) {
            $result = $this->items->updateType($data);
        } else {
            $result = $this->error(400);
        }
        return $result;
    }

    function delete($id)
    {
        if ($id == 1)
            return $this->error(403);

        return $this->items->removeType($id);
    }
}

?>