/**
 * @class EFErrorRepository
 * @classdesc Handles database operations for error objects
 */
class EFErrorRepository {

    /**
     * Saves an error to the database (creates or updates)
     * @param {Object} error - Error data object (from EFError.getData())
     * @returns {string} The sys_id of the inserted or updated error
     * @throws {Error} If insert or update fails
     */
    static saveError(error) {
        // Build criteria for deduplication check
        // Minimum required fields: key, source_application, error_code
        // Additional unique fields are determined by app config in EFErrorUtil.getError
        const criteria = {};

        // Minimum required fields for uniqueness
        criteria[EFConstants.ERROR_FIELDS.KEY] = error[EFConstants.ERROR_BUILDER_FIELDS.KEY];
        criteria[EFConstants.ERROR_FIELDS.ERROR_CODE] = error[EFConstants.ERROR_BUILDER_FIELDS.ERROR_CODE];
        criteria[EFConstants.ERROR_FIELDS.APPLICATION] = error[EFConstants.ERROR_BUILDER_FIELDS.SOURCE_APPLICATION];
        
        // Include potential additional unique fields so getError can use them based on config
        if (error[EFConstants.ERROR_BUILDER_FIELDS.ERROR_SOURCE])
            criteria[EFConstants.ERROR_FIELDS.ERROR_SOURCE] = error[EFConstants.ERROR_BUILDER_FIELDS.ERROR_SOURCE];
        if (error[EFConstants.ERROR_BUILDER_FIELDS.ERROR_SOURCE_TABLE])
            criteria[EFConstants.ERROR_FIELDS.ERROR_SOURCE_TABLE] = error[EFConstants.ERROR_BUILDER_FIELDS.ERROR_SOURCE_TABLE];
        if (error[EFConstants.ERROR_BUILDER_FIELDS.ERROR_CATEGORY])
            criteria[EFConstants.ERROR_FIELDS.CATEGORY] = error[EFConstants.ERROR_BUILDER_FIELDS.ERROR_CATEGORY];

        const existingErrorGr = EFErrorUtil.getError(criteria);

        return EFErrorRepository._createOrUpdateError(error, existingErrorGr);
    }

    /**
     * Creates or updates an error record
     * @param {Object} error - Error data object (from EFError.getData())
     * @param {GlideRecord} existingErrorGr - Existing error record (null if new)
     * @returns {string} The sys_id of the inserted or updated error
     * @private
     */
    static _createOrUpdateError(error, existingErrorGr) {
        let errorGr, sysId;

        if (existingErrorGr) {
            // Update existing error
            errorGr = existingErrorGr;
            sysId = errorGr.getUniqueValue();

            //Incrementing consecutive count
            const currentConsecutive = parseInt(errorGr.getValue(EFConstants.ERROR_FIELDS.CONSECUTIVE_COUNT) || '0', 10);
            errorGr.setValue(EFConstants.ERROR_FIELDS.CONSECUTIVE_COUNT, currentConsecutive + 1);

            // Handle state transitions for existing errors
            errorGr = this._handleErrorStateTransition(errorGr, error);
        } else {
            // Create new error record
            errorGr = new GlideRecord(EFConstants.TABLES.ERROR);
            errorGr.initialize();

            // Set required fields - these come directly from error code or user input
            // and are already validated by EFErrorValidator
            const errorCode = error[EFConstants.ERROR_BUILDER_FIELDS.ERROR_CODE];
            errorGr.setValue(EFConstants.ERROR_FIELDS.ERROR_CODE, errorCode);
            errorGr.setValue(EFConstants.ERROR_FIELDS.APPLICATION, error[EFConstants.ERROR_BUILDER_FIELDS.SOURCE_APPLICATION]);
            errorGr.setValue(EFConstants.ERROR_FIELDS.CATEGORY, error[EFConstants.ERROR_BUILDER_FIELDS.ERROR_CATEGORY]);
            errorGr.setValue(EFConstants.ERROR_FIELDS.SEVERITY, error[EFConstants.ERROR_BUILDER_FIELDS.SEVERITY]);
            
            // Set source fields only if both table and ID are present
            if (error[EFConstants.ERROR_BUILDER_FIELDS.ERROR_SOURCE_TABLE] && 
                error[EFConstants.ERROR_BUILDER_FIELDS.ERROR_SOURCE]) {
                errorGr.setValue(EFConstants.ERROR_FIELDS.ERROR_SOURCE_TABLE, error[EFConstants.ERROR_BUILDER_FIELDS.ERROR_SOURCE_TABLE]);
                errorGr.setValue(EFConstants.ERROR_FIELDS.ERROR_SOURCE, error[EFConstants.ERROR_BUILDER_FIELDS.ERROR_SOURCE]);
            }
            
            // Set unique key field for deduplication
            errorGr.setValue(EFConstants.ERROR_FIELDS.KEY, error[EFConstants.ERROR_BUILDER_FIELDS.KEY]);
            
            // Set initial state - use IGNORED if suppressed, otherwise use provided state or default to OPEN
            let initialState = error[EFConstants.ERROR_BUILDER_FIELDS.STATE] || EFConstants.ERROR_STATES.OPEN;
            if (error[EFConstants.ERROR_BUILDER_FIELDS.SUPPRESS] === true) 
                initialState = EFConstants.ERROR_STATES.IGNORED;

            errorGr.setValue(EFConstants.ERROR_FIELDS.STATE, initialState);
            errorGr.setValue(EFConstants.ERROR_FIELDS.REOPENED_COUNT, 0);
            errorGr.setValue(EFConstants.ERROR_FIELDS.CONSECUTIVE_COUNT, 0);
        }

        // Always update these fields on both new and existing error records
        errorGr.setValue(EFConstants.ERROR_FIELDS.MESSAGE, error[EFConstants.ERROR_BUILDER_FIELDS.MESSAGE]);
        errorGr.setValue(EFConstants.ERROR_FIELDS.SUPPRESS, error[EFConstants.ERROR_BUILDER_FIELDS.SUPPRESS]);
        errorGr.setValue(EFConstants.ERROR_FIELDS.LAST_OCCURRENCE, new GlideDateTime().getValue());

        // Handle context (JSON field) if present
        const newContext = error[EFConstants.ERROR_BUILDER_FIELDS.CONTEXT];
        if (newContext && Object.keys(newContext).length > 0) {
            let contextToSave = newContext;

            // For existing errors, check if context has changed
            if (existingErrorGr) {
                try {
                    const existingContextStr = errorGr.getValue(EFConstants.ERROR_FIELDS.CONTEXT);
                    if (existingContextStr) {
                        const existingContext = JSON.parse(existingContextStr);

                        if (this._hasContextChanged(existingContext, newContext)) {
                            EFErrorRepository.logger.debug('Context changed, updating with new context');
                            errorGr.setValue(EFConstants.ERROR_FIELDS.REFINED_ON, '');
                        } else {
                            // No changes detected, keep existing context
                            contextToSave = existingContext;
                            EFErrorRepository.logger.debug('Context unchanged, keeping existing context');
                        }
                    }
                } catch (parseError) {
                    EFErrorRepository.logger.warn(`Failed to parse existing context: ${parseError.message}, will use new context`);
                }
            }

            // Serialize and save the context
            try {
                const serializedContext = JSON.stringify(contextToSave);
                // Check if serialized context exceeds the max length of 8000 characters
                if (serializedContext.length > EFConstants.FIELD_LIMITS.CONTEXT_MAX_LENGTH) {
                    EFErrorRepository.logger.warn(`Context too large (${serializedContext.length} chars), truncating to ${EFConstants.FIELD_LIMITS.CONTEXT_MAX_LENGTH}`);
                    
                    // Create a truncated version of the context
                    const truncatedContext = {
                        truncated: true,
                        original_size: serializedContext.length,
                        truncated_context: serializedContext.substring(0, EFConstants.FIELD_LIMITS.CONTEXT_TRUNCATE_LENGTH) + '...[truncated]'
                    };
                    
                    errorGr.setValue(EFConstants.ERROR_FIELDS.CONTEXT, JSON.stringify(truncatedContext));
                } else {
                    errorGr.setValue(EFConstants.ERROR_FIELDS.CONTEXT, serializedContext);
                }
            } catch (e) {
                EFErrorRepository.logger.error(`Failed to serialize context: ${e.message}`);
            }
        }

        if (!existingErrorGr) {
            if (gs.nil(errorGr.insert())) {
                EFErrorRepository.logger.error(`Failed to insert error '${error[EFConstants.ERROR_BUILDER_FIELDS.ERROR_CODE]}': ${errorGr.getLastErrorMessage()}`);
                throw new Error(`Failed to insert error: ${errorGr.getLastErrorMessage()}`);
            }
            EFErrorRepository.logger.debug(`Error created: ${error[EFConstants.ERROR_BUILDER_FIELDS.ERROR_CODE]}`);
        } else {
            if (gs.nil(errorGr.update())) {
                EFErrorRepository.logger.error(`Failed to update error '${error[EFConstants.ERROR_BUILDER_FIELDS.ERROR_CODE]}': ${errorGr.getLastErrorMessage()}`);
                throw new Error(`Failed to update error: ${errorGr.getLastErrorMessage()}`);
            }
            EFErrorRepository.logger.debug(`Error updated: ${error[EFConstants.ERROR_BUILDER_FIELDS.ERROR_CODE]}`);
        }

        // Create or update error instances if needed
        EFErrorRepository._createErrorInstance(error, errorGr.getUniqueValue());

        return errorGr.getUniqueValue();
    }

    /**
     * Creates an error instance record
     * @param {Object} error - Error data object (from EFError.getData())
     * @param {string} errorSysId - The sys_id of the parent error record
     * @private
     */
    static _createErrorInstance(error, errorSysId) {
        // Always create an instance record
        const instanceGr = new GlideRecord(EFConstants.TABLES.ERROR_INSTANCE);
        instanceGr.initialize();

        // Set parent error
        instanceGr.setValue(EFConstants.ERROR_INSTANCE_FIELDS.ERROR, errorSysId);

        // Set error source table and record only if both values are available
        if (error[EFConstants.ERROR_BUILDER_FIELDS.ERROR_SOURCE_TABLE] &&
            error[EFConstants.ERROR_BUILDER_FIELDS.ERROR_SOURCE]) {

            instanceGr.setValue(EFConstants.ERROR_INSTANCE_FIELDS.ERROR_SOURCE_TABLE,
                error[EFConstants.ERROR_BUILDER_FIELDS.ERROR_SOURCE_TABLE]);
            instanceGr.setValue(EFConstants.ERROR_INSTANCE_FIELDS.ERROR_SOURCE,
                error[EFConstants.ERROR_BUILDER_FIELDS.ERROR_SOURCE]);
        }

        // Set instance table and record only if both values are available
        if (error[EFConstants.ERROR_BUILDER_FIELDS.ERROR_INSTANCE_TABLE] &&
            error[EFConstants.ERROR_BUILDER_FIELDS.ERROR_INSTANCE]) {

            instanceGr.setValue(EFConstants.ERROR_INSTANCE_FIELDS.ERROR_INSTANCE_TABLE,
                error[EFConstants.ERROR_BUILDER_FIELDS.ERROR_INSTANCE_TABLE]);
            instanceGr.setValue(EFConstants.ERROR_INSTANCE_FIELDS.ERROR_INSTANCE,
                error[EFConstants.ERROR_BUILDER_FIELDS.ERROR_INSTANCE]);
        }

        if (gs.nil(instanceGr.insert())) {
            EFErrorRepository.logger.error(`Failed to insert error instance for '${error[EFConstants.ERROR_BUILDER_FIELDS.ERROR_CODE]}': ${instanceGr.getLastErrorMessage()}`);
            throw new Error(`Failed to insert error instance record: ${instanceGr.getLastErrorMessage()}`);
        }

        EFErrorRepository.logger.debug(`Instance created for error ${error[EFConstants.ERROR_BUILDER_FIELDS.ERROR_CODE]}`);
    }
    
    /**
     * Handles state transitions for existing errors based on their current state
     * @param {GlideRecord} errorGr - The error GlideRecord to update
     * @param {Object} error - Error object with new data
     * @returns {GlideRecord} The updated error GlideRecord
     * @private
     */
    static _handleErrorStateTransition(errorGr, error) {
        const currentState = errorGr.getValue(EFConstants.ERROR_FIELDS.STATE);
        const errorId = errorGr.getUniqueValue();
        const errorCode = error[EFConstants.ERROR_BUILDER_FIELDS.ERROR_CODE];
        let newState = currentState;
        let incrementReopenedCount = false;
        
        EFErrorRepository.logger.debug(`Processing state transition for ${errorCode}: current=${currentState}`);
        
        // Handle suppressed errors first - this overrides other logic
        if (error[EFConstants.ERROR_BUILDER_FIELDS.SUPPRESS] === true) {
            // For suppressed errors: maintain CLOSED/IGNORED states, otherwise set to IGNORED
            if (currentState === EFConstants.ERROR_STATES.CLOSED || 
                currentState === EFConstants.ERROR_STATES.IGNORED) {
                EFErrorRepository.logger.debug(`Suppressed error ${errorCode}: maintaining ${currentState}`);
            } else {
                newState = EFConstants.ERROR_STATES.IGNORED;
                EFErrorRepository.logger.debug(`Suppressed error ${errorCode}: ${currentState} -> IGNORED`);
            }
        }
        // Only process state transitions for non-suppressed errors
        else {
            // Handle specific state transitions
            switch (currentState) {
                case EFConstants.ERROR_STATES.CLOSED:
                case EFConstants.ERROR_STATES.IGNORED:
                    // Reopen errors that were closed or ignored
                    newState = EFConstants.ERROR_STATES.OPEN;
                    incrementReopenedCount = true;
                    EFErrorRepository.logger.info(`Error ${errorCode} reopened: ${currentState} -> OPEN`);
                    break;

                case EFConstants.ERROR_STATES.IN_PROGRESS:
                case EFConstants.ERROR_STATES.OPEN:
                    // Maintain current state for active errors
                    EFErrorRepository.logger.debug(`Error ${errorCode}: maintaining ${currentState}`);
                    break;
                    
                default:
                    // For any unrecognized state, keep it as is
                    EFErrorRepository.logger.warn(`Error ${errorCode} has unrecognized state: ${currentState}`);
            }
        }
        
        // Apply the state change if needed
        if (newState !== currentState)
            errorGr.setValue(EFConstants.ERROR_FIELDS.STATE, newState);
        
        // Increment reopened count if needed
        if (incrementReopenedCount) {
            const currentCount = parseInt(errorGr.getValue(EFConstants.ERROR_FIELDS.REOPENED_COUNT) || '0', 10);
            errorGr.setValue(EFConstants.ERROR_FIELDS.REOPENED_COUNT, currentCount + 1);
        }
        
        return errorGr;
    }

    /**
     * Checks if context has changed by comparing existing and new contexts
     * Returns true if:
     * 1. New context has fields not in existing context (new information)
     * 2. Any shared fields have different values (changed information)
     * @param {Object} existingContext - The existing context object
     * @param {Object} newContext - The new context object
     * @returns {boolean} True if context has changed, false otherwise
     * @private
     */
    static _hasContextChanged(existingContext, newContext) {
        // Handle edge cases
        if (!existingContext || typeof existingContext !== 'object') {
            return true;
        }
        if (!newContext || typeof newContext !== 'object') {
            return true;
        }

        const newKeys = Object.keys(newContext);

        for (let i = 0; i < newKeys.length; i++) {
            const key = newKeys[i];

            // If new context has a field that doesn't exist in existing context
            if (!existingContext.hasOwnProperty(key)) {
                return true; // New field = changed context
            }

            // Compare values for fields that exist in both contexts
            const existingValue = existingContext[key];
            const newValue = newContext[key];

            if (!this._areValuesEqual(existingValue, newValue)) {
                EFErrorRepository.logger.debug(`Context key ${key} changed from ${existingValue} to ${newValue}`);
                return true; // Value changed
            }
        }

        return false; // No changes detected
    }

    /**
     * Compares two values for equality (supports primitives, arrays, and nested objects)
     * @param {*} value1 - First value
     * @param {*} value2 - Second value
     * @returns {boolean} True if values are equal
     * @private
     */
    static _areValuesEqual(value1, value2) {
        // Check for primitive, same reference, or both null/undefined
        if (value1 === value2) {
            return true;
        }

        // One is null/undefined and other is not
        if (value1 == null || value2 == null) {
            return false;
        }

        const type1 = typeof value1;
        const type2 = typeof value2;

        if (type1 !== type2) {
            return false;
        }

        // For primitives (string, number, boolean), === is sufficient
        // If we're here, === already failed, so they're different
        if (type1 !== 'object') {
            return false;
        }

        const isArray1 = Array.isArray(value1);
        const isArray2 = Array.isArray(value2);

        if (isArray1 !== isArray2) {
            return false; // One is array, one is not
        }

        if (isArray1) {
            if (value1.length !== value2.length) {
                return false;
            }

            for (let i = 0; i < value1.length; i++) {
                if (!this._areValuesEqual(value1[i], value2[i])) {
                    return false;
                }
            }

            return true;
        }

        // Objects - recursively compare
        const keys1 = Object.keys(value1);
        const keys2 = Object.keys(value2);

        if (keys1.length !== keys2.length) {
            return false;
        }

        for (let i = 0; i < keys1.length; i++) {
            const key = keys1[i];

            if (!value2.hasOwnProperty(key)) {
                return false;
            }

            if (!this._areValuesEqual(value1[key], value2[key])) {
                return false;
            }
        }

        return true;
    }
}

// Initialize logger for the class
EFErrorRepository.logger = EFLogger.forClass('EFErrorRepository');
