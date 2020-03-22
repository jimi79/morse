<?php

$method = $_SERVER['REQUEST_METHOD'];
switch ($method) {
	case 'GET':
		exec('/usr/games/fortune', $array, $status);
		//$res=array('val'=>implode('\n', array_slice($array,2)));
		$res=array('val'=>implode('\n', $array));
		break;
	case 'PUT': case 'POST': case 'DELETE':
		$res=array('err'=>'not handled');
} 
print(json_encode($res));

?>
