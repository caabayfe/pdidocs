/**
 * Parses indented text into JS objects.
 * Unlike DiscoveryIndentedMarkup, the structure of the JS object is strictly determined by
 * the indentation of the text (which allows keys to have empty values.)
 * - Each line of the input contains a name:value pair.  Name and value are both trimmed.
 * - An indented line of text indicates that the previous line was the beginning of an object.
 *   (If the previous line had a value it gets thrown away.)
 * - Un-indenting will use the last object that was at that indent level.
 * - By default it expects indentation to be two whitespace characters
 * - Repeating a key will cause the value to be converted to an array.  This can result
 *   in unexpected behavior - some objects at a certain level may contain an array while
 *   others at the same level have a single value.
 * - Poorly formed markup is not handled gracefully.  E.g. If you skip an indentation level
 *   the object will be malformed.  (You can jump levels when going out.)
 *   
 *
 ** Example markup:
 * iscsiSession:
 *   targetIqn: iqn.com.foobar:sn.2352342
 *   device:
 *     name: sdb
 *     lun: 0
 *   device: 
 *     name: sdc
 *     name: sdd
 *     lun: 1
 * iscsiSession:
 *   device: sdb
 * iscsiSession: iscsiSession as a string
 *
 ** Example output (represented as JS):
 * {
 *   iscsiSession: [ {
 *     targetIqn:"iqn.2003-01.org.linux-iscsi.linustorvalds.x8664:sn.699acfc3c0b4",
 *     device:[
 *       { name: "sdb", lun:"0" },
 *       { name: [ "sdc", "sdd" ], lun:"1" }  // Note that 'name' is an array here
 *     ]
 *   }, {
 *     device: "sdb"
 *   },
 *   "iscsiSession as a string"
 * ] }
 */
var DiscoveryStrictIndentedMarkup = function(options) {
	options = options || {};
    this._indentLength = options.indentLength || 2;
	this._pluralRoot = options.pluralRoot;
};

DiscoveryStrictIndentedMarkup.prototype = {
	/**
	 * Converts Indented Markup into a JS object.
	 * @param string markup
	 * @return {}
	 */
	parse: function(markup) {
		var i, line, matches, indent, depth, name, value, key,
			indentLength = this._indentLength,
			output = { },
			objectStack = [ output ],
			nameStack = [ ],
			lines = markup.split('\n');

		for (i = 0; i < lines.length; i++) {
			line = lines[i];
			matches = line.match(/^(\s*)(.*)$/);
			if (!matches)
				continue;
			indent = matches[1].length || 0;
			if (indent && (indent < indentLength))
				indentLength = indent;
			depth = indent/indentLength;

			matches = matches[2].match(/^(\w+):(.*)$/);
			if (!matches)
				continue;

			name = matches[1].trim();
			value = matches[2].trim();

			// If this line is indented more than the previous line, set
			// the value from the previous line to a new object, put the new
			// object and the current name on the stack.
			if (depth > objectStack.length-1) {
				objectStack.push(setValueInObject({ }));
				nameStack.push(name);
			}
			
			// If this line is indented less than the previous level just
			// revert to the object and last name used at that level
			if (depth < objectStack.length-1) {
				objectStack.length = depth + 1;
				nameStack.length = depth + 1;
			}

			// Current object and name have been set correctly, so just put
			// the current value into the current object.
			nameStack[depth] = name;
			setValueInObject(value);
		}

		if (this._pluralRoot) {
			for (key in output) {
				if (!(output[key] instanceof Array))
					output[key] = [output[key]];
			}
		}

		return output;

		// Put 'value' into the current object using the current name.
		function setValueInObject(value) {
			var o = objectStack[objectStack.length-1],
				name = nameStack[nameStack.length-1];

			if (!o.hasOwnProperty(name) || ((typeof value == 'object') && (typeof o[name] != 'object')))
				o[name] = value;
			else {
				if (!(o[name] instanceof Array))
					o[name] = [ o[name] ];

				if (typeof value == 'object' || typeof o[name][0] != 'object')
					o[name].push(value);
			}

			return value;
		}
	},

	type: 'DiscoveryStrictIndentedMarkup'
};
