var CMDBSet = Class.create();

CMDBSet.prototype = {

	initialize: function() {
		this._set = {};
		this._delimit = '___';
		this._autoTypes = {
            "string": true,
            "boolean": true,
            "number": true,
            "undefined": true
        };
	}, 
	
	add: function(rawKey) {
		var sKey = this._getKey(rawKey);
		if (sKey)
			this._set[sKey] = true;
	},
	
	addAll: function(arrayInput) {
		if (Array.isArray(arrayInput)) {
			var pThis = this;
			arrayInput.forEach(function (elem) {
				pThis.add(elem);
			});
		}
		return this;
	},

	remove: function(rawKey) {
		var sKey = this._getKey(rawKey);
		if (sKey)
			delete this._set[sKey];
	},
	
	clear: function() {
		this._set = {};
	},
	
	toArray: function() {
		var pThis = this;
		return Object.keys(this._set).map(function(sKey) {
			return pThis._getRawKey(sKey);
		});
	},

	has: function(rKey) {
		return this._set.hasOwnProperty(this._getKey(rKey));
	},
	
	length: function() {
		return Object.keys(this._set).length;
	},

	forEach: function(fn /*, context */) {
		// by spec, we have to type check the fn argument
		if (typeof fn !== "function") return;

		// context argument is optional, but .forEach.length is supposed to be 1 by spec
		// so we declare it this way
		var context = arguments[1];

		//invoke the fn with the raw keys
		var rKey = null;
		for(var sKey in this._set) {
			rKey = this._getRawKey(sKey);
			fn.call(context, rKey, rKey, this);
		}
	},
	/**
	 * Types where the key is created by adding an underscore and toString() to 
	 * the first three letters of the type.
	 *
	 * The first three letters of the type create a namespace for each type, 
	 * allowing us to have distinct keys for things like 10 and "10" (num 10 and "str 10," respectively).
	 */
	_getKey: function(rawKey) {
		var type = typeof rawKey, id;
		if (this._autoTypes[type]) {
			return type.substr(0, 3) + this._delimit + rawKey;
		} else if (rawKey === null) {
			return "nul_null";
		} else {
			throw new Error("Unsupported type for key: "+JSON.stringify(rawKey, null, ' '));
		}
	},
	
	_getRawKey: function(sKey) {
		var rKey = sKey.split(this._delimit)[1];
		if (rKey == 'null' || rKey == 'undefined')
			return null;
		else
			return rKey;
	},

    type: 'CMDBSet'
};
