/**
 * Optional is a class used when returning a single record which
 * may not exist. Optionals wrap around a value and allow you to
 * interface with the value inside, even if it's empty (`null` or `undefined`).
 * It's purpose is primarily:
 *
 *  1. Help protect from referencing `null`/`undefined` values.
 *  2. Allow function chaining of a return value.
 *
 * Optionals are returned by both GlideQuery and Stream.
 * @example
 *	var userOptional = new GlideQuery('sys_user')
 *		.selectOne('first_name');
 *
 *	var taskOptional = new GlideQuery('task')
 *		.getBy({ priority: 2, description: 'Fix computer' })
 *
 *	var serviceNowUserOptional = new GlideQuery('sys_user')
 *		.where('active', true)
 *		.where('company.name', 'ServiceNow')
 *		.select()
 *		.find();
 * @constructor
 * @param {any} value Value to be contained by Optional
 * @param {Function} [lazyGetFn] Function which returns a value. Used when you want the Optional
   to contain data which may be costly to retrieve (like a query) and may not be necessary.
 * @param {string} [reason] Reason given when an empty Optional is unwrapped (e.g. using `get()`)
 */
function Optional(value, lazyGetFn, reason) {
	this._value = value;
	this._lazyGetFn = lazyGetFn;
	this._lazyValueFetched = false;
	this._reason = reason;
}

Optional.prototype._get = function _get() {
	if (this._lazyGetFn && !this._lazyValueFetched) {
		this._value = this._lazyGetFn();
		this._lazyValueFetched = true;
	}

	return this._value;
};

/**
 * Applies function `fn` and returns a new Optional with the mapped value inside.
 * @example
 * new GlideQuery('sys_user')
 *     .whereNotNull('first_name')
 *     .selectOne('first_name')
 *     .map(function (user) {
 *	       return user.first_name.toUpperCase();
 *     });
 *
 * // "FRED"
 * @param {Function} fn Mapping function of type A -> B
 * @returns {Optional}
 */
Optional.prototype.map = function map(fn) {
	if (!fn) {
		NiceError.raise('map expects a mapping function of type A -> B');
	}

	return this.isEmpty()
		? this
		: new Optional(fn(this._get()));
};

/**
 * Similar to map(fn), however fn must return an Optional.
 * flatMap(fn) returns a new Optional which contains the
 * results of calling fn and unwrapping the value returned.
 * @example
 * new GlideQuery('alm_asset')
 *     .whereNotNull('owned_by')
 *     .selectOne('owned_by')
 *     .flatMap(function (asset) {
 *         return new GlideQuery('sys_user')
 *             .getBy({ sys_id: asset.owned_by }, ['first_name', 'last_name', 'company.name'])
 *     })
 *     .ifPresent(GQ.jsonDebug);
 * @param {Function} fn A mapping function of type A -> Optional<B>
 * @returns {Optional}
 */
// eslint-disable-next-line consistent-return
Optional.prototype.flatMap = function flatMap(fn) {
	var errorMessage = 'Optional.flatMap expects a mapping function of type A -> Optional<B>';
	if (!fn) {
		NiceError.raise(errorMessage);
	}

	if (this.isEmpty()) {
		return this;
	}

	var nextValue = fn(this._get());
	if (nextValue instanceof Optional) {
		return new Optional(nextValue)._get();
	}

	NiceError.raise(errorMessage);
};

/**
 * Returns the value inside the Optional, and throws
 * an Error if the optional is empty (null or undefined).
 * @example
 * new GlideQuery('sys_user')
 *     .selectOne('first_name')
 *     .get();
 *
 * // {
 * //     sys_id: "f682abf03710200044e0bfc8bcbe5d38",
 * //     first_name: "Bob"
 * // }
 * @throws {Error} When Optional is empty
 * @returns {any} Value within Optional
 */
// eslint-disable-next-line consistent-return
Optional.prototype.get = function get() {
	if (this.isPresent()) {
		return this._get();
	}

	var additionalInfo = this._reason
		? ': ' + this._reason
		: '';
	NiceError.raise('get() called on empty Optional' + additionalInfo);
};

/**
 * Returns the value inside the Optional, or
 * a default value if Optional is empty.
 * @example
 * new GlideQuery('sys_user')
 *     .get(key, ['first_name'])
 *     .orElse({ first_name: 'Bob' })
 *
 * // returns an object with first_name, regardless
 * // of whether the record exists in the table
 * @param {any} defaultValue Value returned when Optional is empty
 * @returns {any}
 */
Optional.prototype.orElse = function orElse(defaultValue) {
	return this.isPresent()
		? this._get()
		: defaultValue;
};

/**
 * Returns true if Optional is empty (contains `null` or `undefined`),
 * otherwise returns true.
 * @example
 * new GlideQuery('sys_user')
 *     .where('last_name', 'Barker')
 *     .selectOne()
 *     .isEmpty();
 * @returns {boolean}
 */
Optional.prototype.isEmpty = function isEmpty() {
	return !this.isPresent();
};

/**
 * Returns true if Optional has a value inside (is not `null` or `undefined`),
 * otherwise returns false.
 * @example
 * new GlideQuery('sys_user')
 *     .where('last_name', 'Luddy')
 *     .selectOne('first_name')
 *     .isPresent();
 * @returns {boolean}
 */
Optional.prototype.isPresent = function isPresent() {
	var value = this._get();

	return value !== null && value !== undefined;
};

/**
 * Applies function to value within Option if not empty,
 * otherwise does nothing.
 * @example
 * new GlideQuery('sys_user')
 *     .where('sys_id', 'f682abf03710200044e0bfc8bcbe5d38')
 *     .selectOne('zip')
 *     .ifPresent(function (user) {
 *	       gs.info('Zip Code: ' + user.zip);
 *     });
 *
 * // Prints zip code if user exists, otherwise does nothing
 * @param {Function} fn Function to apply
 * @returns {nothing}
 */
Optional.prototype.ifPresent = function ifPresent(fn) {
	if (!fn) {
		NiceError.raise('ifPresent expects a function');
	}
	if (this.isPresent()) {
		fn(this._get());
	}
};

/**
 * Applies a predicate function (a function which takes a single
 * value and returns true or false) to the value inside, and returns
 * the same Optional unchanged if the predicate returns true. Otherwise,
 * returns an empty Optional.
 * @example
 * new GlideQuery('sys_user')
 *     .getBy({ sys_id: 'f682abf03710200044e0bfc8bcbe5d38' }, ['phone'])
 *     .filter(function (user) {
 *         return phoneRegex.test(user.phone);
 *     });
 * @param {Function} predicate
 * @returns {Optional}
 */
Optional.prototype.filter = function filter(predicate) {
	if (!predicate) {
		NiceError.raise('filter expects a predicate function');
	}

	if (this.isEmpty()) {
		return this;
	}

	return predicate(this._get())
		? this
		: Optional.empty();
};

Optional.prototype.toString = function toString() {
	if (this.isEmpty()) {
		return 'Optional.empty' + (this._reason ? (': ' + this._reason) : '');
	}
	return 'Optional<' + this._get() + '>';
};

/**
 * Returns an empty Optional
 * @param {string} [reason] Reason to display if get() is called on this empty Optional
 * @returns {Optional}
 */
Optional.empty = function empty(reason) {
	return new Optional(null, null, reason);
};

/**
 * Returns a new Optional
 * @param {any} value A value other than `null` or `undefined`
 * @throws {Error} When value is `null` or `undefined`
 * @returns {Optional}
 */
Optional.of = function of(value) {
	if (value === null || value === undefined) {
		NiceError.raise('Optional.of() does not allow undefined or null values. Use Optional.empty() instead.');
	}

	return new Optional(value);
};

/**
 * Returns a new Optional, but instead of containing the value,
 * it contains a function to get the value (if ever requested). This
 * is typically used when you want to delay getting the value because
 * it's from a slow source, and may not ever be requested to begin with
 * @param {Function} lazyGetFn Function which returns a value
 * @returns {Optional}
 */
Optional.lazy = function lazy(lazyGetFn) {
	return new Optional(null, lazyGetFn);
};
