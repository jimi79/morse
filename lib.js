// user settings
var volume = 90;
var wpm = 25; // wpm
var farn = 8; // farn wpm

// some stuff 
var version = "2.2";
var url_get_new = "rest.php"; 
var text = "";
var morse_text = ""; // morse version, will be used for async shit
var morse_array;
var index = -1; // index of the current thing played/flashed 
var flash_in_progress = false;
var tic;
var farn_tic;

// sound 
var initial_delay = 0;
var volume_smooth_start = 0.0004;
var volume_smooth_end = 0.0004;
var frequency = 440;
var pause_at_beginning = 1; // in secondes 
var gainNode;
var sound_in_progress = false;

function calculate_tics() {
	tic = 60 / (50 * wpm);
	farn_tic = (60 / farn - 60 / wpm) / 6; // 4 spaces after letters (di) + 1 space after word (di * 2), i use 6 'farnworth' spaces
	console.log("tic = " + tic);
	console.log("farn_tic = " + farn_tic); 
}

function code(letter) {
	switch (letter) {
		case 'A': out = '.-'; break;
		case 'B': out = '-...'; break;
		case 'C': out = '-.-.'; break;
		case 'D': out = '-..'; break;
		case 'E': out = '.'; break;
		case 'F': out = '..-.'; break;
		case 'G': out = '--.'; break;
		case 'H': out = '....'; break;
		case 'I': out = '..'; break;
		case 'J': out = '.---'; break;
		case 'K': out = '-.-'; break;
		case 'L': out = '.-..'; break;
		case 'M': out = '--'; break;
		case 'N': out = '-.'; break;
		case 'O': out = '---'; break;
		case 'P': out = '.--.'; break;
		case 'Q': out = '--.-'; break;
		case 'R': out = '.-.'; break;
		case 'S': out = '...'; break;
		case 'T': out = '-'; break;
		case 'U': out = '..-'; break;
		case 'V': out = '...-'; break;
		case 'W': out = '.--'; break;
		case 'X': out = '-..-'; break;
		case 'Y': out = '-.--'; break;
		case 'Z': out = '--..'; break;
		case '0': out = '-----'; break;
		case '1': out = '.----'; break;
		case '2': out = '..---'; break;
		case '3': out = '...--'; break;
		case '4': out = '....-'; break;
		case '5': out = '.....'; break;
		case '6': out = '-....'; break;
		case '7': out = '--...'; break;
		case '8': out = '---..'; break;
		case '9': out = '----.'; break;
		case '.': out = '.-.-.-'; break;
		case ',': out = '--..--'; break;
		case '?': out = '..--..'; break;
		case "'": out = '.----.'; break;
		case '!': out = '-..-.'; break;
		case '(': out = '-.--.'; break;
		case ')': out = '-.--.-'; break;
		case '&': out = '.-...'; break;
		case ':': out = '---...'; break;
		case ';': out = '-.-.-.'; break;
		case '=': out = '-...-'; break;
		case '+': out = '.-.-.'; break;
		case '-': out = '-....-'; break;
		case '_': out = '..--.-'; break;
		case '"': out = '.-..-.'; break;
		case '$': out = '...-..-'; break;
		case '@': out = '.--.-.'; break;
		case '/': out = ' '; break;
		case ' ': out = '/'; break;
		default: out = ' '; break; // unknown char
	} 
	return out;
}

function convert_to_array(morse) {
	morse_array = new Array();
	delay = 0;
	delay_after_letter = false;
	delay_after_word = false;
	delay_after_signal = false;
	for (var i = 0, len = morse.length; i < len; i++) { 
		if ((morse[i] == '.')||(morse[i] == '-')) {
			if (delay_after_word) {
				morse_array.push([0, 7, 2]); // 2 means blank, but that has to be mutiplied by farn factor
			}
			else {
				if (delay_after_letter) {
					morse_array.push([0, 3, 1]);
				}
				else {
					if (delay_after_signal) {
						morse_array.push([0, 1, 0]);
					} 
				}
			}
			delay_after_letter = false;
			delay_after_word = false;
			delay_after_signal = false; 
		} 

		if ((morse[i]) == '.') {
			morse_array.push([1, 1, 0]);
			delay_after_signal = true;
		}
		if ((morse[i]) == '-') {
			morse_array.push([1, 3, 0]);
			delay_after_signal = true;
		}
		if ((morse[i]) == ' ') {
			delay_after_letter = true;
		}
		if ((morse[i]) == '/') {
			delay_after_word = true;
		} 
	} 
	return morse_array;
} 

function convert_to_morse(text) {
	r = '';
	for (var i = 0, len = text.length; i < len; i++) { 
		letter = text[i].toUpperCase();
		r = r + code(letter) + ' '; 
	}
	return r;
}

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

function display_wpm() {
	display_config();
}

function display_farn() {
	display_config();
} 

function display_state(state) {
	div_state.innerHTML = state;
}

function display_volume() {
	display_config();
} 

function stop_flash() {
	flash_in_progress = false;
	display_block(0, 0);
	display_state('ready');
}

function stop_sound() {
	if (sound_in_progress) {
		gainNode.gain.cancelAndHoldAtTime(0);
		oscillator.stop();
		clearTimeout(timer);
		end_sound();
	}
}

function get_new() {
	display_state('loading');
	remove();
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var datas = JSON.parse(this.responseText);
			store(datas);
			answer.value = "";
		}
	};
	xmlhttp.open("GET", url_get_new, true);
	xmlhttp.send();
}

function init_components() {
	slide_wpm.value = wpm;
	slide_farn.value = farn;
	slide_volume.value = volume; 
}

function parse_text() {
	morse_text = convert_to_morse(text);
	morse_array = convert_to_array(morse_text);
	display_state(text.length + " chars loaded");
	flash_in_progress = false;
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

function request_stop_text() {
	flash_in_progress = false;
}

function reset() { 
	div_morse_as_text.innerHTML = '';
}

function set_farn(val) {
	farn = val;
	display_farn();
}

function set_wpm(val) {
	wpm = val;
	display_wpm();
}

function set_volume(val) {
	volume = val;
	display_volume();
}

function store(datas) {
	reset();
	text = datas['val'];
	parse_text();
}

function end_sound() {
	display_state('ready'); 
	sound_in_progress = false;
} 

function get_farn_factor() {
	// i choose to add one farn pause after each letter and also a farn pause of the same value after a word
}

function get_total_length(tic) { 
	total_length = pause_at_beginning * 1.0;
	for (var i = 0, len = morse_array.length; i < len; i++) { 
		val = morse_array[i];
		on = val[0];
		delay = val[1];
		total_length = total_length + (delay * tic);
		if (val[2]) {
			total_length = total_length + get_farn_factor() * 1;
		}
	} 
	return total_length;
}

function play_sound() {
	calculate_tics();
	display_state('sound in progress...'); 
	audioCtx = new(window.AudioContext); 
	oscillator = audioCtx.createOscillator();
	gainNode = audioCtx.createGain(); 
	sound_in_progress = true;
	used_volume_smooth_start = volume_smooth_start;
	used_volume_smooth_end = volume_smooth_end; 
	oscillator.connect(gainNode);
	gainNode.connect(audioCtx.destination);
	time = audioCtx.currentTime;
	gainNode.gain.setValueAtTime(0, time); 
	oscillator.start(); 
	time = time + pause_at_beginning; 
	add_pause_to_next = false;
	for (var i = 0, len = morse_array.length; i < len; i++) { 
		val = morse_array[i];
		gainNode.gain.setTargetAtTime(volume * val[0] / 100, time, used_volume_smooth_start); 
		time = time + val[1] * tic + val[2] * farn_tic;
	}
	gainNode.gain.setTargetAtTime(0, time, used_volume_smooth_end);
	time = time + 0.2; 
	timer = setTimeout(end_sound, time * 1000);
}

window.onload = function() {
	display_state('click on Load'); // will disappear if get_new called after
	display_version();
	display_config();
	display_block(0, 0);
	init_components();
	get_new();
} 
