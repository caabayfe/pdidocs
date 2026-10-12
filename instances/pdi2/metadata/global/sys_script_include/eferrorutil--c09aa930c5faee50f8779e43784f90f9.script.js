/**
 * EFErrorUtil
 * Utility class for common Error Framework operations
 */
class EFErrorUtil {
    /**
     * Gets an error code record by code
     * @param {string} errorCode - The error code name (e.g., "SN-CMDB-001")
     * @returns {GlideRecord|null} The error code GlideRecord or null if not found
     */
    static getErrorCode(errorCode) {
        if (!errorCode) return null;

        const errorCodeGr = new GlideRecord(EFConstants.TABLES.ERROR_CODE);
        errorCodeGr.addQuery(EFConstants.ERROR_CODE_FIELDS.CODE, errorCode);
        errorCodeGr.setLimit(1);
        errorCodeGr.query();

        if (errorCodeGr.next())
            return errorCodeGr;

        // Log error if the error code doesn't exist
        EFErrorUtil.logger.error(`Error code '${errorCode}' not found in sys_error_code table`);
        return null;
    }

    /**
     * Gets source application information for an error code
     * @param {string} errorCode - The error code
     * @returns {GlideRecord|null} The source application GlideRecord or null if not found
     */
    static getSourceApplicationByErrorCode(errorCode) {
        const errorCodeGr = this.getErrorCode(errorCode);
        if (!errorCodeGr) return null;

        const sourceAppId = errorCodeGr.getValue(EFConstants.ERROR_CODE_FIELDS.SOURCE_APPLICATION);
        if (!sourceAppId) {
            EFErrorUtil.logger.error(`Error code '${errorCode}' does not have a source application`);
            return null;
        }

        const sourceAppGr = new GlideRecord(EFConstants.TABLES.ERROR_SOURCE_APPLICATION);
        if (sourceAppGr.get(sourceAppId))
            return sourceAppGr;

        return null;
    }

    /**
     * Gets a source application by name
     * @param {string} sourceAppName - The source application name
     * @returns {GlideRecord|null} The source application GlideRecord or null if not found
     */
    static getSourceApplicationByName(sourceAppName) {
        if (!sourceAppName) return null;

        const sourceAppGr = new GlideRecord(EFConstants.TABLES.ERROR_SOURCE_APPLICATION);
        sourceAppGr.addQuery(EFConstants.ERROR_SOURCE_APPLICATION_FIELDS.SOURCE_APPLICATION, sourceAppName);
        sourceAppGr.setLimit(1);
        sourceAppGr.query();

        if (sourceAppGr.next())
            return sourceAppGr;

        // Source applications should be pre-configured
        EFErrorUtil.logger.error(`Source application '${sourceAppName}' not found. Should be pre-configured.`);
        return null;
    }

    /**
     * Gets a source application by error prefix
     * @param {string} errorPrefix - The error prefix (e.g., 'SN-CMDB', 'SN-DISC')
     * @returns {GlideRecord|null} The source application GlideRecord or null if not found
     */
    static getSourceApplicationByPrefix(errorPrefix) {
        if (!errorPrefix) return null;

        const sourceAppGr = new GlideRecord(EFConstants.TABLES.ERROR_SOURCE_APPLICATION);
        sourceAppGr.addQuery(EFConstants.ERROR_SOURCE_APPLICATION_FIELDS.ERROR_PREFIX, errorPrefix);
        sourceAppGr.setLimit(1);
        sourceAppGr.query();

        if (sourceAppGr.next())
            return sourceAppGr;

        EFErrorUtil.logger.error(`Source application not found for prefix: '${errorPrefix}'`);
        return null;
    }

    /**
     * Gets the error prefix for an error code by looking up its source application
     * @param {string} errorCode - The error code string (e.g., "SN-CMDB-0001")
     * @returns {string|null} The error prefix (e.g., "SN-CMDB") or null if not found
     * @example
     * var prefix = EFErrorUtil.getErrorPrefix('SN-CMDB-0001');
     * // Returns: "SN-CMDB"
     */
    static getErrorPrefix(errorCode) {
        if (!errorCode) {
            EFErrorUtil.logger.warn('getErrorPrefix called with empty errorCode');
            return null;
        }

        // Get the source application for this error code
        const sourceAppGr = this.getSourceApplicationByErrorCode(errorCode);
        if (!sourceAppGr) {
            return null;
        }

        // Get the error prefix from the source application
        const errorPrefix = sourceAppGr.getValue(EFConstants.ERROR_SOURCE_APPLICATION_FIELDS.ERROR_PREFIX);
        if (!errorPrefix) {
            EFErrorUtil.logger.error(`Source application for error code '${errorCode}' has no error prefix`);
            return null;
        }

        return errorPrefix;
    }

    /**
     * Finds an existing error record matching the given criteria.
     * Used to check if an error already exists before creating a new one.
     *
     * Uniqueness is determined by:
     * - Minimum required fields: key, source_application, error_code
     * - Additional fields defined in the application's config "additionalUniqueFields" array
     *
     * @param {Object} criteria - The search criteria object containing field values to match
     * @param {string} [criteria.key] - Unique error identifier within a source (required for matching)
     * @param {string} [criteria.source_application] - Source application reference sys_id (required for matching)
     * @param {string} [criteria.error_code] - Error code reference sys_id (required for matching)
     * @param {string} [criteria.error_source] - sys_id of the record that has the error (optional, based on config)
     * @param {string} [criteria.error_source_table] - Table name of the source record (optional, based on config)
     * @returns {GlideRecord|null} The matching error GlideRecord from sys_error table, or null if not found
     * @example
     * // Check if error already exists before creating
     * const existingError = EFErrorUtil.getError({
     *     key: 'invalid_configuration',
     *     source_application: sourceAppSysId,
     *     error_code: errorCodeSysId,
     *     error_source: configRecordSysId,
     *     error_source_table: 'sys_properties'
     * });
     */
    static getError(criteria) {
        if (!criteria) return null;
        
        const errorGr = new GlideRecord(EFConstants.TABLES.ERROR);
        
        // Minimum required fields for uniqueness: key, source_application, error_code
        if (criteria[EFConstants.ERROR_FIELDS.KEY])
            errorGr.addQuery(EFConstants.ERROR_FIELDS.KEY, criteria[EFConstants.ERROR_FIELDS.KEY]);
        
        if (criteria[EFConstants.ERROR_FIELDS.APPLICATION])
            errorGr.addQuery(EFConstants.ERROR_FIELDS.APPLICATION, criteria[EFConstants.ERROR_FIELDS.APPLICATION]);
        
        if (criteria[EFConstants.ERROR_FIELDS.ERROR_CODE])
            errorGr.addQuery(EFConstants.ERROR_FIELDS.ERROR_CODE, criteria[EFConstants.ERROR_FIELDS.ERROR_CODE]);
        
        // Get additional unique fields from application config
        const sourceAppSysId = criteria[EFConstants.ERROR_FIELDS.APPLICATION];
        if (sourceAppSysId) {
            try {
                const additionalFields = this.getConfigProp(sourceAppSysId, EFConstants.CONFIG_PROPERTIES.ADDITIONAL_UNIQUE_FIELDS);
                if (Array.isArray(additionalFields)) {
                    for (const fieldName of additionalFields) {
                        if (criteria[fieldName])
                            errorGr.addQuery(fieldName, criteria[fieldName]);
						else
							errorGr.addNullQuery(fieldName);
                    }
                }
            } catch (e) {
                // additionalUniqueFields not configured - use minimum fields only
                this.logger.debug(`No additionalUniqueFields configured for app ${sourceAppSysId}: ${e.message}`);
            }
        }
        
        errorGr.setLimit(1);
        errorGr.query();
        
        if (errorGr.next())
            return errorGr;
        
        return null;
    }

    /**
     * Retrieves errors based on the provided param
     * @param {Array<string>|string} param - Array of keys, sys_id of the sys_error_inst or sys_id of the error source
     * @returns {GlideRecord|null} The error GlideRecord or null if no matching errors are found
     */
    static getErrors(param) {
        if (!param)
            throw new Error(sn_i18n.Message.getMessage("error_framework", "param must be provided to fetch errors"));

        const errorGr = new GlideRecordSecure(EFConstants.TABLES.ERROR);

        if (Array.isArray(param)) {
            if (param.length === 0)
                throw new Error(sn_i18n.Message.getMessage("error_framework", "Array of keys must be non-empty"));

            errorGr.addQuery(EFConstants.ERROR_FIELDS.KEY, 'IN', param);
        } else if (typeof param === 'string') {
            const instanceGr = new GlideRecordSecure(EFConstants.TABLES.ERROR_INSTANCE);
            if (instanceGr.get('sys_id', param))
                errorGr.addQuery('sys_id', instanceGr.getValue(EFConstants.ERROR_INSTANCE_FIELDS.ERROR));
            else
                errorGr.addQuery(EFConstants.ERROR_FIELDS.ERROR_SOURCE, param);
        } else
            throw new Error(sn_i18n.Message.getMessage("error_framework", "param must be an array of keys or a string sys_id"));

        errorGr.query();
        return errorGr.hasNext() ? errorGr : null;
    }


    /**
     * Retrieves error records by their sys_ids.
     * Useful for bulk operations when you have specific error record IDs.
     *
     * @param {Array<string>|string} sysIds - Array of error record sys_ids or a single sys_id
     * @returns {GlideRecord} GlideRecord containing the requested errors (empty if none found)
     * @throws {Error} If sysIds is null, empty, or contains invalid values
     * @example
     * // Get multiple errors by sys_id
     * const errors = EFErrorUtil.getErrorsBySysIDs(['abc123', 'def456', 'ghi789']);
     *
     * @example
     * // Get single error by sys_id
     * const error = EFErrorUtil.getErrorsBySysIDs('abc123');
     */
    static getErrorsBySysIDs(sysIds) {
        const ids = Array.isArray(sysIds) ? sysIds : [sysIds];
        if (!ids || ids.length === 0 || ids.some(id => !id))
            throw new Error('Valid sys_id or array of sys_ids is required');

        const errorGr = new GlideRecord(EFConstants.TABLES.ERROR);
        errorGr.addQuery('sys_id', 'IN', ids.join(','));
        errorGr.query();
        return errorGr;
    }

    /**
     * Retrieves all error records using a specific error code.
     * The error code string (not sys_id) is used for the query.
     *
     * @param {string} errorCode - The error code string to search for (e.g., 'SN-CMDB-001')
     * @returns {GlideRecord} GlideRecord containing all errors with this error code (empty if none found)
     * @throws {Error} If errorCode parameter is not provided
     * @example
     * // Get all errors using a specific error code
     * const errors = EFErrorUtil.getErrorsByCode('SN-CMDB-001');
     * gs.info('Found ' + errors.getRowCount() + ' errors');
     */
    static getErrorsByCode(errorCode) {
        if (!errorCode)
            throw new Error('error_code parameter is required');

        const errorGr = new GlideRecord(EFConstants.TABLES.ERROR);
        errorGr.addQuery(EFConstants.ERROR_FIELDS.ERROR_CODE + '.' + EFConstants.ERROR_CODE_FIELDS.CODE, errorCode);
        errorGr.query();
        return errorGr;
    }

    /**
     * Retrieves all errors associated with a specific source record.
     * Optionally filters results to a specific application using errorPrefix.
     *
     * @param {string} source - The sys_id of the error source record
     * @param {string} errorPrefix - The error prefix from sys_error_appl.error_prefix
     *                               This is the unique identifier for the source application (e.g., 'SN-CMDB', 'SN-DISC')
     * @returns {GlideRecord} The error GlideRecords (empty if none found)
     */
    static getErrorsBySource(source, errorPrefix) {
        if (!source)
            throw new Error('error_source parameter is required');

        const errorGr = new GlideRecord(EFConstants.TABLES.ERROR);
        errorGr.addQuery(EFConstants.ERROR_FIELDS.ERROR_SOURCE, source);
        if (errorPrefix)
            errorGr.addQuery(EFConstants.ERROR_FIELDS.APPLICATION + '.' + EFConstants.ERROR_SOURCE_APPLICATION_FIELDS.ERROR_PREFIX, errorPrefix);
        errorGr.query();
        return errorGr;
    }

    /**
     * Gets error records by key
     * @param {string} key - The error key to search for
     * @param {string} errorPrefix - The error prefix from sys_error_appl.error_prefix
     *                               This is the unique identifier for the source application (e.g., 'SN-CMDB', 'SN-DISC')
     * @returns {GlideRecord} The error GlideRecords (empty if none found)
     */
    static getErrorsByKey(key, errorPrefix) {
        if (!key)
            throw new Error('key parameter is required');

        const errorGr = new GlideRecord(EFConstants.TABLES.ERROR);
        errorGr.addQuery(EFConstants.ERROR_FIELDS.KEY, key);
        if (errorPrefix)
            errorGr.addQuery(EFConstants.ERROR_FIELDS.APPLICATION + '.' + EFConstants.ERROR_SOURCE_APPLICATION_FIELDS.ERROR_PREFIX, errorPrefix);
        errorGr.query();
        return errorGr;
    }

    /**
     * Retrieves all errors for a specific source application using its error prefix.
     * This is useful for getting all errors scoped to a particular application or domain.
     *
     * @param {string} errorPrefix - The error prefix from sys_error_appl.error_prefix
     *                               This is the unique identifier for the source application (e.g., 'SN-CMDB', 'SN-DISC')
     * @returns {GlideRecord} GlideRecord containing all errors for this application (empty if none found)
     * @throws {Error} If errorPrefix parameter is not provided
     * @example
     * // Get all CMDB errors
     * const cmdbErrors = EFErrorUtil.getErrorsByApplicationPrefix('CMDB');
     * gs.info('Error: ' + cmdbErrors.getRowCount());
     *
     */
    static getErrorsByApplicationPrefix(errorPrefix) {
        if (!errorPrefix)
            throw new Error('Error prefix parameter is required');

        const errorGr = new GlideRecord(EFConstants.TABLES.ERROR);
        errorGr.addQuery(EFConstants.ERROR_FIELDS.APPLICATION + '.' + EFConstants.ERROR_SOURCE_APPLICATION_FIELDS.ERROR_PREFIX, errorPrefix);
        errorGr.query();
        return errorGr;
    }

    /**
     * Ignores one or more errors by setting their state to ignored
     * @param {GlideRecord|string|Array<string>} errorGrOrIds - The error GlideRecord, sys_id, or array of sys_ids to ignore
     * @returns {Object} EFResponse object with success status and operation details
     */
    static ignoreErrors(errorGrOrIds) {
        return this._updateErrorState(errorGrOrIds, EFConstants.ERROR_STATES.IGNORED);
    }

    /**
     * Closes one or more errors by setting their state to closed
     * @param {GlideRecord|string|Array<string>} errorGrOrIds - The error GlideRecord, sys_id, or array of sys_ids to close
     * @returns {Object} EFResponse object with success status and operation details
     */
    static closeErrors(errorGrOrIds) {
        return this._updateErrorState(errorGrOrIds, EFConstants.ERROR_STATES.CLOSED);
    }

    /**
     * Reopens one or more errors by setting their state to open
     * @param {GlideRecord|string|Array<string>} errorGrOrIds - The error GlideRecord, sys_id, or array of sys_ids to reopen
     * @returns {Object} EFResponse object with success status and operation details
     */
    static reopenErrors(errorGrOrIds) {
        return this._updateErrorState(errorGrOrIds, EFConstants.ERROR_STATES.OPEN);
    }

    /**
     * Internal method to update error state for single or multiple errors
     * @private
     * @param {GlideRecord|string|Array<string>} errorGrOrIds - The error GlideRecord, sys_id, or array of sys_ids
     * @param {string} newState - The new state to set (e.g., 'ignored', 'closed', 'open')
     * @returns {Object} EFResponse object with success status and operation details
     */
    static _updateErrorState(errorGrOrIds, newState) {
        try {
            if (!errorGrOrIds)
                throw new Error('No input provided');

            let errorGr;
            let errorCount = 0;

            if (errorGrOrIds instanceof GlideRecord) {
                if (!errorGrOrIds.isValidRecord())
                    throw new Error('Invalid GlideRecord provided');
                errorGr = errorGrOrIds;
                errorCount = 1;
            } else if (Array.isArray(errorGrOrIds)) {
                if (errorGrOrIds.length === 0)
                    throw new Error('Empty array provided');
                errorGr = new GlideRecord(EFConstants.TABLES.ERROR);
                errorGr.addQuery('sys_id', 'IN', errorGrOrIds.join(','));
                errorGr.query();
                errorCount = errorGrOrIds.length;
            } else if (typeof errorGrOrIds === 'string') {
                errorGr = new GlideRecord(EFConstants.TABLES.ERROR);
                errorGr.addQuery('sys_id', errorGrOrIds);
                errorGr.query();
                errorCount = 1;
            } else {
                throw new Error('Invalid input type');
            }

            errorGr.setValue(EFConstants.ERROR_FIELDS.STATE, newState);
            const updatedCount = errorGr.updateMultiple();

            return EFResponse.success({
                    [newState]: true,
                    updated_count: updatedCount,
                    requested_count: errorCount
                })
                .withMessage(`Errors ${newState} successfully`)
                .withTimestamp()
                .toJSON();
        } catch (e) {
            EFErrorUtil.logger.error(`Error updating error state to ${newState}: ${e.message}`);
            return EFResponse.failure(e)
				.withMessage(`Failed to update errors to ${newState} state with message: ${e.message}`)
				.withTimestamp()
				.toJSON();
        }
    }

	/**
	 * Closes stale errors that haven't been updated since cutoff time for a specific source.
	 * This is useful for automatic maintenance of error code states.
	 * @param {string|GlideRecord} source - The sys_id or GlideRecord of the error source.
	 * @param {GlideDateTime|string} lastOccurrence - The cutoff date/time. Accepts a GlideDateTime object or a UTC string.
	 * @returns {void}
	 * @throws {Error} If source or lastOccurrence is missing or invalid.
	 */
	static closeStaleErrorsForSource(source, lastOccurrence) {
		if (!source)
			throw new Error('EFErrorUtil.closeStaleErrorsForSource: Missing parameter - \'source\'');

		if (!lastOccurrence)
			throw new Error('EFErrorUtil.closeStaleErrorsForSource: Missing parameter - \'lastOccurrence\'');

		// 1. Normalize Source: GlideRecord | string -> string
		let sourceId = source;
		if (typeof source === 'object' && typeof source.getUniqueValue === 'function') {
			sourceId = source.getUniqueValue();
		}

		// 2. Normalize lastOccurrence: GlideDateTime | string -> GlideDateTime
		const gdt = new GlideDateTime(lastOccurrence);
		if (!gdt.isValid()) {
			throw new Error('EFErrorUtil.closeStaleErrorsForSource: Invalid Date/Time format');
		}

		const errorsGr = new GlideRecord(EFConstants.TABLES.ERROR);
		errorsGr.addQuery(EFConstants.ERROR_FIELDS.ERROR_SOURCE, sourceId);
		errorsGr.addQuery(EFConstants.ERROR_FIELDS.STATE, '!=', EFConstants.ERROR_STATES.CLOSED);

		// Using the GDT object directly in addQuery is best practice
		errorsGr.addQuery(EFConstants.ERROR_FIELDS.LAST_OCCURRENCE, '<', gdt);

		errorsGr.setValue(EFConstants.ERROR_FIELDS.STATE, EFConstants.ERROR_STATES.CLOSED);
		errorsGr.updateMultiple();
	}

	/**
	 * Closes stale errors that haven't been updated since cutoff time for one or more error keys.
	 * @param {string|string[]} key - A single error key or an array of error keys.
	 * @param {GlideDateTime|string} lastOccurrence - The cutoff date/time. Accepts a GlideDateTime object or a UTC string.
	 * @param {string|GlideRecord} [source] - Optional. The sys_id string or the GlideRecord representing the source.
	 * @returns {void}
	 * @throws {Error} If key or lastOccurrence is missing or invalid.
	 */
	static closeStaleErrorsForKeys(key, lastOccurrence, source) {
		if (!key)
			throw new Error('EFErrorUtil.closeStaleErrorsForKeys: Missing parameter - \'key\'');

		if (!lastOccurrence)
			throw new Error('EFErrorUtil.closeStaleErrorsForKeys: Missing parameter - \'lastOccurrence\'');

		// 1. Normalize Key: string | string[] -> string[]
		const keys = Array.isArray(key) ? key : [key];

		// 2. Normalize lastOccurrence: GlideDateTime | string -> GlideDateTime
		const gdt = new GlideDateTime(lastOccurrence);
		if (!gdt.isValid())
			throw new Error('EFErrorUtil.closeStaleErrorsForKeys: Invalid Date/Time format');

		// 3. Normalize Source: GlideRecord | string -> string
		let sourceId = source;
		if (source && typeof source === 'object' && typeof source.getUniqueValue === 'function') {
			sourceId = source.getUniqueValue();
		}

		const errorsGr = new GlideRecord(EFConstants.TABLES.ERROR);
		errorsGr.addQuery(EFConstants.ERROR_FIELDS.KEY, 'IN', keys);

		if (sourceId)
			errorsGr.addQuery(EFConstants.ERROR_FIELDS.ERROR_SOURCE, sourceId);

		errorsGr.addQuery(EFConstants.ERROR_FIELDS.STATE, '!=', EFConstants.ERROR_STATES.CLOSED);
		errorsGr.addQuery(EFConstants.ERROR_FIELDS.LAST_OCCURRENCE, '<', gdt);

		errorsGr.setValue(EFConstants.ERROR_FIELDS.STATE, EFConstants.ERROR_STATES.CLOSED);
		errorsGr.updateMultiple();
	}
	
	/**
	 * Retrieves a configuration property for a source application.
	 * Falls back to the default configuration if the property is not set for the specified application.
	 * @param {string} sourceAppSysId - The sys_id of the source application
	 * @param {string} property - The configuration property name to retrieve
	 * @returns {*} The configuration property value
	 * @throws {Error} If the property doesn't exist in default config or default config record is missing
	 */
	static getConfigProp(sourceAppSysId, property) {
		const configStr = this.getOrUpdateConfigCache(sourceAppSysId);
		const config = configStr ? JSON.parse(configStr) : null;
		
		if (config && property in config) {
			return config[property];
		} else {
			const defaultConfigStr = this.getOrUpdateConfigCache(EFConstants.ERROR_SOURCE_APP_DEFAULT_SYS_ID);
			const defaultConfig = defaultConfigStr ? JSON.parse(defaultConfigStr) : null;
			if (defaultConfig && property in defaultConfig)
				return defaultConfig[property];
			else
				throw new Error(`${property} doesn't exist in default config or default config record ${EFConstants.ERROR_SOURCE_APP_DEFAULT_SYS_ID} is missing entirely`);
		}
	}
	
	/**
	 * Retrieves application configuration from cache or database.
	 * If the configuration is not cached, fetches it from the sys_error_config table and caches it.
	 * @param {string} sourceAppSysId - The sys_id of the source application
	 * @returns {string} The cached configuration value (JSON string) or empty string if not found
	 */
	static getOrUpdateConfigCache(sourceAppSysId) {
		const cachedAppConfig = sn_scoped_cache.ScopedCacheManager.get(EFConstants.CONFIG_CACHE, sourceAppSysId);
		
		if (cachedAppConfig) {
			this.logger.debug(`EFErrorUtil: Retrieved entry from error_framework_cache for app: ${sourceAppSysId}`);
			return cachedAppConfig;
		} else {
			this.logger.debug(`EFErrorUtil: Cache miss in error_framework_cache for app ${sourceAppSysId}. Retrieving config from table`);
			const dbAppConfig = _getAppConfigFromTable();
			if (!dbAppConfig)
				return '';
			
			_cacheAppConfig(dbAppConfig);
			this.logger.debug(`EFErrorUtil: Put row entry to error_framework_cache for app '${sourceAppSysId}': ${dbAppConfig.getUniqueValue()}`);
			return dbAppConfig.getValue('value');
		}
		
		// Return '' is acceptable because app config may not override defaults
		function _getAppConfigFromTable() {
			const grConfig = new GlideRecord(EFConstants.TABLES.ERROR_CONFIG);
			grConfig.get(EFConstants.ERROR_CONFIG_FIELDS.SOURCE_APPLICATION, sourceAppSysId);
			
			return grConfig.getUniqueValue() ? grConfig : '';
		}
		
		function _cacheAppConfig(dbAppConfig) {
			sn_scoped_cache.ScopedCacheManager.putRow(EFConstants.CONFIG_CACHE, sourceAppSysId, dbAppConfig.getValue('value'), dbAppConfig.getUniqueValue(), dbAppConfig.getTableName());
		}
	}
	
	/**
	 * Groups error sys_ids by their effective error code.
	 * Prefers refined_error_code over error_code when set, as it represents a more
	 * specific classification determined by the refinement engine.
	 * Performs a single query against all provided error IDs and groups the results in memory.
	 * @param {Array<string>} errorIds - The sys_ids of the errors to group
	 * @returns {Object} Map of errorCodeSysId -> [errorSysId, ...]
	 * @throws {Error} If no valid error records are found for the provided IDs
	 */
	static groupErrorsByCode(errorIds) {
		const errorGr = new GlideRecord(EFConstants.TABLES.ERROR);
		errorGr.addQuery('sys_id', 'IN', errorIds);
		errorGr.query();

		const groups = {};
		while (errorGr.next()) {
			const code = errorGr.getValue(EFConstants.ERROR_FIELDS.REFINED_ERROR_CODE) || errorGr.getValue(EFConstants.ERROR_FIELDS.ERROR_CODE);
			if (!groups[code]) groups[code] = [];
			groups[code].push(errorGr.getUniqueValue());
		}

		if (Object.keys(groups).length === 0)
			throw new Error('No valid error records found for the provided error IDs');

		return groups;
	}

	/**
	 * Abort Error Framework processing if disabled
	 * @param {string} sourceApp - The sys_id of the source application
	 * @throws If Error Framework is disabled for the source application
	 */
	static abortIfDisabled(sourceApp) {
		const enabledForApp = EFErrorUtil.getConfigProp(sourceApp, EFConstants.CONFIG_PROPERTIES.ENABLED);
		if (!enabledForApp)
			throw new Error(sn_i18n.Message.getMessage("error_framework", "EFErrorValidator: Error Framework disabled for app: {appName}", {appName: sourceApp}));
	}

	/**
	 * Returns a rate limit failure response if the transaction limit has been reached, null otherwise.
	 * @returns {Object|null} EFResponse failure object if rate limited, null if the call is allowed
	 */
	static checkRateLimit() {
		if (EFRateLimiter.isAllowed()) return null;
		const count = EFRateLimiter._count;
		const message = sn_i18n.Message.getMessage(
			'error_framework',
			'Error Framework rate limit exceeded: {count} calls in transaction',
			{ count }
		);

		return EFResponse.failure(message)
			.withMessage(message)
			.toJSON();
	}

	/**
	 * Gets the current domain ID. If domain plugin is not active, returns 'global'.
	 * Otherwise returns the current session domain ID or 'global' if not set.
	 *
	 * @returns {string} Domain ID or 'global'
	 * @example
	 * var domain = EFErrorUtil.getDomain();
	 * // Returns: current domain ID or 'global'
	 */
	static getDomain() {
		try {
			const domain = gs.getSession().getCurrentDomainID();
			return domain || 'global';
		} catch(e) {
			EFErrorUtil.logger.error('getDomain() failed: ' + e.message);
			return 'global';
		}
	}
}

// Initialize logger for the class
EFErrorUtil.logger = EFLogger.forClass('EFErrorUtil');
