//From this guy's site, it's MIT licensed 
/* Date/Time Format v0.2; MIT-style license
By Steven Levithan <http://stevenlevithan.com> */

//See https://developer.mozilla.org/en/Using_JavaScript_code_modules for explanation
let EXPORTED_SYMBOLS = ["DateFormat"];

var DateFormat = new Date();

DateFormat.format = function(mask) {
	var d = this; // Needed for the replace() closure
	
	// If preferred, zeroise() can be moved out of the format() method for performance and reuse purposes
	var zeroize = function (value, length) {
		if (!length) length = 2;
		value = String(value);
		for (var i = 0, zeros = ''; i < (length - value.length); i++) {
			zeros += '0';
		}
		return zeros + value;
	};
	
	return mask.replace(/"[^"]*"|'[^']*'|\b(?:d{1,4}|m{1,4}|yy(?:yy)?|([hHMs])\1?|TT|tt|[lL])\b/g, function($0) {
		switch($0) {
			case 'd':	return d.getDate();
			case 'dd':	return zeroize(d.getDate());
			case 'ddd':	return ['Sun','Mon','Tue','Wed','Thr','Fri','Sat'][d.getDay()];
			case 'dddd':	return ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][d.getDay()];
			case 'm':	return d.getMonth() + 1;
			case 'mm':	return zeroize(d.getMonth() + 1);
			case 'mmm':	return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()];
			case 'mmmm':	return ['January','February','March','April','May','June','July','August','September','October','November','December'][d.getMonth()];
			case 'yy':	return String(d.getFullYear()).substr(2);
			case 'yyyy':	return d.getFullYear();
			case 'h':	return d.getHours() % 12 || 12;
			case 'hh':	return zeroize(d.getHours() % 12 || 12);
			case 'H':	return d.getHours();
			case 'HH':	return zeroize(d.getHours());
			case 'M':	return d.getMinutes();
			case 'MM':	return zeroize(d.getMinutes());
			case 's':	return d.getSeconds();
			case 'ss':	return zeroize(d.getSeconds());
			case 'l':	return zeroize(d.getMilliseconds(), 3);
			case 'L':	var m = d.getMilliseconds();
					if (m > 99) m = Math.round(m / 10);
					return zeroize(m);
			case 'tt':	return d.getHours() < 12 ? 'am' : 'pm';
			case 'TT':	return d.getHours() < 12 ? 'AM' : 'PM';
			// Return quoted strings with the surrounding quotes removed
			default:	return $0.substr(1, $0.length - 2);
		}
	});
};
 
