/**
 * ValidationUtility class for data type and argument validation.
 */
var ValidationUtility = Class.create();
ValidationUtility.prototype = {
    /**
     * The expected length of a ServiceNow sys_id (32 hexadecimal characters).
     * @constant {number}
     */
    SYS_ID_LENGTH: 32,

    initialize: function () {
    },

    /**
     * Validates that a value is a non-empty string.
     * @param {*} value - The value to validate
     * @param {string} name - A descriptive name for the value being validated (for error messages)
     * @param {boolean} [throwOnFailure=true] - If true, throws error; if false, returns false on validation failure
     * @returns {boolean} True if valid, false if invalid (only when throwOnFailure is false)
     * @throws {InvalidValueError} When value is not a non-empty string and throwOnFailure is true
     * @throws {InvalidValueError} When throwOnFailure is provided but is not a boolean
     */
    validateNonEmptyString: function (value, name, throwOnFailure) {
        throwOnFailure = this._normalizeThrowOnFailure(throwOnFailure);
        
        if (!value || typeof value !== 'string' || value.trim() === '') {
            if (throwOnFailure)
                throw new InvalidValueError('Invalid value for ' + name + ': must be a non-empty string');
            return false;
        }
        return true;
    },

    /**
     * Validates that a value is a boolean.
     * @param {*} value - The value to validate
     * @param {string} name - A descriptive name for the value being validated (for error messages)
     * @param {boolean} [throwOnFailure=true] - If true, throws error; if false, returns false on validation failure
     * @returns {boolean} True if valid, false if invalid (only when throwOnFailure is false)
     * @throws {InvalidValueError} When value is not a boolean and throwOnFailure is true
     * @throws {InvalidValueError} When throwOnFailure is provided but is not a boolean
     */
    validateBoolean: function (value, name, throwOnFailure) {
        throwOnFailure = this._normalizeThrowOnFailure(throwOnFailure);
        
        if (typeof value !== 'boolean') {
            if (throwOnFailure)
                throw new InvalidValueError('Invalid value for ' + name + ': must be a boolean');
            return false;
        }
        return true;
    },

    /**
     * Validates that a value is a number.
     * @param {*} value - The value to validate
     * @param {string} name - A descriptive name for the value being validated (for error messages)
     * @param {boolean} [throwOnFailure=true] - If true, throws error; if false, returns false on validation failure
     * @returns {boolean} True if valid, false if invalid (only when throwOnFailure is false)
     * @throws {InvalidValueError} When value is not a number and throwOnFailure is true
     * @throws {InvalidValueError} When throwOnFailure is provided but is not a boolean
     */
    validateNumber: function (value, name, throwOnFailure) {
        throwOnFailure = this._normalizeThrowOnFailure(throwOnFailure);
        
        if (typeof value !== 'number' || isNaN(value)) {
            if (throwOnFailure)
                throw new InvalidValueError('Invalid value for ' + name + ': must be a number');
            return false;
        }
        return true;
    },

    /**
     * Validates that a value is an integer.
     * @param {*} value - The value to validate
     * @param {string} name - A descriptive name for the value being validated (for error messages)
     * @param {boolean} [throwOnFailure=true] - If true, throws error; if false, returns false on validation failure
     * @returns {boolean} True if valid, false if invalid (only when throwOnFailure is false)
     * @throws {InvalidValueError} When value is not an integer and throwOnFailure is true
     * @throws {InvalidValueError} When throwOnFailure is provided but is not a boolean
     */
    validateInteger: function (value, name, throwOnFailure) {
        throwOnFailure = this._normalizeThrowOnFailure(throwOnFailure);
        
        if (typeof value !== 'number' || !Number.isInteger(value)) {
            if (throwOnFailure)
                throw new InvalidValueError('Invalid value for ' + name + ': must be an integer');
            return false;
        }
        return true;
    },

    /**
     * Validates that a value is a positive integer (greater than 0).
     * @param {*} value - The value to validate
     * @param {string} name - A descriptive name for the value being validated (for error messages)
     * @param {boolean} [throwOnFailure=true] - If true, throws error; if false, returns false on validation failure
     * @returns {boolean} True if valid, false if invalid (only when throwOnFailure is false)
     * @throws {InvalidValueError} When value is not a positive integer and throwOnFailure is true
     * @throws {InvalidValueError} When throwOnFailure is provided but is not a boolean
     */
    validatePositiveInteger: function (value, name, throwOnFailure) {
        throwOnFailure = this._normalizeThrowOnFailure(throwOnFailure);
        
        if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
            if (throwOnFailure)
                throw new InvalidValueError('Invalid value for ' + name + ': must be a positive integer');
            return false;
        }
        return true;
    },

    /**
     * Validates that a value is a non-negative integer (>= 0).
     * @param {*} value - The value to validate
     * @param {string} name - A descriptive name for the value being validated (for error messages)
     * @param {boolean} [throwOnFailure=true] - If true, throws error; if false, returns false on validation failure
     * @returns {boolean} True if valid, false if invalid (only when throwOnFailure is false)
     * @throws {InvalidValueError} When value is not a non-negative integer and throwOnFailure is true
     * @throws {InvalidValueError} When throwOnFailure is provided but is not a boolean
     */
    validateNonNegativeInteger: function (value, name, throwOnFailure) {
        throwOnFailure = this._normalizeThrowOnFailure(throwOnFailure);
        
        if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
            if (throwOnFailure)
                throw new InvalidValueError('Invalid value for ' + name + ': must be a non-negative integer');
            return false;
        }
        return true;
    },

    /**
     * Validates that a value is a string (can be empty).
     * @param {*} value - The value to validate
     * @param {string} name - A descriptive name for the value being validated (for error messages)
     * @param {boolean} [throwOnFailure=true] - If true, throws error; if false, returns false on validation failure
     * @returns {boolean} True if valid, false if invalid (only when throwOnFailure is false)
     * @throws {InvalidValueError} When value is not a string and throwOnFailure is true
     * @throws {InvalidValueError} When throwOnFailure is provided but is not a boolean
     */
    validateString: function (value, name, throwOnFailure) {
        throwOnFailure = this._normalizeThrowOnFailure(throwOnFailure);
        
        if (value !== undefined && value !== null && typeof value !== 'string') {
            if (throwOnFailure)
                throw new InvalidValueError('Invalid value for ' + name + ': must be a string');
            return false;
        }
        return true;
    },

    /**
     * Validates that a value is an array with optional constraints.
     * @param {*} value - The value to validate
     * @param {string} name - A descriptive name for the value being validated (for error messages)
     * @param {Object} [options] - Optional validation options
     * @param {boolean} [options.allowEmpty=true] - Whether to allow empty arrays
     * @param {Function} [options.elementValidator] - Optional function to validate each element (receives element, index, name)
     * @param {boolean} [options.throwOnFailure=true] - If true, throws error; if false, returns false on validation failure
     * @returns {boolean} True if valid, false if invalid (only when throwOnFailure is false)
     * @throws {InvalidValueError} When value is not an array or fails validation constraints and throwOnFailure is true
     */
    validateArray: function (value, name, options) {
        // Default options
        var opts = options || {};
        var allowEmpty = opts.allowEmpty !== false; // Default to true
        var elementValidator = opts.elementValidator;
        var throwOnFailure = opts.throwOnFailure !== false; // Default to true

        // Validate that value is an array
        if (!Array.isArray(value)) {
            if (throwOnFailure)
                throw new InvalidValueError('Invalid value for ' + name + ': must be an array');
            return false;
        }

        // Validate array is not empty if required
        if (!allowEmpty && value.length === 0) {
            if (throwOnFailure)
                throw new InvalidValueError('Invalid value for ' + name + ': must contain at least one element');
            return false;
        }

        // Validate each element if validator is provided
        if (elementValidator && typeof elementValidator === 'function') {
            for (var i = 0; i < value.length; i++) {
                try {
                    elementValidator.call(this, value[i], i, name);
                } catch (e) {
                    if (throwOnFailure) {
                        throw e;
                    }
                    return false;
                }
            }
        }
        return true;
    },

    /**
     * Validates that a value is a non-empty array of non-empty strings.
     * Each element in the array must be a non-empty string.
     * @param {*} value - The value to validate
     * @param {string} name - A descriptive name for the value being validated (for error messages)
     * @param {boolean} [throwOnFailure=true] - If true, throws error; if false, returns false on validation failure
     * @returns {boolean} True if valid, false if invalid (only when throwOnFailure is false)
     * @throws {InvalidValueError} When value is not a non-empty array or contains invalid elements and throwOnFailure is true
     * @throws {InvalidValueError} When throwOnFailure is provided but is not a boolean
     */
    validateNonEmptyStringArray: function (value, name, throwOnFailure) {
        throwOnFailure = this._normalizeThrowOnFailure(throwOnFailure);
        
        var self = this;
        return this.validateArray(value, name, {
            allowEmpty: false,
            throwOnFailure: throwOnFailure,
            elementValidator: function (element, index, name) {
                // Always throw on element validation failure so validateArray can handle it
                // validateArray will then re-throw or return false based on its throwOnFailure
                if (!self.validateNonEmptyString(element, name + '[' + index + ']', false)) {
                    throw new InvalidValueError('Invalid value for ' + name + '[' + index + ']: must be a non-empty string');
                }
            }
        });
    },

    /**
     * Validates that a value is a valid sys_id (32-character hexadecimal string).
     * @param {*} value - The value to validate
     * @param {string} name - A descriptive name for the value being validated (for error messages)
     * @param {boolean} [throwOnFailure=true] - If true, throws error; if false, returns false on validation failure
     * @returns {boolean} True if valid, false if invalid (only when throwOnFailure is false)
     * @throws {InvalidValueError} When value is not a valid sys_id and throwOnFailure is true
     * @throws {InvalidValueError} When throwOnFailure is provided but is not a boolean
     */
    validateSysId: function (value, name, throwOnFailure) {
        throwOnFailure = this._normalizeThrowOnFailure(throwOnFailure);
        
        if (!this.validateNonEmptyString(value, name, throwOnFailure))
            return false;
        
        var sysIdPattern = new RegExp('^[a-f0-9]{' + this.SYS_ID_LENGTH + '}$', 'i');
        if (!sysIdPattern.test(value)) {
            if (throwOnFailure)
                throw new InvalidValueError('Invalid value for ' + name + ': must be a valid ' + this.SYS_ID_LENGTH + '-character sys_id');
            return false;
        }
        return true;
    },

    /**
     * Validates that a record exists in the specified table.
     * @param {string} tableName - The name of the table
     * @param {string} sysId - The sys_id of the record
     * @param {boolean} [throwOnFailure=true] - If true, throws error; if false, returns false on validation failure
     * @returns {boolean} True if valid, false if invalid (only when throwOnFailure is false)
     * @throws {ResourceNotFoundError} When the record does not exist and throwOnFailure is true
     * @throws {InvalidValueError} When parameters are invalid and throwOnFailure is true
     * @throws {InvalidValueError} When throwOnFailure is provided but is not a boolean
     */
    validateRecordExists: function (tableName, sysId, throwOnFailure) {
        throwOnFailure = this._normalizeThrowOnFailure(throwOnFailure);
        
        if (!this.validateNonEmptyString(tableName, 'tableName', throwOnFailure))
            return false;
        if (!this.validateNonEmptyString(sysId, 'sysId', throwOnFailure))
            return false;
        
        var recordUtil = new RecordUtility();
        
        if (!recordUtil.exists(tableName, sysId)) {
            if (throwOnFailure)
                throw new ResourceNotFoundError('Record not found in table ' + tableName + ' with sys_id: ' + sysId);
            return false;
        }
        return true;
    },

    /**
     * Validates that an object is a valid GlideRecord for the specified table with a valid sys_id.
     * @param {*} gr - The object to validate as a GlideRecord
     * @param {string} tableName - The expected table name
     * @param {string} name - A descriptive name for the value being validated (for error messages)
     * @param {boolean} [throwOnFailure=true] - If true, throws error; if false, returns false on validation failure
     * @returns {boolean} True if valid, false if invalid (only when throwOnFailure is false)
     * @throws {InvalidValueError} When gr is not a valid GlideRecord for the specified table and throwOnFailure is true
     * @throws {InvalidValueError} When throwOnFailure is provided but is not a boolean
     */
    validateGlideRecord: function (gr, tableName, name, throwOnFailure) {
        throwOnFailure = this._normalizeThrowOnFailure(throwOnFailure);
        
        var isValid = !!(gr
            && gr.isValidRecord()
            && typeof gr.getTableName === 'function'
            && gr.getTableName() === tableName
            && typeof gr.getValue === 'function');
        
        if (!isValid) {
            if (throwOnFailure)
                throw new InvalidValueError('Invalid value for ' + name + ': must be a ' + tableName + ' GlideRecord with a valid sys_id');
            return false;
        }
        return true;
    },

    /**
     * Validates that a value is one of the allowed values.
     * @param {*} value - The value to validate
     * @param {Array<string>} allowedValues - Array of allowed string values
     * @param {string} name - A descriptive name for the value being validated (for error messages)
     * @param {boolean} [throwOnFailure=true] - If true, throws error; if false, returns false on validation failure
     * @returns {boolean} True if valid, false if invalid (only when throwOnFailure is false)
     * @throws {InvalidValueError} When value is not one of the allowed values and throwOnFailure is true
     * @throws {InvalidValueError} When throwOnFailure is provided but is not a boolean
     */
    validateOneOf: function (value, allowedValues, name, throwOnFailure) {
        throwOnFailure = this._normalizeThrowOnFailure(throwOnFailure);

        if (!Array.isArray(allowedValues)) {
            throw new InvalidValueError('Invalid value for allowedValues: must be an array');
        }

        for (var i = 0; i < allowedValues.length; i++) {
            if (value === allowedValues[i]) {
                return true;
            }
        }
        if (throwOnFailure)
            throw new InvalidValueError('Invalid value for ' + name + ': must be one of [' + allowedValues.join(', ') + ']');
        return false;
    },

    /**
     * Normalizes and validates the throwOnFailure parameter.
     * @private
     * @param {*} throwOnFailure - The throwOnFailure parameter to normalize
     * @returns {boolean} The normalized boolean value (true if null/undefined)
     * @throws {InvalidValueError} When throwOnFailure is provided but is not a boolean
     */
    _normalizeThrowOnFailure: function (throwOnFailure) {
        if (throwOnFailure == null)
            return true;
        if (typeof throwOnFailure !== 'boolean')
            throw new InvalidValueError('Invalid value for throwOnFailure: must be a boolean');
        return throwOnFailure;
    },

    type: 'ValidationUtility'
};
