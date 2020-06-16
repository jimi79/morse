// user settings
var volume = 90;
var wpm = 20; // in wpm
var farn_pause = 4; // farnsworth like factor 

// some stuff 
var url_get_new = "rest.php"; 
var text = "";
var morse_text = ""; // morse version, will be used for async shit
var morse_array;
var index = -1; // index of the current thing played/flashed 
var flash_in_progress = false;

// sound 
var initial_delay = 0;
var volume_smooth_start = 0.0004;
var volume_smooth_end = 0.0004;
var frequency = 440;
var pause_at_beginning = 1; // in secondes 

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
				morse_array.push([2, 7]); // 2 means blank, but that has to be mutiplied by farn factor
			}
			else {
				if (delay_after_letter) {
					morse_array.push([2, 3]);
				}
				else {
					if (delay_after_signal) {
						morse_array.push([0, 1]);
					} 
				}
			}
			delay_after_letter = false;
			delay_after_word = false;
			delay_after_signal = false; 
		} 

		if ((morse[i]) == '.') {
			morse_array.push([1, 1]);
			delay_after_signal = true;
		}
		if ((morse[i]) == '-') {
			morse_array.push([1, 3]);
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
	item = document.getElementById('text');
	item.innerHTML = text;
}

function display_config() {
	item = document.getElementById('config');
	item.innerHTML = "wpm " + wpm + ", farn " + farn_pause + ", vol " + volume + "%"; 
}

function display_block(here, visible) {
	if (here == 0) {
		document.getElementById('morse_as_block').style.display = "none"; 
	}
	else { 
		document.getElementById('morse_as_block').style.display = "block";
	}
	if (visible == 0) {
		document.getElementById('morse_as_block').style.visibility = "hidden"; 
	}
	else { 
		document.getElementById('morse_as_block').style.visibility = "visible"; 
	} 
}

function display_morse() {
	item = document.getElementById('morse_as_text');
	item.innerHTML = morse_text; 
}

function display_wpm() {
	//item = document.getElementById('wpm');
	//item.innerHTML = 'wpm = ' + speed;
	display_config();
}

function display_farn_pause() {
	//item = document.getElementById('farn_pause');
	//item.innerHTML = 'pause factor = ' + farn_pause;
	display_config();
} 

function display_state(state) {
	item = document.getElementById('state');
	item.innerHTML = state;
}

function display_volume() {
	//item = document.getElementById('volume');
	//item.innerHTML = "volume = " + volume;
	display_config();
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
	slide_farn_pause.value = farn_pause;
	slide_volume.value = volume; 
}

function parse_text() {
	morse_text = convert_to_morse(text);
	morse_array = convert_to_array(morse_text);
	display_state('ready');
	flash_in_progress = false;
} 

function play_flash() {
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
	tic = 1200 / wpm;
	if (flash_in_progress) {
		index = index + 1;
		item = morse_array[index];
		on = item[0];
		delay = item[1] * tic;
		if (on == 2) {
			on = 0;
			delay = delay * farn_pause;
		}
		display_block(1, on); 
		if (index < morse_array.length - 1) {
			setTimeout(process_flash, delay); }
		else { flash_in_progress = false; } 
	}

	if (!flash_in_progress) {
		stop_flash();
	}
}

function remove() {
	item = document.getElementById('text');
	item.innerHTML = "";
}

function request_stop_text() {
	flash_in_progress = false;
}

function reset() { 
	item = document.getElementById('morse_as_text');
	item.innerHTML = '';
}

function set_farn_pause(val) {
	farn_pause = val;
	display_farn_pause();
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

function stop_sound() {
	display_state('ready'); 
} 

function get_total_length(tic) { 
	total_length = pause_at_beginning * 1.0;
	for (var i = 0, len = morse_array.length; i < len; i++) { 
		val = morse_array[i];
		on = val[0];
		delay = val[1];
		if (on == 2) {
			on = 0;
			delay = delay * farn_pause; 
		}
		total_length = total_length + (delay * tic / 1000);
	} 
	return total_length;
}

function play_sound() {
	display_state('sound in progress...'); 
	var audioCtx = new(window.AudioContext); 
	var oscillator = audioCtx.createOscillator();
	var gainNode = audioCtx.createGain(); 
	used_volume_smooth_start = volume_smooth_start;
	used_volume_smooth_end = volume_smooth_end; 
	oscillator.connect(gainNode);
	gainNode.connect(audioCtx.destination);
	time = audioCtx.currentTime;
	gainNode.gain.setValueAtTime(0, time); 
	tic = 1200 / wpm; 
	setTimeout(stop_sound, get_total_length(tic) * 1000); // that is in ms 
	oscillator.start(); 
	time = time + pause_at_beginning; 
	for (var i = 0, len = morse_array.length; i < len; i++) { 
		val = morse_array[i];
		on = val[0];
		delay = val[1];
		if (on == 2) {
			on = 0;
			delay = delay * farn_pause; 
		}
		if (on == 1) {
			gainNode.gain.setTargetAtTime(volume/100, time, used_volume_smooth_start); // that is in sec
		}
		if (on == 0) {
			gainNode.gain.setTargetAtTime(0, time, used_volume_smooth_end);
		}
		time = time + (delay * tic / 1000);
	}
	gainNode.gain.setTargetAtTime(0, time, used_volume_smooth_end);
	time = time + 0.2;
}

window.onload = function() {
	display_state('click on Load'); // will disappear if get_new called after
	display_config();
	display_block(0, 0);
	get_new();
} 
