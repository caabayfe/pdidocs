var DiscoArrayUtil = Class.create();
DiscoArrayUtil.prototype = {
	initialize: function(){
	},

	// Prefer Array.includes() over this function.
	// There are two differences in behavior:
	// 1. Array.includes() uses "SameValueZero" for comparison.
	//    This is similar to a strict comparison (===) except
	//    that it can be used to find NaN.
	// 2. This function calls convertArray() to convert Java
	//    arrays to JavaScript arrays.
	contains: function(array, element) {
		array = this.convertArray(array);
		for (var i = 0; i < array.length; i++) {
			if (array[i] == element) {
				return true;
			}
		}
		return false;
	},

	// Similar to Array.indexOf() except:
	// 1. Passing a negative startIndex to this function
	//    means to search the last x items.
	// 2. Array.indexOf() uses "SameValueZero" for comparison
	// 3. This function calls convertArray() to convert Java
	//    arrays to JavaScript arrays.
	indexOf: function(array, item, startIndex){
		array = this.convertArray(array);
		var len = array.length;
		startIndex = startIndex || 0;
		if (startIndex < 0) {
			startIndex += len;
			if (startIndex < 0)
				startIndex = 0;
		}

		if (typeof array == 'string')
			return array.indexOf(item, startIndex);

		for (var i = startIndex; i < len; i++) {
			if (array[i] == item)
				return i;
		}

		return -1;
	},

	// Ensure 'obj' is an array
	ensureArray: function(obj){
		if (obj === null || obj === undefined)
			return [ ];

		if (obj.constructor.toString().indexOf("Array") > -1)
			return obj;

		return [ obj ];
	},

	// Prefer Array.concat() over this function.
	// There are some differences in behavior:
	// 1. Array.concat() returns a new array instead of
	//    modifying its first argument
	// 2. Array.concat() accepts any number of arguments
	// 3. Array.concat() is an atomic operation (important
	//    for SN's size awareness)
	// 4. Array.concat() concatenates non-array objects (e.g. [].concat([1, 2], 3); )
	// 5. Array.concat() won't explode strings
	concat: function(parent, children){
		for (var i = 0; i < children.length; i++) {
			var item = children[i];
			parent.push(item);
		}

		return parent;
	},

	// Convert a Java array to a JavaScript array
	convertArray: function(a){
		if (typeof a.size === 'function' && a.size() > 0) {
			var newArray = new Array();
			for (var i = 0; i < a.size(); i++) {
				var val = a.get(i);
				newArray.push(val);
			}
			a = newArray;
		}

		return a;
	},

	/*
     * "subtract" one or more arrays from an array
     * diff(a,b,c)
     * will return an array of items from a that were not found in either b or c
     * Duplicate items are removed from the result
	 * Note that, despite the name of the function, the result is not a diff -
	 * it doesn't contain values that were only in 1 array.  The result is
	 * the subset of the first arg that isn't present in any subsequent argument.
     * @param two or more arrays
     * @return Array
     */
	diff: function(a /*, b, c, ...*/) {
		var result = [ ];
		var args = Array.prototype.slice.call(arguments, 1);

		a = a || [ ];
		if (!args.length)
			return a;

		a.forEach(function(v) {
			if (!args.some(function(arg) { return arg.indexOf(v) > -1; }))
				result.push(v);
		});

		return this.unique(result);
	},

	/*
     * Find the intersect between two or more arrays
     * intersect(a, b, c, ...)
     * will return an array of items from a that were also found in both b and c
     * Duplicate items are removed from the result
     * @param two or more arrays
     * @return Array
     */
	intersect: function(a /*, b, c, ...*/) {
		var result = [ ];
		var args = Array.prototype.slice.call(arguments, 1);

		a = a || [ ];
		a.forEach(function(v) {
			if (args.every(function(arg) { return arg.indexOf(v) != -1; }))
				result.push(v);
		});

		return this.unique(result);
	},

	/*
     * Merge two or more arrays together
     * union(a,b,c)
     * will return an array of items with items from all arrays, duplicate items are removed from the result
     * @param two or more arrays
     * @return Array
     */
	union: function(){
		return this.unique(Array.prototype.concat.apply([], arguments));
	},

	/*
     * Removes duplicate items from an array
     * @param Array a1
     * @return Array
     */
	unique: function(a1){
		var a = [ ];
		var values = { };

		if (!a1.length)
			return a;

		// This is equivalent to
		//    a1.every(function(v) { ... });
		// but it works on array-like objects to maintain compatibility with
		// the original code.
		if (Array.prototype.every.call(a1, function(v) { var t = typeof v; values[v + '::' + t] = v; return t != 'object' || v === null; }))
			return Object.keys(values).map(function(key) { return values[key]; });

		// This is equivalent to
		//    a1.forEach(function(v) { if (a.indexOf(v) == -1) a.push(v); });
		// but it works on array-like objects to maintain compatibility with
		// the original code.
		Array.prototype.forEach.call(a1, function(v) { if (a.indexOf(v) == -1) a.push(v); });
		return a;
	},

	type: "DiscoArrayUtil"
};
