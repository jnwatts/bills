<?php

Class Controller
{
    private $errors = [
        400 => 'Bad request',
        403 => 'Forbidden',
        404 => 'Not found',
    ];

    function params()
    {
        return $_REQUEST;
    }

    function readInput()
    {
        return json_decode(file_get_contents("php://input"));
    }

    function error($response_code, $message = NULL)
    {
        if (is_null($message)) {
            if (array_key_exists((int)$response_code, $this->errors))
                $message = $this->errors[(int)$response_code];
            else
                $message = (string)$response_code;
        }

        http_response_code($response_code);
        return ['error' => $message];
    }
}

?>