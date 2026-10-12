ms.include("PrototypeServer");

var JSON = Class.create();

// Ported from the YUI library's json-parse shim code (BSD licensed).
// http://yuilibrary.com/yui/docs/api/files/json_js_parse-shim.js.html
JSON._UNSAFE = /[^\],:{}\s]/;
JSON._BRACKETS = /(?:^|:|,)(?:\s*\[)+/g;
JSON._VALUES = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
JSON._ESCAPES = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
JSON._UNICODE_EXCEPTIONS = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

/**
 * Encodes a JS object into string JSON.
 * @param {} obj
 * @return string The JSON string
 */
JSON.stringify = function(obj, replacer) {
	if (typeof JSON._singleton === 'undefined')
		JSON._singleton = new JSON();
	
	return JSON._singleton.encode(obj, replacer);
};

/**
 * Parses a JSON string and returns the parsed JS data.
 * @param string json
 * @return {}
 * @throws Error On Invalid or illegal JSON format
 */
JSON.parse = function(json) {
	json = '' + json;
	json = json.replace(JSON._UNICODE_EXCEPTIONS, JSON._escapeException);
	
	// create a filtered string for validity testing
	var filtered = json.replace(JSON._ESCAPES, '@')
	.replace(JSON._VALUES, ']')
	.replace(JSON._BRACKETS, '');
	
	// throw an exception if the filtered string is unsafe
	if (JSON._UNSAFE.test(filtered))
		throw 'JSON.parse';
	
	// evaluate and return the json object
	var obj = eval('(' + json + ')');
	return obj;
};

JSON._escapeException = function(c) {
	return '\\u'+('0000'+(+(c.charCodeAt(0))).toString(16)).slice(-4);
};

JSON.prototype = {
  sChars: {
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
  },

  initialize: function() {

  },

  pad: function(n) {
        return n < 10 ? "0" + n : n;
  },
    
  encodeString: function(s){
        s = '' + s;
        if (/["\\\x00-\x1f]/.test(s)) {
            return '"' + s.replace(/([\x00-\x1f\\"])/g, function(a, b) {
                var c = JSON.prototype.sChars[b];
                if(c){
                    return c;
                }
                c = b.charCodeAt();
                return "\\u00" +
                    Math.floor(c / 16).toString(16) +
                    (c % 16).toString(16);
            }) + '"';
        }
        return '"' + s + '"';
  },
    
  encodeArray: function(o, replacer){
        var a = ["["], b, i, l = o.length, v;
            for (i = 0; i < l; i += 1) {
                v = o[i];

				if (replacer)
					v = replacer(i, v);

				switch (typeof v) {
                    case "undefined":
                    case "function":
                    case "unknown":
                        break;
                    default:
                        if (b) {
                            a.push(',');
                        }
                        a.push(v === null ? "null" : this.encode(v, replacer));
                        b = true;
                }
            }
            a.push("]");
            return a.join("");
  },

  encodeObject: function(o, replacer) {
    var a = ["{"], b, i, v;

    for (i in o) {
        if(o.hasOwnProperty(i)) {
            v = o[i];
			
			if (replacer)
				v = replacer(i, v);

            switch (typeof v) {
                case "undefined":
                case "function":
                case "unknown":
                     break;
                default:
                     if (b) {
                         a.push(',');
                     }
                     a.push(this.encode(i), ":", v === null ? "null" : this.encode(v, replacer));
                     b = true;
            }
        }
    }

    a.push("}");
    return a.join("");
  },
    
  encodeDate: function(o){
        return '"' + o.getFullYear() + "-" +
                this.pad(o.getMonth() + 1) + "-" +
                this.pad(o.getDate()) + "T" +
                this.pad(o.getHours()) + ":" +
                this.pad(o.getMinutes()) + ":" +
                this.pad(o.getSeconds()) + '"';
  },

  encode: function(o, replacer) {
	  
        if (typeof o == "undefined" || o === null) {
            return "null";
        } else if (o instanceof Array) {
            return this.encodeArray(o, replacer);
        } else if (o instanceof Date) {
            return this.encodeDate(o);
        } else if (typeof o == "string" || o instanceof String) {
            return this.encodeString(o);
        } else if (typeof o == "number") {
            return isFinite(o) ? String(o) : "null";
        } else if (typeof o == "boolean") {
            return String(o);
        } else {
            return this.encodeObject(o, replacer);
        }
  },

  decode: function(source, reviver) {
      var parser = new JSONParser();
      return parser.parse(source, reviver);
  },

  type: "JSON"
}
