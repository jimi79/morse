<?php

$method = $_SERVER['REQUEST_METHOD'];
switch ($method) {
	case 'GET':
		exec('/usr/games/fortune', $array, $status);
		$res=array('val'=>implode('\n', array_slice($array,2)));
		break;
	case 'PUT': case 'POST': case 'DELETE':
		$res=array('err'=>'not hanlded');
} 
print(json_encode($res));

?>
