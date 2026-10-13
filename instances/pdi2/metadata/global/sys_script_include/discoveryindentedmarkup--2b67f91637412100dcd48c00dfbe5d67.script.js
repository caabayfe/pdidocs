/**
 * Parses a very simple subset of JSON (essentially, <indent><key>: <value>) into JS objects.
 * Works with both tabs and spaces.
 * Expects indentation of two spaces/tabs.
 * Expects exactly one space between name: and value.
 *
 ** Example markup:
 * iscsiSession:
 *   targetIqn: iqn.com.foobar:sn.2352342
 *   device:
 *     name: sdb
 *     lun: 0
 *   device:
 *     name: sdc
 *     lun: 1
 *
 ** Example output (represented in JSON):
 * {
 *   "iscsiSession": {
 *     "targetIqn":"iqn.2003-01.org.linux-iscsi.linustorvalds.x8664:sn.699acfc3c0b4",
 *     "device":[
 *       {"name":"/dev/sdb","lun":"0"},
 *       {"name":"/dev/sdc","lun":"1"}
 *     ]
 *   }
 * }
 *
 **
 * @since fuji
 * @author roy.laurie
 */
var DiscoveryIndentedMarkup = function(options) {
    if (typeof options === 'undefined')
        options = {};

    this._indentLength = ( typeof options.indentLength !== 'undefined' ? options.indentLength : 2 );
	this._pluralRoot = ( typeof options.pluralRoot !== 'undefined' ? !!options.pluralRoot : false );
};

DiscoveryIndentedMarkup.prototype = {
	/**
	 * Converts Indented Markup into a JS object.
	 * @param string markup
	 * @return {}
	 */
	parse: function(markup) {
		var output = {};
		var outputMeta = {}
		var outputPtr = output;
		var parentOutputPtrs = [];
		var outputDepth = 0;
	
		var lines = markup.split("\n");
		for (var i = 0; i < lines.length; ++i) {
			var line = lines[i];
			var matches = line.match(/^(\s*)(.*)$/);
			var indent = ( matches !== null ? matches[1].length : 0 );
			var depth = ( indent !== 0 ? indent / this._indentLength : 0 );
	
			matches = matches[2].match('^(\\w+):((?: ).*)?$');
			if (!matches)
				continue;
	
			var name = matches[1].trim();
			var value = matches[2];
			
			// value should either be null or real text
			if (typeof value === 'undefined' || value === null) {
				value = null;
			} else {
				value = value.trim();
				if (value.length === 0)
					value = null;
			}
	
			if (depth < outputDepth) {
				outputPtr = parentOutputPtrs[depth];
				parentOutputPtrs = parentOutputPtrs.splice(0, depth);
			}
			
			// increase depth, re-assigned output ptr
			if (value !== null) {
				outputPtr[name] = value.trim();
			} else {
				if (typeof outputPtr[name] !== 'undefined') {
					if (Object.prototype.toString.call(outputPtr[name]) !== '[object Array]')
						outputPtr[name] = [outputPtr[name]];
	
					outputPtr[name].push({});
				} else {
					outputPtr[name] = {};
				}
	
				parentOutputPtrs.push(outputPtr);
			   
				outputPtr = outputPtr[name];
				if (Object.prototype.toString.call(outputPtr) === '[object Array]')
					outputPtr = outputPtr[outputPtr.length - 1];
			}
	
			outputDepth = depth;
		}
		
		if (this._pluralRoot) {
			for (var key in output) {
				if (Object.prototype.toString.call(output[key]) !== '[object Array]')
					output[key] = [output[key]];
			}
		}
	
		return output;
	},
	
	type: 'DiscoveryIndentedMarkup'
};
