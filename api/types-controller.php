<?php
require_once(__DIR__ . '/controller.php');
require_once(__DIR__ . '/types-model.php');

Class TypesController extends Controller
{
    private $items;

    function __construct($params)
    {
        $this->types = new TypesModel($params);
    }

    function find()
    {
        return $this->types->find();
    }

    function create()
    {
        $data = $this->readInput();
        return $this->types->create($data);
    }

    function get($id)
    {
        $result = $this->types->get($id);
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
            $result = $this->types->update($data);
        } else {
            $result = $this->error(400);
        }
        return $result;
    }

    function delete($id)
    {
        if ($id == 1)
            return $this->error(403);

        return $this->types->delete($id);
    }
}

?>