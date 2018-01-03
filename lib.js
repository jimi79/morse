var url = "rest.php"; 
var text = "";
var morse_text = ""; // morse version, will be used for async shit
var morse_array;
var method = -1; // last method used, global because async (maybe i should create an object someday)
var index = -1; // index of the current thing played/flashed 
var initial_delay = 100;
var stop_morse = false;
var audioCtx = new(window.AudioContext || window.webkitAudioContext)();

var speed = 25; // in wpm
// T(ms) = 1200 / W(wpm)
var speed_direction = 0; // 1 for more, -1 for less

function beep(volume, frequency, type, duration) {
	var oscillator = audioCtx.createOscillator();
	var gainNode = audioCtx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
	gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime)
	gainNode.gain.setTargetAtTime(0.0, audioCtx.currentTime + duration / 1000 - 0.002, 0.002) 
  oscillator.start();
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
		case ' ': out = '/'; break;
		default: out = '/'; break;
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
	for (var i = 0, len = morse.length; i < len; i++) { 
		//console.log(delay + ' ' + morse[i]);

		if ((morse[i]) == '.') {
			if (delay > 0) {
				morse_array.push([0, delay]);
				delay = 0;
			}
			morse_array.push([1, 1]);
			delay = 1;
		}
		if ((morse[i]) == '-') {
			if (delay > 0) {
				morse_array.push([0, delay]);
				delay = 0;
			}
			morse_array.push([1, 3]);
			delay = 1;
		}
		if ((morse[i]) == ' ') {
			delay = delay + 2; // the tic after each signal addsup, that makes 3
		}
		if ((morse[i]) == '/') {
			delay = delay + 2; // a separation between two words is stored as ' / ', that makes 7
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

function display_state(state) {
	item = document.getElementById('state');
	item.innerHTML = state;
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

function do_stop_morse() {
	stop_morse = true;
}

function faster() {
	do_speed_change(1)
}

function flash(on) {
	if (method == 1) {
		display_block(1, on);
	} 
	if (method == 0) {
		// play some sound for n sec
		// beware, it's again not symmetrical...................................
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
		}
	};
	xmlhttp.open("GET", url, true);
	xmlhttp.send();
}

function parse_text() {
	morse_text = convert_to_morse(text);
	morse_array = convert_to_array(morse_text);
	display_state('loaded');
	stop_morse = false;
	// console.log(morse_text);
	// console.log(morse_array);
} 

function play(method_) {
	method = method_;
	index = -1;
	setTimeout(process_morse, initial_delay);
}

function process_morse() {
	tic = 1200 / speed;
	if (!stop_morse) {
		//console.log('process morse called');
		index = index + 1;
		item = morse_array[index];
		on = item[0];
		delay = item[1] * tic;
		//console.log("on = " + on + ", delay = " + delay);

		if (method == 0) {
			if (on == 1) {
				beep(50, 440, 0, delay); }
		}
		if (method == 1) {
			display_block(1, on);
		} 

		if (index < morse_array.length - 1) {
			setTimeout(process_morse, delay); }
		else { stop_morse = true; }

			// if method = 0, then we call that for two items.
			// if method = 1, then we call that for each items
	}

	if (stop_morse) {
		display_block(0, 0);
		stop_morse = false;

	}
}

function remove() {
	item = document.getElementById('text');
	item.innerHTML = "";
}

function reset() { 
	item = document.getElementById('morse_as_text');
	item.innerHTML = '';
}

function set_speed(val) {
	speed = val;
	display_speed();
}function sleep(ms) {
	  return new Promise(resolve => setTimeout(resolve, ms));
} 
 
function slower() {
	do_speed_change(-1)
}

function store(datas) {
	reset();
	text = datas['val'];
	parse_text();
}

window.onload = function() {
	display_state('click on Load');
	display_speed();
	//document.getElementById('morse_as_block').style.visibility = "hidden";
	//document.getElementById('morse_as_block').style.display = "none";
	// TODO hide block
	display_block(0, 0);
}

