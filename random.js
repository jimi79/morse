var index = -1; // index of the current thing played/flashed 
var flash_in_progress = false;

function display_text() {
	div_text.innerHTML = text;
}

function display_config() {
	div_config.innerHTML = "wpm " + wpm + "/" + farn;
}

function display_version() {
	div_version.innerHTML = "version " + version;
}

function display_block(here, visible) {
	if (here == 0) {
		div_morse_as_block.style.display = "none"; 
	}
	else { 
		div_morse_as_block.style.display = "block";
	}
	if (visible == 0) {
		div_morse_as_block.style.visibility = "hidden"; 
	}
	else { 
		div_morse_as_block.style.visibility = "visible"; 
	} 
}

function display_morse() {
	div_morse_as_text.innerHTML = morse_text; 
}

function display_state(state) {
	div_state.innerHTML = state;
}

function stop_flash() {
	flash_in_progress = false;
	display_block(0, 0);
	display_state('ready');
}

function get_new() {
	display_state('loading');
	remove();
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			datas = JSON.parse(this.responseText);
			receive_text(datas);
			answer.value = "";
		}
	};
	xmlhttp.open("GET", "rest.php?fortune", true);
	xmlhttp.send();
}

function init_components() {
	slide_wpm.value = wpm;
	slide_farn.value = farn;
	slide_volume.value = volume; 
}

function play_flash() {
	calculate_tics();
	if (!flash_in_progress) {
		display_state('flash in progress');
		index = -1;
		flash_in_progress = true;
		setTimeout(process_flash, initial_delay);
	}
	else {
		alert('Already running');
	}
}

function process_flash() {
	if (flash_in_progress) {
		index = index + 1;
		val = morse_array[index];
		delay = val[1] * tic + val[2] * farn_tic;
		display_block(1, val[0]); 
		if (index < morse_array.length - 1) {
			setTimeout(process_flash, delay * 1000); }
		else { flash_in_progress = false; } 
	}

	if (!flash_in_progress) {
		stop_flash();
	}
}

function remove() {
	div_text.innerHTML = "";
}

function set_farn(val) {
	farn = val;
	display_config();
}

function set_wpm(val) {
	wpm = val;
	display_config();
}

function event_end_sound() { // has to be implemented
	display_state('ready'); 
	sound_in_progress = false;
} 

function start_sound() {
	display_state('sound in progress...'); 
	play_sound();
}

function receive_text() {
	reset();
	text = datas['val'];
	parse_text();
	display_state(text.length + " chars loaded");
	flash_in_progress = false;
} 

function request_stop_text() {
	flash_in_progress = false;
}

function reset() { 
	div_morse_as_text.innerHTML = '';
}

window.onload = function() {
	display_state('click on Load'); // will disappear if get_new called after
	display_version();
	display_config();
	display_block(0, 0);
	init_components();
	get_new();
}
