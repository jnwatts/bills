<?php

abstract class Model
{
    // *** Class variables
    protected $conn;
    protected $columns = [];
    
    function __construct($params)
    {
        $this->open($params);
    }

    function __destruct()
    {
        $this->close();
    }

    public abstract function find($params = []);
    public abstract function get($id);
    public abstract function create($data);
    public abstract function update($id, $data);
    public abstract function delete($id);

    protected function open($params)
    {
        $conn = new mysqli($params['host'], $params['user'], $params['pass']);
        if ($conn->connect_error) {
            $this->error("Connection failed: " . $conn->connect_error);
        }
        if (!$conn->select_db($params['database'])) {
            $this->error("Database not found");
        }
        $this->conn = $conn;
    }

    protected function close()
    {
        if ($this->conn) {
            $this->conn->close();
        }
    }

    function begin()
    {
        $this->conn->autocommit(FALSE);
    }

    function commit()
    {
        $this->conn->commit();
    }

    function rollback()
    {
        $this->conn->rollback();
    }

    protected function error($msg, $code=NULL)
    {
        if (is_int($code)) {
            http_response_code($code);
        }
        die($msg);
    }

    protected function validColumn($column)
    {
        $cols = $this->columns;
        if ($cols)
            return in_array($column, $cols);
        return false;
    }
}