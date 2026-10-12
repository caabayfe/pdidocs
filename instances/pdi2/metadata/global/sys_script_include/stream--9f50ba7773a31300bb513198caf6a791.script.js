/**
 * Streams are the main way of reading multiple records from a GlideQuery.
 * Calling select() from the GlideQuery API returns a Stream object which allows
 * you to transform the data in a functional style. Streams are lazy and
 * won't actually fetch data until you call one of Stream's terminal functions:
 * * find
 * * some
 * * every
 * * toArray
 * * reduce
 * * forEach
 * @constructor
 * @param {Function} nextFn Function which returns next value in Stream
 */
function Stream(nextFn) {
	this._nextFn = nextFn;
}

/**
 * Limits the number of results returned by the Stream.
 * Always prefer using GlideQuery's `limit` before Stream's
 * as filtering database-side is more performant. Mainly useful
 * when using flatMap.
 * @param {number} count
 * @returns {Stream}
 */
Stream.prototype.limit = function limit(count) {
	var i = 0;
	var nextFn = this._nextFn;
	return new Stream(function () {
		if (i >= count) {
			return Stream.END;
		}
		i += 1;
		return nextFn();
	});
};

/**
 * Causes Stream to return arrays count long instead of individual
 * items. A common use case is to batch together multiple IDs together
 * in a query with the IN operator.
 * @example
 * new GlideQuery('cmdb_ci_hardware')
 *     .select('sys_id')
 *     .map(function (device) { return device.sys_id; })
 *     .chunk(5) // returns arrays of 5 sys_ids at a time
 *     .flatMap(function (deviceIds) {
 *         return new GlideQuery('cmdb_sam_sw_install')
 *             .where('installed_on', 'IN', deviceIds)
 *             .select('software_model', 'installed_on');
 *     })
 *     .reduce(reducerFn);
 * @param {number} count
 * @returns {Stream}
 */
Stream.prototype.chunk = function chunk(count) {
	if (!JSUtil.instance_of(count, 'java.lang.Double')) {
		NiceError.raise('Stream.chunk expects an integer argument');
	}
	var nextFn = this._nextFn;
	return new Stream(function () {
		var items = [];
		var nextValue;
		var i = 0;

		do {
			nextValue = nextFn();
			if (nextValue === Stream.END) {
				return i === 0 ? Stream.END : items;
			}
			items.push(nextValue);
			i += 1;
		} while (nextValue !== Stream.END && i < count);

		return items;
	});
};

/**
 * Returns a new Stream which will apply fn to each item within it.
 * @example
 * var users = new GlideQuery('sys_user')
 *     .whereNotNull('first_name')
 *     .select('first_name')
 *     .map(function (u) { return u.first_name.toUpperCase(); })
 *     .toArray(100);
 *
 * // ["ABEL", "ABRAHAM", "ADELA", "AILEEN", ...]
 * @param {Function} fn Mapping function of type A -> B
 * @returns {Stream}
 */
Stream.prototype.map = function map(fn) {
	if (!fn) {
		NiceError.raise('Stream.map expects a mapping function of type A -> B');
	}
	var nextFn = this._nextFn;
	return new Stream(function () {
		var nextValue = nextFn();
		return nextValue === Stream.END
			? Stream.END
			: fn(nextValue);
	});
};

/**
 * Similar to `map(fn)`, but useful when fn returns a Stream itself, and
 * you want to avoid having a Stream of Streams. flatMap will return a
 * new Stream with just the values within the inner Streams.
 * @example
 * // Warning: this query is an N+1 query, querying
 * // the task table once per user. Be careful when
 * // querying within flatMap
 * var records = new GlideQuery('sys_user')
 *     .where('last_login', '>', '2015-12-31')
 *     .select('first_name', 'last_name')
 *     .flatMap(function (u) {
 *         return new GlideQuery('task')
 *             .where('closed_by', u.sys_id)
 *             .select('closed_at', 'description')
 *             .map(function (t) {
 *                 return {
 *                     first_name: u.first_name,
 *                     last_name: u.last_name,
 *                     description: t.description,
 *                     closed_at: t.closed_at
 *         };
 *     });
 * })
 * .limit(20)
 * .toArray(100);
 *
 * //    [
 * //        {
 * //            "first_name": "David",
 * //            "last_name": "Loo",
 * //            "description": "Decomission server",
 * //            "closed_at": "2018-09-28 23:52:17"
 * //        },
 * //        ...
 * //    ]
 * @param {Function} fn Mapping function of type A -> Stream<B>
 * @returns {Stream}
 */
Stream.prototype.flatMap = function flatMap(fn) {
	if (!fn) {
		NiceError.raise('Stream.flatMap expects a mapping function of type A -> Stream<B>');
	}
	var nextFn = this._nextFn;
	var stream;
	return new Stream(function () {
		if (stream !== undefined) {
			var innerStreamValue = stream._nextFn();

			if (innerStreamValue !== Stream.END) {
				return innerStreamValue;
			}
		}

		var nextValue;

		while (true) { // eslint-disable-line
			nextValue = nextFn();
			if (nextValue === Stream.END) {
				return Stream.END;
			}
			var nextStream = fn(nextValue);
			if (nextStream instanceof Stream) {
				var firstInnerStreamValue = nextStream._nextFn();
				stream = nextStream;

				if (firstInnerStreamValue !== Stream.END) {
					return firstInnerStreamValue;
				}
			} else {
				NiceError.raise('flatMap expects a fn which returns a Stream');
			}
		}
	});
};

/**
 * Filters results using predicate function. Prefer using GlideQuery's
 * `where`, `whereNotNull`, or `whereNull` whenever possible, as database
 * queries are more performant than JavaScript filtering.
 * @example
 * var shoutingTasks = new GlideQuery('task')
 *     .whereNotNull('description')
 *     .select('description')
 *     .filter(function (task) { return task.description.toUpperCase() === task.description; })
 * @param {Function} predicate Predicate function of type A -> boolean
 * @returns {Stream}
 */
Stream.prototype.filter = function filter(predicate) {
	if (!predicate) {
		NiceError.raise('Stream.filter expects a function of type A -> boolean');
	}
	var nextFn = this._nextFn;
	return new Stream(function () {
		var nextValue = nextFn();
		while (nextValue !== Stream.END) {
			if (predicate(nextValue)) {
				return nextValue;
			}
			nextValue = nextFn();
		}
		return Stream.END;
	});
};

/**
 * Returns the first value in the Stream which matches `predicate`. If
 * no predicate given, then simply returns the first value in the Stream.
 * find is a terminal function of Stream.
 * @example
 * var serviceNowUserOptional = new GlideQuery('sys_user')
 *     .where('active', true)
 *     .where('company.name', 'ServiceNow')
 *     .select()
 *     .find();
 * @param {Function} predicate Predicate function of type A -> boolean
 * @returns {Optional}
 */
Stream.prototype.find = function find(predicate) {
	var value = this._nextFn();

	while (value !== Stream.END) {
		if (!predicate || predicate(value)) {
			return Optional.of(value);
		}
		value = this._nextFn();
	}

	return Optional.empty();
};

/**
 * Returns a boolean value: true if the predicate function
 * evaluates to true for any item in the stream, otherwise false.
 * some is a terminal function of Stream.
 * @example
 * var hasLongDescriptions = new GlideQuery('task')
 *     .whereNotNull('description')
 *     .select('description')
 *     .some(function (t) { return t.description.length > 1000; });
 * @param {Function} predicate Predicate function of type A -> boolean
 * @returns {boolean}
 */
Stream.prototype.some = function some(predicate) {
	if (!predicate) {
		NiceError.raise('Stream.some expects a function of type A -> boolean');
	}

	var value = this._nextFn();
	while (value !== Stream.END) {
		if (predicate(value)) {
			return true;
		}

		value = this._nextFn();
	}

	return false;
};

/**
 * Returns a boolean value: true if the predicate function
 * evaluates to true for all items in the stream, otherwise false.
 * every is a terminal function of Stream.
 * @example
 * var hasOnlyShortDescriptions = new GlideQuery('task')
 *     .whereNotNull('description')
 *     .select('description')
 *     .every(function (t) { return t.description.length < 10; });
 * @param {Function} predicate Predicate function of type A -> boolean
 * @returns {boolean}
 */
Stream.prototype.every = function every(predicate) {
	if (!predicate) {
		NiceError.raise('Stream.every expects a function of type A -> boolean');
	}

	var value = this._nextFn();
	while (value !== Stream.END) {
		if (!predicate(value)) {
			return false;
		}

		value = this._nextFn();
	}
	return true;
};

/**
 * Returns a JavaScript array containing up to count items from the stream.
 * toArray is a terminal function of Stream.
 * @example
 * var users = new GlideQuery('sys_user')
 *     .limit(20)
 *     .select('first_name', 'last_name')
 *     .toArray(100);
 *
 * // [
 * //    {
 * //        "first_name": "Lucius",
 * //        "last_name": "Bagnoli",
 * //        "sys_id": "02826bf03710200044e0bfc8bcbe5d3f"
 * //    },
 * //    ...
 * // ]
 * @param {number} count
 * @returns {Array}
 */
Stream.prototype.toArray = function toArray(count) {
	if (!Schema.isMathematicalInteger(count) || count < 1 || count > 100) {
		NiceError.raise('Stream.toArray expects a positive integer argument <= 100');
	}

	var result = [];
	var i = 0;
	var value = this._nextFn();
	while (i < count && value !== Stream.END) {
		result.push(value);
		value = this._nextFn();
		i += 1;
	}
	return result;
};

/**
 * Returns aggregate value of the entire Stream by applying reducerFn
 * to each item in the Stream. reducerFn takes two arguments: acc (accumulator)
 * and cur (current). reduce behaves similar to JavaScript's reduce method for arrays.
 * reduce is a termianl function of Stream.
 * @example
 * var longestName = new GlideQuery('sys_user')
 *     .whereNotNull('first_name')
 *     .select('first_name')
 *     .reduce(function (acc, cur) {
 *         return cur.first_name.length > acc.length
 *             ? cur.first_name
 *             : acc;
 *     }, '');
 * @param {Function} reducerFn Reducer function of type (acc, A) -> acc
 * @param {any} initialValue
 * @returns {any}
 */
Stream.prototype.reduce = function reduce(reducerFn, initialValue) {
	if (arguments.length === 1) {
		NiceError.raise('Stream.reduce requires an initialValue as the second argument');
	}
	var value = initialValue;

	var nextValue = this._nextFn();
	while (nextValue !== Stream.END) {
		value = reducerFn(value, nextValue);
		nextValue = this._nextFn();
	}

	return value;
};

/**
 * Calls actionFn on each item in the Stream.
 * @example
 * new GlideQuery('sys_user')
 *     .select('first_name')
 *     .forEach(function (u) { gs.debug(u.first_name); });
 * @param {Function} fn
 * @returns {nothing}
 */
Stream.prototype.forEach = function forEach(fn) {
	var value = this._nextFn();
	while (value !== Stream.END) {
		fn(value);
		value = this._nextFn();
	}
};

Stream.prototype.toString = function toString() {
	return 'Stream';
};

/**
 * Returns a Stream of the values from arr
 * @example
 * Stream.fromArray(['Bob', 'Sue', 'Sam'])
 *     .map(function (name) { return name.toUpperCase(); })
 *     .toArray(3);
 * @param {Array} arr
 * @returns {Stream}
 */
Stream.fromArray = function fromArray(arr) {
	var index = 0;

	return new Stream(function () {
		if (index >= arr.length) {
			return Stream.END;
		}
		var value = arr[index];
		index += 1;
		return value;
	});
};

/**
 * Combines multiple Streams using a combiner function
 * @param {Function} combinerFn Function which has a N number parameters, one for each Stream
 * @param {...Stream} streams Streams to combine into single Stream
 * @returns {Stream}
 */
Stream.zip = function zip() {
	if (arguments.length < 2) {
		NiceError.raise('Stream.zip requires at least 2 arguments: '
			+ 'a function which takes n number arguments and n number streams');
	}

	var fn = arguments[0];
	var streams = [];
	for (var a = 1; a < arguments.length; a++) {
		streams.push(arguments[a]);
	}

	return new Stream(function () {
		var nextValues = [];
		for (var i = 0; i < streams.length; i++) {
			var value = streams[i]._nextFn();
			if (value === Stream.END) {
				return Stream.END;
			}
			nextValues.push(value);
		}

		return fn.apply(null, nextValues);
	});
};

Stream.END = {};
