<?php
require_once(__DIR__ . '/controller.php');
require_once(__DIR__ . '/items-model.php');

Class ItemsController extends Controller
{
    private $items;

    function __construct($params)
    {
        $this->items = new ItemsModel($params);
    }

    function find()
    {
        $params = $this->params();
        $date = isset($params['date']) ? $params['date'] : date('Y').'-'.date('m');

        if (preg_match('#([0-9]{4})-([0-9]{1,2})#', $date, $m))
            $result = $this->items->find(['year' => $m[1], 'month' => $m[2]]);
        else
            $result = $this->error(400, 'Invalid date range');

        return $result;
    }

    function create()
    {
        $data = $this->readInput();

        if (is_array($data)) {
            $this->items->begin();

            $results = [];
            foreach ($data as $item)
                $results[] = $this->items->create($item);

            $this->items->commit();

            return $results;
        } else {
            return $this->items->create($data);
        }
    }

    function get($id)
    {
        $result = $this->items->get($id);

        if (!$result)
            $result = $this->error(404);

        return $result;
    }

    function update($id)
    {
        $data = $this->readInput();

        if (isset($data->id) && $data->id == $id)
            $result = $this->items->update($id, $data);
        else
            $result = $this->error(400, 'Invalid request');

        return $result;
    }

    function delete($id)
    {
        return $this->items->delete($id);
    }
}

?>