<?php


function common() {
	// read the csv and send it as an array
	// source: http://corpus.leeds.ac.uk/frqc/internet-en.num
	$handle = fopen("common.lst", "r");
	$array = array();
	while ($line = trim(fgets($handle))) {
		array_push($array, $line); 
	}
	fclose($handle);
	return $array;
}


$method = $_SERVER['REQUEST_METHOD'];
switch ($method) {
	case 'GET':
		{
			if (isset($_GET['fortune'])) {
				exec('/usr/games/fortune', $array, $status);
				$s1 = implode("\n", $array);
				$s2 = preg_replace("(\n)", " ", $s1);
				$s2 = preg_replace("(')", "", $s2);
				$s2 = preg_replace("([^A-Za-z0-9.\s])", "", $s2);
				$res = array('val'=>$s2, 'debug'=>$s1);
				break;
			}

			if (isset($_GET['common'])) {
				$res = common();
				break;
			}
		}

	case 'PUT': case 'POST': case 'DELETE':
		$res=array('err'=>'not handled');
} 
print(json_encode($res));

?>
