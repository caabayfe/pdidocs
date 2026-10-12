/**
 * Universal response wrapper for the Error Framework.
 * Provides consistent success/error handling with metadata support.
 * All instances are immutable (frozen) - use builder methods to create new instances with modifications.
 * 
 * @class EFResponse
 * 
 * @example
 * // Basic success response
 * const response = EFResponse.success({ id: 'inc_123', number: 'INC0001234' });
 * if (response.isSuccess()) {
 *     const data = response.getData();
 *     gs.info('Created incident: ' + data.number);
 * }
 * 
 * @example
 * // Success with metadata
 * const response = EFResponse.success(
 *     { records: [{ id: '1' }, { id: '2' }] },
 *     { source: 'batch_import', processed_at: new GlideDateTime().getValue() }
 * );
 * 
 * @example
 * // Error response with framework error constant
 * const response = EFResponse.failure(EFResponse.EF_ERRORS.MISSING_REQUIRED_PARAMETER)
 *     .withDetails({ field: 'email', reason: 'Email is required for user creation' });
 * 
 * @example
 * // Validation error with field-level errors
 * const response = EFResponse.validationFailure({
 *     email: 'Invalid email format',
 *     phone: 'Phone number is required'
 * });
 * 
 * @example
 * const response = EFResponse.success({ updated: true })
 *     .withTimestamp()
 *     .withCounts(5, 2, 7)
 *     .withMessage('Batch update completed with some failures');
 * 
 * @example
 * // Error handling in a script include method
 * function createUser(userData) {
 *     if (!userData.email)
 *         return EFResponse.failure(EFResponse.EF_ERRORS.MISSING_REQUIRED_PARAMETER)
 *             .withDetails({ field: 'email' });
 *     
 *     try {
 *         const userId = _performUserCreation(userData);
 *         return EFResponse.success({ user_id: userId })
 *             .withTimestamp();
 *     } catch (e) {
 *         return EFResponse.failure(e);
 *     }
 * }
 * 
 * @example
 * // Converting to JSON for API responses
 * const response = EFResponse.success({ count: 42 }, { query_time_ms: 150 });
 * return JSON.stringify(response.toJSON());
 * // Returns: {"success":true,"data":{"count":42},"metadata":{"query_time_ms":150}}
 * 
 * @example
 * // Action script returning a response
 * // Success:
 * return global.EFResponse.success(data)
 *     .withMessage('Action execution completed successfully')
 *     .withErrorsToClose([sys_id_1, sys_id_2])
 *     .toJSON();
 * 
 * // Failure:
 * return global.EFResponse.failure(error)
 *     .withMessage('Action failed')
 *     .toJSON();
 */
class EFResponse {
    constructor(isSuccess, data, error, metadata, message, errorsToClose) {
        this._isSuccess = isSuccess;
        this._data = data;
        this._error = error;
        this._metadata = metadata || {};
        this._message = message || null;
        this._errorsToClose = errorsToClose || null;
        this._createdAt = new GlideDateTime().getNumericValue();
        Object.freeze(this);
    }

    /**
     * Creates a successful response with data and optional metadata.
     * @param {*} data - The success payload (e.g., record object, list of items)
     * @param {Object} [metadata] - Optional metadata map
     * @returns {EFResponse} A new success response instance
     * @example
     * return EFResponse.success({ id: 'inc_123' }, { action: 'created' });
     */
    static success(data, metadata) {
        return new EFResponse(true, data, null, metadata, null);
    }

    /**
     * Creates an error response from an Error object, string, or configuration object.
     * @param {Error|string|Object} error - The error to wrap (can be an Error instance, an error message string, or an EF_ERROR constant)
     * @param {Object} [metadata] - Optional metadata map
     * @returns {EFResponse} A new error response instance
     * @example
     * return EFResponse.failure(EFResponse.EF_ERRORS.INVALID_TYPE);
     */
    static failure(error, metadata) {
        const normalized = _normalizeError(error);
        return new EFResponse(false, null, normalized, metadata, null);
    }

    /**
     * Creates a standardized validation error response.
     * @param {Object} validationErrors - Map of field names to error messages
     * @returns {EFResponse} An error response with the VALIDATION_FAILED code and validation details
     * @example
     * return EFResponse.validationFailure({ email: 'Invalid format', age: 'Must be 18+' });
     */
    static validationFailure(validationErrors) {
        return EFResponse.failure(EFResponse.EF_ERRORS.VALIDATION_FAILED)
            .withDetails(validationErrors);
    }

    // ==================== State Checks ====================

    /**
     * Checks if the response represents a success state.
     * @returns {boolean} True if the operation was successful
     */
    isSuccess() {
        return this._isSuccess === true;
    }

    /**
     * Checks if the response represents an error state.
     * @returns {boolean} True if the operation failed
     */
    isError() {
        return this._isSuccess === false;
    }

    // ==================== Data Access ====================

    /**
     * Retrieves the data payload from a successful response.
     * @returns {*|null} The data payload, or null if not set
     */
    getData() {
        return Object.assign({}, this._data);
    }

    /**
     * Retrieves the error object from an error response.
     * @returns {Object|null} The normalized error object, or null if successful
     */
    getError() {
        return this._error;
    }

    /**
     * Helper to get the error message safely.
     * @returns {string|null} The error message, or null if successful
     */
    getErrorMessage() {
        return this._error ? this._error.message : null;
    }


    /**
     * Returns a shallow copy of the metadata object.
     * @returns {Object} Metadata object
     */
    getMetadata() {
        return Object.assign({}, this._metadata);
    }


    /**
     * Retrieves a specific metadata value by key.
     * @param {string} key - The metadata key to retrieve
     * @param {*} [defaultValue] - Value to return if the key is missing
     * @returns {*} The metadata value or the default value
     */
    getMetadataValue(key, defaultValue) {
        return this._metadata.hasOwnProperty(key) ? this._metadata[key] : defaultValue;
    }

    // ==================== Metadata Helpers ====================


    /**
     * Returns a new EFResponse with additional metadata merged in.
     * @param {Object} metadata - Metadata object to merge
     * @returns {EFResponse} New response instance with updated metadata
     */
    withMetadata(metadata) {
        const newMeta = Object.assign({}, this._metadata, metadata);
        return new EFResponse(this._isSuccess, this._data, this._error, newMeta, this._message, this._errorsToClose);
    }


    /**
     * Returns a new EFResponse with a 'timestamp' metadata field added.
     * @returns {EFResponse} New response instance
     */
    withTimestamp() {
        return this.withMetadata({
            timestamp: new GlideDateTime().getValue()
        });
    }

    /**
     * Returns a new EFResponse with a top-level message added to metadata.
     * @param {string} message - The message string
     * @returns {EFResponse} New response instance
     */
    withMessage(message) {
        return new EFResponse(this._isSuccess, this._data, this._error, this._metadata, message, this._errorsToClose);
    }


    /**
     * Returns a new EFResponse with standardized count metrics.
     * @param {number} updated - Count of updated items
     * @param {number} failed - Count of failed items
     * @param {number} [total] - Total count of items processed (optional)
     * @returns {EFResponse} New response instance with counts in metadata
     */
    withCounts(updated, failed, total) {
        const counts = {
            updated_count: updated,
            failed_count: failed
        };
        if (total !== undefined)
            counts.total_requested = total;

        return this.withMetadata(counts);
    }


    /**
     * Returns a new EFResponse with additional error details merged.
     * Only applies to error responses; success responses are returned unchanged.
     * @param {Object} details - The details object to merge into error.details
     * @returns {EFResponse} New response instance with updated error details
     */
    withDetails(details) {
        if (this._isSuccess || !this._error)
            return this;

        const updatedError = Object.assign({}, this._error, {
            details: Object.assign({}, this._error.details || {}, details)
        });
        return new EFResponse(this._isSuccess, this._data, updatedError, this._metadata, this._message, this._errorsToClose);
    }

    /**
     * Marks error(s) to be closed after successful action execution.
     * Only applies to success responses; error responses are returned unchanged.
     * @param {string|string[]} [errorSysIds] - Error sys_id(s) to close. If not provided, uses the current error from context.
     * @returns {EFResponse} New response instance marked for error closure
     * @example
     * return EFResponse.success().withErrorsToClose();
     * @example
     * return EFResponse.success().withErrorsToClose(['error_sys_id_1', 'error_sys_id_2']);
     */
    withErrorsToClose(errorSysIds) {
        if (!this._isSuccess)
            return this;

        const errorsToClose = errorSysIds
            ? (Array.isArray(errorSysIds) ? errorSysIds : [errorSysIds])
            : null;

        return new EFResponse(this._isSuccess, this._data, this._error, this._metadata, this._message, errorsToClose);
    }

    // ==================== Serialization ====================


    /**
     * Converts the response to a standard JSON-serializable object structure.
     * @returns {Object} Standardized JSON object: { success: boolean, data?: any, error?: Object, metadata?: Object }
     */
    toJSON() {
        const result = { success: this._isSuccess };

        if (this._message)
            result.message = this._message;

        if (this._isSuccess) {
            if (this._data !== null && this._data !== undefined)
                result.data = this._data;

            if (this._errorsToClose)
                result.errors_to_close = this._errorsToClose;
        } else if (this._error) {
            result.error = {
                message: this._error.message
            };
            if (this._error.details)
                result.error.details = this._error.details;
        }

        if (this._metadata && Object.keys(this._metadata).length > 0)
            result.metadata = this._metadata;

        return result;
    }
}

EFResponse.EF_ERRORS = EFConstants.EF_ERRORS;

/**
 * Normalizes various error formats to standard structure
 * @private
 * @param {Error|string|Object} error - Error to normalize
 * @returns {Object} Normalized error object
 */
function _normalizeError(error) {
    const defaultError = EFResponse.EF_ERRORS.UNKNOWN_ERROR;

    // Handle Error objects
    if (error instanceof Error) {
        return {
            message: error.message || defaultError.message,
            stack: error.stack
        };
    }

    // Handle string errors
    if (typeof error === 'string') {
        return {
            message: error
        };
    }

    // Handle object errors
    if (typeof error === 'object' && error !== null) {
        const normalized = {
            message: error.message || defaultError.message
        };

        // Preserve stack and other useful properties
        if (error.stack) normalized.stack = error.stack;
        if (error.details) normalized.details = error.details;

        return normalized;
    }

    // Fallback for primitive types
    return {
        message: defaultError.message
    };
}
