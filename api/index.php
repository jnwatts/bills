<?php
require_once(__DIR__ . '/../config.php');
require_once(__DIR__ . '/../vendor/autoload.php');
require_once(__DIR__ . '/items-controller.php');
require_once(__DIR__ . '/types-controller.php');

$router = new AltoRouter();
$altobase = $config['base'].'api/v1';
$router->setBasePath($altobase);

$router->addRoutes([
// Items
	['GET', '/item', 'Items#find'],
	['POST', '/item', 'Items#create'],
	['GET', '/item/[i:id]', 'Items#get'],
	['PUT', '/item/[i:id]', 'Items#update'],
	['DELETE', '/item/[i:id]', 'Items#delete'],

// Types
	['GET', '/type', 'Types#find'],
	['POST', '/type', 'Types#create'],
	['GET', '/type/[i:id]', 'Types#get'],
	['PUT', '/type/[i:id]', 'Types#update'],
	['DELETE', '/type/[i:id]', 'Types#delete'],
]);

$match = $router->match();
$result = null;

if ($match) {
	$parts = explode('#', $match['target']);
	$controller = $parts[0];
	$action = $parts[1];
	$api = null;

	if ($controller == 'Items') {
		$api = new ItemsController($config);
	} else if ($controller == 'Types') {
		$api = new TypesController($config);
	} else {
		http_response_code(405);
		$result = ['error' => 'Method not allowed'];
	}

	if ($api) {
		try {
			$result = call_user_func_array([$api, $action], $match['params']);
		} catch (Exception $e) {
			http_response_code(500);
			$result = ['error' => $e->getMessage()];
		}
	}
} else {
	$result = ['error' => 'Not found'];
	http_response_code(404);
}

if ($result || (is_array($result) && count($result) == 0)) {
	echo json_encode($result);
}

?>
