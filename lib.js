// user settings
var volume = 90;
var wpm = 25; // wpm
var farn = 8; // farn wpm

// some stuff 
var version = "2.2";
var text = ""; // text to play
var morse_text = ""; // morse version, with . and -
var morse_array; // detailed morse
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

function stop_sound() {
	if (sound_in_progress) {
		gainNode.gain.cancelAndHoldAtTime(0);
		oscillator.stop();
		clearTimeout(timer);
		end_sound();
	}
}

function parse_text() {
	morse_text = convert_to_morse(text);
	morse_array = convert_to_array(morse_text);
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

function end_sound() {
	sound_in_progress = false;
	event_end_sound();
}
