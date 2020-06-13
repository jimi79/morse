<?php

$method = $_SERVER['REQUEST_METHOD'];
switch ($method) {
	case 'GET':
		exec('/usr/games/fortune', $array, $status);
		#$array = array();
		#array_push($array, "coucou");
		#array_push($array, "test");
	
		//$res=a]rray('val'=>implode('\n', array_slice($array,2)));
		$s1 = implode("\n", $array);
		$s2 = preg_replace("(\n)", " ", $s1);
		#printf("<pre>%s</pre><br>", $s2);
		$s2 = preg_replace("(')", " ", $s2);
		#printf("<pre>%s</pre><br>", $s2);
		$s2 = preg_replace("([^A-Za-z0-9.\s])", "", $s2);
		#printf("<pre>%s</pre><br>", $s2);
		$res = array('val'=>$s2, 'debug'=>$s1);
		break;
	case 'PUT': case 'POST': case 'DELETE':
		$res=array('err'=>'not handled');
} 
print(json_encode($res));

?>
