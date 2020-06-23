<html>
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<link rel="stylesheet" href="style.css" />
<title>Morse</title>
</head>
<script src="lib.js"></script> 
<script src="exercices.js"></script> 
<body>
<div id="div_state"></div>
<div id="div_speed"></div>
wpm 
<input id="slide_wpm" style="width:100%" type="range" min="10" max="25" step="1" onInput="set_wpm(this.value)"/>
<br/> 
Farnrwsorth
<input id="slide_farn" style="width:100%" type="range" min="1" max="25" step="1" onInput="set_farn(this.value)"/>
<br/> 
<input type="button" onclick="randomize(); play_new_word()" value="randomize and play"><br>
-------------------------------------<br>
<div id="div_score"></div>
<?php
	for ($i = 0; $i < 10; $i++) {
		printf('<br>');
		printf('<input type="button" id="choice%d" onclick="pick_choice(%d)" value="N/A"><br>', $i, $i);
	}
?>
</body>
