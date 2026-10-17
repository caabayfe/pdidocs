/**
 * GQ is a utility class intended for use with GlideQuery
 * @namespace
 */
function GQ() {}

/**
 * Returns the values of an Object
 * @param {Object} obj Object
 * @returns {Array}
 */
GQ.values = function values(obj) {
	var values = [];
	for (var i in obj) {
		values.push(obj[i]);
	}
	return values;
};

GQ._partial1 = function (fn) {
	return function (a) {
		if (arguments.length === 0) {
			return fn;
		}

		return fn(a);
	};
};

GQ._partial2 = function (fn) {
	return function (a, b) {
		if (arguments.length >= 2) {
			return fn(a, b);
		}

		if (arguments.length === 1) {
			return GQ._partial1(function (_b) {
				return fn(a, _b);
			});
		}

		return fn;
	};
};

GQ._partial3 = function (fn) {
	return function (a, b, c) {
		if (arguments.length >= 3) {
			return fn(a, b, c);
		}

		if (arguments.length === 2) {
			return GQ._partial1(function (_c) {
				return fn(a, b, _c);
			});
		}

		if (arguments.length === 1) {
			return GQ._partial2(function (_b, _c) {
				return fn(a, _b, _c);
			});
		}

		return fn;
	};
};

GQ._partial4 = function (fn) {
	return function (a, b, c, d) {
		if (arguments.length === 4) {
			return fn(a, b, c, d);
		}

		if (arguments.length === 3) {
			return GQ._partial1(function (_d) {
				return fn(a, b, c, _d);
			});
		}

		if (arguments.length === 2) {
			return GQ._partial2(function (_c, _d) {
				return fn(a, b, _c, _d);
			});
		}

		if (arguments.length === 1) {
			return GQ._partial3(function (_b, _c, _d) {
				return fn(a, _b, _c, _d);
			});
		}

		return fn;
	};
};

GQ._partial5 = function (fn) {
	return function (a, b, c, d, e) {
		if (arguments.length === 5) {
			return fn(a, b, c, d, e);
		}

		if (arguments.length === 4) {
			return GQ._partial1(function (_e) {
				return fn(a, b, c, d, _e);
			});
		}

		if (arguments.length === 3) {
			return GQ._partial2(function (_d, _e) {
				return fn(a, b, c, _d, _e);
			});
		}

		if (arguments.length === 2) {
			return GQ._partial3(function (_c, _d, _e) {
				return fn(a, b, _c, _d, _e);
			});
		}

		if (arguments.length === 1) {
			return GQ._partial4(function (_b, _c, _d, _e) {
				return fn(a, _b, _c, _d, _e);
			});
		}

		return fn;
	};
};

/**
 * Takes a function and returns the function in partially applicable form.
 * Can only take functions with up to 5 parameters.
 * @example
 * var add = function (x, y) { return x + y; };
 * var partialAdd = GQ.partial(add);
 *
 * var addFive = partialAdd(5);
 * var seven = partialAdd(5, 2);
 *
 * gs.info(addFive(2)); // 7
 * gs.info(seven);      // 7
 * @param {Function} fn
 * @returns {Function}
 */
GQ.partial = function partial(fn) {
	if (fn.length < 2) {
		return fn;
	}

	if (fn.length === 2) {
		return GQ._partial2(fn);
	}

	if (fn.length === 3) {
		return GQ._partial3(fn);
	}

	if (fn.length === 4) {
		return GQ._partial4(fn);
	}

	if (fn.length === 5) {
		return GQ._partial5(fn);
	}

	NiceError.raise('GQ.partial cannot convert functions with more than 5 parameters');
};

/**
 * Returns the value of an Object for a given key. Similar to `obj.key` syntax, however
 * because `get` is partially applicable, can be handy as a mapping function.
 * @example
 * var names = new GlideQuery('sys_user')
 *     .whereNotNull('first_name')
 *     .select('first_name')
 *     .map(GQ.get('first_name'))
 *     .toArray(20);
 * @param {string} key
 * @returns {any} value
 */
GQ.get = GQ.partial(function get(key, obj) {
	return obj[key];
});

/**
 * Takes a value, calls `gs.debug()` on it, and returns the value unchanged
 * @param {any} value
 * @returns {any} Original value unchanged
 */
GQ.debug = function debug(value) {
	gs.debug(value);
	return value;
};

/**
 * Prints pretty JSON-stringified represenation of value to debug
 * @example
 * new GlideQuery('sys_user')
 *     .select('first_name', 'last_name')
 *     .map(GQ.jsonDebug)
 *     .toArray(20);
 * @param {any} value
 * @returns {any} Original value unchanged
 */
GQ.jsonDebug = function jsonDebug(value) {
	gs.debug(JSON.stringify(value, null, 2));
	return value;
};

/**
 * Prints pretty JSON-stringified represenation of value to debug. This function
 * is partially-applicable, and so can be handy in mapping functions.
 * @example
 * new GlideQuery('sys_user')
 *     .select('first_name', 'last_name')
 *     .map(GQ.labelDebug('User Info'))
 *     .toArray(20);
 * @param {string} label
 * @param {any} value
 * @returns {any} Original value unchanged
 */
GQ.labelDebug = GQ.partial(function labelDebug(label, value) {
	gs.debug(label + ': ' + JSON.stringify(value, null, 2));
	return value;
});

/**
 * Copies the key/values from object `source` to object `destination`. merge()
 * returns a new object and does not modify `source` or `destination`. merge()
 * is partially applicable.
 * @example
 * var a = { name: 'Bob', gender: 'Male' };
 * var b = { name: 'Robert', age: 90 };
 * GQ.merge(a, b) // { name: 'Robert', age: 90, gender: 'Male'}
 * @param {Object} destination
 * @param {Object} source
 * @returns {Object}
 */
GQ.merge = GQ.partial(function merge(destination, source) {
	var result = {};

	for (var rKey in destination) {
		result[rKey] = destination[rKey];
	}

	for (var lKey in source) {
		result[lKey] = source[lKey];
	}

	return result;
});
