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
        $date_regex = '#([0-9]{4}-[0-9]{1,2})#';
        $params = $this->params();

        if (isset($params['date'])) {
            $from = $params['date'];
            $to = $params['date'];
        } else {
            $from = isset($params['from']) ? $params['from'] : date('Y').'-'.date('m');
            $to = isset($params['to']) ? $params['to'] : date('Y').'-'.date('m');
        }

        if (!preg_match($date_regex, $from, $from_m))
            return $this->error(400, 'Invalid date range');

        if (!preg_match($date_regex, $to, $to_m))
            return $this->error(400, 'Invalid date range');

        $from = date("Y-m-d", strtotime($from_m[1].'-1'));
        $to = date("Y-m-t", strtotime($to_m[1].'-1'));

        $result = $this->items->find(['from' => $from, 'to' => $to]);

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
