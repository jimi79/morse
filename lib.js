var url_get_new = "rest.php"; 
var text = "";
var morse_text = ""; // morse version, will be used for async shit
var morse_array;
var index = -1; // index of the current thing played/flashed 
var flash_in_progress = false;

// sound 
var volume = 0.5;
var initial_delay = 0;
var volume_smooth_start = 0.0004;
var volume_smooth_end = 0.0004;
var frequency = 440;
var pause_at_beginning = 1; // in secondes

var speed = 25; // in wpm
var fan_pause = 1; // fansworth like factor 
var speed_direction = 0; // 1 for more, -1 for less

var audioCtx = new(window.AudioContext);

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
	// in morse, i have something like
	//      .-- .... .- - / - .... . / ..-. ..- -.-. -.-

	// delay to wayt = 0

	// if i have a ., i play delay, reset it, play tic, and tic will be added to delay
	// if i have a -, i play delay, reset it, play 3tic, and tic will be added to delay
	// if i have a  , i add 3tic to delay
	// if i have a /, i add 1tic to delay (because it's space slash space, so that will be 7)




	morse_array = new Array();

	// and i need an index
	delay = 0;
	delay_after_letter = false;
	delay_after_word = false;
	delay_after_signal = false;
	for (var i = 0, len = morse.length; i < len; i++) { 
		//console.log(delay + ' ' + morse[i]);

		if ((morse[i] == '.')||(morse[i] == '-')) {
			if (delay_after_word) {
				morse_array.push([2, 7]); // 2 means blank, but that has to be mutiplied by fan factor
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

function display() {
	item = document.getElementById('text');
	item.innerHTML = text;
	display_state('displayed'); 
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

function display_speed() {
	item = document.getElementById('speed');
	item.innerHTML = 'wpm = ' + speed;
}

function display_fan_pause() {
	item = document.getElementById('fan_pause');
	item.innerHTML = 'pause factor = ' + fan_pause;
} 

function display_state(state) {
	item = document.getElementById('state');
	item.innerHTML = state;
}

function display_volume() {
	item = document.getElementById('volume');
	item.innerHTML = "volume = " + volume;
}


function do_default_speed() {
	speed = 25;
	speed_direction = 0;
	display_speed();
}

function do_speed_change(direction) {
	if (speed_direction != direction) {
		speed_direction = direction;
		speed_change =0; }
	switch (speed_change) {
		case 0: speed_change=1;break;
		case 1: speed_change=2;break;
		case 2: speed_change=5;break;
		case 5: speed_change=10;break;
	}
	speed = speed + (speed_change * direction); 
	if (speed < 1) { speed = 1; }
	if (speed > 1000) { speed = 1000; }
	display_speed();
}

function stop_flash() {
	flash_in_progress = false;
	display_block(0, 0);
	display_state('flash stopped');
}

function faster() {
	do_speed_change(1)
}

function flash(on) {
	display_block(1, on);
} 

function get_new() {
	display_state('loading');
	remove();
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var datas = JSON.parse(this.responseText);
			store(datas);
		}
	};
	xmlhttp.open("GET", url_get_new, true);
	xmlhttp.send();
}

function parse_text() {
	morse_text = convert_to_morse(text);
	morse_array = convert_to_array(morse_text);
	display_state('loaded');
	flash_in_progress = false;
} 

function play_flash() {
	if (!flash_in_progress) {
		display_state('flash started');
		index = -1;
		flash_in_progress = true;
		setTimeout(process_flash, initial_delay);
	}
	else {
		alert('Already running');
	}
}

function process_flash() {
	tic = 1200 / speed;
	if (flash_in_progress) {
		index = index + 1;
		item = morse_array[index];
		on = item[0];
		delay = item[1] * tic;
		if (on == 2) {
			on = 0;
			delay = delay * fan_pause;
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

function set_fan_pause(val) {
	fan_pause = val;
	display_fan_pause();
}

function set_speed(val) {
	speed = val;
	display_speed();
}

function set_volume(val) {
	volume = val;
	display_volume();
}

function slower() {
	do_speed_change(-1)
}

function store(datas) {
	reset();
	text = datas['val'];
	parse_text();
}

function stop_sound() {
	display_state('sound stopped'); 
	console.log('stop');
}


function get_total_length(tic) {

	total_length = pause_at_beginning * 1.0;
	for (var i = 0, len = morse_array.length; i < len; i++) { 
		val = morse_array[i];
		on = val[0];
		delay = val[1];
		if (on == 2) {
			on = 0;
			delay = delay * fan_pause; 
		}
		total_length = total_length + (delay * tic / 1000);
	} 
	return total_length;
}




function play_sound() {
	display_state('sound started'); 

	var oscillator = audioCtx.createOscillator();
	var gainNode = audioCtx.createGain(); 
	used_volume_smooth_start = volume_smooth_start;
	used_volume_smooth_end = volume_smooth_end; 
	oscillator.connect(gainNode);
	gainNode.connect(audioCtx.destination);
	time = audioCtx.currentTime;
	gainNode.gain.setValueAtTime(0, time); 
	tic = 1200 / speed; 
	setTimeout(stop_sound, get_total_length(tic) * 1000); // that is in ms 
	oscillator.start(); 
	time = time + pause_at_beginning; 
	for (var i = 0, len = morse_array.length; i < len; i++) { 
		val = morse_array[i];
		on = val[0];
		delay = val[1];
		if (on == 2) {
			on = 0;
			delay = delay * fan_pause; 
		}
		if (on == 1) {
			gainNode.gain.setTargetAtTime(volume, time, used_volume_smooth_start); // that is in sec
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
	display_speed();
	display_fan_pause();
	display_block(0, 0);
	display_volume();
	get_new();
}



function test() {
	oscillator.start();
}
