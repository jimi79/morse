var farn = 25;
var wpm = 25;
var wordsCount = 10;
var text = "";
var datas;
var words;
var current_word_index;
var count = 0;
var win = 0;

function display_score() {
	div_score.innerHTML = win + "/" + count + " " + Math.floor(win / count * 100);
	console.log('score printed?');
}

function test() {
	text = "this";
	parse_text();
	play_sound();
}

function display_speed() {
	div_speed.innerHTML = wpm + "/" + farn;
}

function set_farn(value) {
	farn = value;
	display_speed();
}

function set_wpm(value) {
	wpm = value;
	display_speed();
}

function process_db(response) { 
	datas = JSON.parse(response.responseText); 
	display_state('ready');
	return datas[Math.floor(Math.random() * datas.length)]
}

function pick_random_word_all() {
	return Math.floor(Math.random() * datas.length);
}

function pick_random_word_10() { 
	current_word_index = Math.floor(Math.random() * words.length);
	text = words[current_word_index];
	parse_text();
}

function event_end_sound() {
}

function randomize() {
	words = [];
	picked = [];
	for (i = 0; i < wordsCount; i++) {
		index_word = 0;
		tries = 0;
		while ((picked.indexOf(index_word) != -1) && (tries < 10)) { 
			index_word = pick_random_word_all();
			tries = tries + 1;
		}
		picked[i] = index_word;
		word = datas[index_word];
		words[i] = word;
		document.getElementById("choice" + i).value = word;
	}
}

function load_db() {
	display_state('loading');
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			process_db(this);
		}
	};
	xmlhttp.open("GET", "rest.php?common", true);
	xmlhttp.send();

}

function display_state(state) {
	div_state.innerHTML = state;
}

function init_components() {
	slide_wpm.value = wpm;
	slide_farn.value = farn;
} 

function play_new_word() { 
	pick_random_word_10();
	play_sound();
	console.log(text);
}

function pick_choice(index) {
	stop_sound();
	if (index == current_word_index) {
		win = win + 1;
		display_state('good');
		play_new_word();
	} else {
		display_state('bad');
		play_sound();
	}
	count = count + 1;
	display_score();

}

window.onload = function() {
	init_components();
	load_db();
	display_speed();
}
