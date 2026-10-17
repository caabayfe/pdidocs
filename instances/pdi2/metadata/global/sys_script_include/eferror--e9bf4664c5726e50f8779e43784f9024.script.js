/**
 * @class EFError
 * @classdesc Data Transfer Object for creating error objects to be logged through the Error Framework.
 * Immutable after construction - all data is validated and resolved immediately.
 */
class EFError {
	/**
	 * Creates a new EFError instance
	 * @param {string} errorCode - The error code (required)
	 * @param {string} key - Unique key for deduplication (required)
	 * @param {Object} [options={}] - Optional parameters
	 * @param {string} [options.source] - The source record sys_id
	 * @param {string} [options.instance] - The instance record sys_id
	 * @param {Object} [options.context] - Additional context key-value pairs
	 * @throws {Error} If required parameters are missing or invalid
	 */
	constructor(errorCode, key, options = {}) {
		// Validate mandatory parameters
		if (!errorCode || typeof errorCode !== 'string' || errorCode.trim() === '')
			throw new Error('EFError: errorCode is required and must be a non-empty string');
		if (!key || typeof key !== 'string' || key.trim() === '')
			throw new Error('EFError: key is required and must be a non-empty string');

		// Validate options
		const { source, instance, context } = options;
		if (context !== undefined && (typeof context !== 'object' || context === null))
			throw new Error('EFError: context must be an object');

		// Store runtime values
		this._errorCode = errorCode;
		this._key = key;
		this._source = source || null;
		this._instance = instance || null;
		this._context = context || {};

		// Resolve from config and build final data object
		this._data = this._resolve();
		Object.freeze(this._data);
		Object.freeze(this);
	}

	/**
	 * Resolves error code configuration and builds the final data object
	 * @returns {Object} The resolved error data object
	 * @private
	 */
	_resolve() {
		const data = {
			[EFConstants.ERROR_BUILDER_FIELDS.ERROR_CODE]: this._errorCode,
			[EFConstants.ERROR_BUILDER_FIELDS.KEY]: this._key,
			[EFConstants.ERROR_BUILDER_FIELDS.ERROR_SOURCE]: this._source || '',
			[EFConstants.ERROR_BUILDER_FIELDS.ERROR_INSTANCE]: this._instance || '',
			[EFConstants.ERROR_BUILDER_FIELDS.CONTEXT]: this._context,
			[EFConstants.ERROR_BUILDER_FIELDS.STATE]: EFConstants.ERROR_STATES.OPEN,
			// Defaults - will be overwritten by error code config
			[EFConstants.ERROR_BUILDER_FIELDS.SOURCE_APPLICATION]: '',
			[EFConstants.ERROR_BUILDER_FIELDS.ERROR_CATEGORY]: '',
			[EFConstants.ERROR_BUILDER_FIELDS.MESSAGE]: '',
			[EFConstants.ERROR_BUILDER_FIELDS.SEVERITY]: EFConstants.SEVERITY_VALUES.LOW,
			[EFConstants.ERROR_BUILDER_FIELDS.SUPPRESS]: false,
			[EFConstants.ERROR_BUILDER_FIELDS.ERROR_SOURCE_TABLE]: '',
			[EFConstants.ERROR_BUILDER_FIELDS.ERROR_INSTANCE_TABLE]: ''
		};

		try {
			const errorCodeGr = EFErrorUtil.getErrorCode(this._errorCode);

			if (errorCodeGr) {
				data[EFConstants.ERROR_BUILDER_FIELDS.ERROR_CODE] = errorCodeGr.getUniqueValue();
				data[EFConstants.ERROR_BUILDER_FIELDS.SOURCE_APPLICATION] = errorCodeGr.getValue(EFConstants.ERROR_CODE_FIELDS.SOURCE_APPLICATION);
				data[EFConstants.ERROR_BUILDER_FIELDS.ERROR_CATEGORY] = errorCodeGr.getValue(EFConstants.ERROR_CODE_FIELDS.CATEGORY);
				data[EFConstants.ERROR_BUILDER_FIELDS.SEVERITY] = parseInt(errorCodeGr.getValue(EFConstants.ERROR_CODE_FIELDS.SEVERITY));
				const suppressVal = String(errorCodeGr.getValue(EFConstants.ERROR_CODE_FIELDS.SUPPRESS));
				data[EFConstants.ERROR_BUILDER_FIELDS.SUPPRESS] = suppressVal === 'true' || suppressVal === '1';
				data[EFConstants.ERROR_BUILDER_FIELDS.MESSAGE] = errorCodeGr.getValue(EFConstants.ERROR_CODE_FIELDS.NAME);
				data[EFConstants.ERROR_BUILDER_FIELDS.ERROR_SOURCE_TABLE] = _getErrorTableName('default_source_table');
				data[EFConstants.ERROR_BUILDER_FIELDS.ERROR_INSTANCE_TABLE] = _getErrorTableName('default_instance_table');
			}
			
			// Get table name from error code if override is set, otherwise get default from source application
			function _getErrorTableName(fieldName) {
				const tableName = errorCodeGr.getValue(fieldName);
				
				// Dot-walking ~30-40% faster than making separate query
				return tableName ? tableName : errorCodeGr.source_application[fieldName];
			}
		} catch (e) {
			EFError.logger.debug(`Error code resolution failed: ${e.message}`);
		}

		return data;
	}

	/**
	 * Returns the resolved error data object
	 * @returns {Object} The frozen error data object
	 */
	getData() {
		return this._data;
	}
}

// Initialize logger for the class
EFError.logger = EFLogger.forClass('EFError');
