/**
 * @class ErrorManager
 * @classdesc Public entry point for all Error Framework operations.
 * Client applications should use this class instead of directly calling lower-level helpers.
 */
class ErrorManager {
	constructor() {}

	/**
	 * Adds an error to the Error Framework.
	 * Validation failures are caught and result in fallback logging so as not to break caller
	 * @param {EFError|Object} error - EFError instance or error data object
	 * @returns {Object} EFResponse object with success status or failure status and error details
	 */
	static addError(error) {
		const rateLimitResponse = EFErrorUtil.checkRateLimit();
		if (rateLimitResponse) return rateLimitResponse;

		const errorData = error instanceof EFError ? error.getData() : error;

		try {
			EFErrorValidator.validate(errorData);
			
			EFErrorUtil.abortIfDisabled(errorData[EFConstants.ERROR_BUILDER_FIELDS.SOURCE_APPLICATION]);

			if (EFEventQueueUtil.isAsyncErrorProcessingEnabled(errorData[EFConstants.ERROR_BUILDER_FIELDS.SOURCE_APPLICATION])) {
				const payload = JSON.stringify(errorData);
				if (payload.length <= 4000) {
					const domainId = gs.getSession().getCurrentDomainID() || '';
					gs.eventQueue(EFConstants.EVENT_NAMES.ERROR_PROCESS, null, payload, domainId);
					return EFResponse.success({ queued: true })
						.withMessage('Error queued for async processing')
						.toJSON();
				}
				// Payload exceeds parm1 limit (4000 chars) — fall through to synchronous processing
			}

			const result = EFErrorRepository.saveError(errorData);
			const log = `Error processed successfully: ${errorData.errorCode}`;
			ErrorManager.logger.debug(log);
			return EFResponse.success(result)
				.withMessage(log)
				.toJSON();
		} catch (e) {
			const log = `Failed to add error '${errorData?.errorCode || 'unknown'}': ${e.message}`;
			ErrorManager.logger.error(log);
			ErrorManager.logger.error(sn_i18n.Message.getMessage("error_framework","ErrorManager: Fallback logging of invoked error due to ErrorManager internal failure: {errMsg}", {errMsg: errorData?.message}));
			return EFResponse.failure(e)
				.withMessage(log)
				.toJSON();
		}
	}

	/**
	 * Factory method to build an error object
	 * @param {string} errorCode - The error code (required)
	 * @param {string} key - Unique key for deduplication (required)
	 * @param {Object} [options={}] - Optional parameters
	 * @param {string} [options.source] - The source record sys_id
	 * @param {string} [options.instance] - The instance record sys_id
	 * @param {Object} [options.context] - Additional context key-value pairs
	 * @returns {EFError} A new EFError instance
	 */
	static buildError(errorCode, key, options = {}) {
		return new EFError(errorCode, key, options);
	}

	/**
	 * Classifies a contextObject to determine the appropriate error code.
	 * Evaluates active classifiers in order and returns the first matching error code.
	 *
	 * @param {Object} contextObject - The object containing error context to classify.
	 *                                 Can contain any structure (nested objects, arrays, etc.)
	 * @param {string} [errorPrefix] - Error prefix to resolve the source application (e.g., 'SN-DISC', 'SN-CMDB').
	 *                               Required unless options.sourceApplication is provided.
	 * @param {Object} [options={}] - Classification options
	 * @param {boolean} [options.isRefinement=false] - False = initial classification, true = refinement pass
	 * @param {Array<string>} [options.categories] - Optional array of category sys_ids to pre-filter classifiers (inclusion)
	 * @param {Array<string>} [options.excludeCategories] - Optional array of category sys_ids to exclude from classifier
	 *   loading. Expanded with child categories using the configured depth. Pass top-level parent sys_ids to exclude
	 *   entire category trees without enumerating descendants.
	 * @param {string} [options.sourceApplication] - Source application sys_id. Bypasses the errorPrefix lookup.
	 *   Either errorPrefix or options.sourceApplication must be provided.
	 * @returns {Object} JSON response object with structure:
	 *   - success {boolean} - True if classification found a match
	 *   - data {Object|null} - On success contains: errorCode, errorCodeSysId, classifierName, classifierSysId
	 *   - message {string} - Result message
	 * @example
	 * // Initial classification before logging (e.g., SN-DISC-1001)
	 * const result = ErrorManager.classify({
	 *     logs: ['Connection timeout', 'Database error'],
	 *     errorType: 'SQLException'
	 * }, 'SN-DISC');
	 * 
	 * // Refinement after logging (e.g., SN-DISC-1001.SSH.SWITCH)
	 * const refined = ErrorManager.classify(contextObject, 'SN-DISC', { isRefinement: true });
	 */
	static classify(contextObject, errorPrefix, options = {}) {
		return EFClassificationEngine.classify(contextObject, errorPrefix, options);
	}

	/**
	 * Refines an error by executing enrichment and classification.
	 * Orchestrates the refinement workflow: enriches context → classifies error code → updates record.
	 *
	 * @param {GlideRecord|string} errorGrOrId - The error GlideRecord or sys_id to refine
	 * @param {Object} [options={}] - Refinement options
	 * @param {Array<string>} [options.categories] - Optional array of category sys_ids to pre-filter classifiers (inclusion)
	 * @param {Array<string>} [options.excludeCategories] - Optional array of category sys_ids to exclude from classifier
	 *   loading. Expanded with child categories using the configured depth.
	 * @returns {Object} JSON response object with refinement result:
	 *   - success {boolean} - True if refinement completed successfully
	 *   - message {string} - Result message
	 *   - data {Object|null} - On success contains refinement details
	 *   - error {Object|null} - On failure contains error details
	 * @example
	 * // Successful refinement with classification
	 * const result = ErrorManager.refine(errorSysId);
	 * // Returns:
	 * // {
	 * //   success: true,
	 * //   message: 'Refinement successful',
	 * //   data: {
	 * //     errorSysId: 'abc123',
	 * //     refinedErrorCode: 'def456',           // sys_id of classified/refined error code
	 * //     hasRefinedContext: true,              // true if enrichers added context
	 * //     classificationResult: {               // null if classification didn't run/match
	 * //       errorCodeSysId: 'def456',
	 * //       classifierName: 'SSH Connection Classifier',
	 * //       classifierSysId: 'xyz789'
	 * //     }
	 * //   }
	 * // }
	 */
	static refine(errorGrOrId, options = {}) {
		return EFErrorRefiner.refine(errorGrOrId, options);
	}

	/**
	 * Retrieves an existing error record matching the given criteria.
	 * Useful for checking if an error already exists before creating a new one.
	 *
	 * @param {Object} criteria - Search criteria object
	 * @param {string} [criteria.key] - Unique error key
	 * @param {string} [criteria.error_source] - Source record sys_id
	 * @param {string} [criteria.error_source_table] - Source table name
	 * @param {string} [criteria.error_code] - Error code reference
	 * @param {string} [criteria.application] - Source application reference
	 * @returns {GlideRecord|null} The error GlideRecord if found, null otherwise
	 * @see {@link EFErrorUtil.getError} for implementation details
	 * @example
	 * const existingError = ErrorManager.getError({
	 *     key: 'config_error',
	 *     error_source: recordSysId,
	 *     error_source_table: 'sys_properties'
	 * });
	 */
	static getError(criteria) {
		return EFErrorUtil.getError(criteria);
	}

	/**
	 * Retrieves errors based on the provided param
	 * @param {Array<string>|string} param - Array of keys, sys_id of the sys_error_inst, or sys_id of the error source
	 * @returns {GlideRecord|null} The error GlideRecord or null if no matching errors are found
	 */
	static getErrors(param) {
		return EFErrorUtil.getErrors(param);
	}

	/**
	 * Retrieves error records by their sys_ids.
	 * Useful for bulk operations when you have specific error record IDs.
	 *
	 * @param {Array<string>|string} sysIds - Array of error record sys_ids or a single sys_id
	 * @returns {GlideRecord} GlideRecord containing the requested errors (empty if none found)
	 * @throws {Error} If sysIds is invalid
	 * @see {@link EFErrorUtil.getErrorsBySysIDs}
	 * @example
	 * const errors = ErrorManager.getErrorsBySysIDs(['abc123', 'def456']);
	 */
	static getErrorsBySysIDs(sysIds) {
		return EFErrorUtil.getErrorsBySysIDs(sysIds);
	}

	/**
	 * Retrieves all errors using a specific error code.
	 *
	 * @param {string} errorCode - The error code string (e.g., 'SN-CMDB-001')
	 * @returns {GlideRecord} GlideRecord containing all errors with this error code (empty if none found)
	 * @throws {Error} If errorCode is not provided
	 * @see {@link EFErrorUtil.getErrorsByCode}
	 * @example
	 * const errors = ErrorManager.getErrorsByCode('SN-CMDB-001');
	 */
	static getErrorsByCode(errorCode) {
		return EFErrorUtil.getErrorsByCode(errorCode);
	}

	/**
	 * Gets errors by source
	 * @param {string} source - The sys_id of the error source
     * @param {string} errorPrefix - The error prefix from sys_error_appl.error_prefix
     *                               This is the unique identifier for the source application (e.g., 'SN-CMDB', 'SN-DISC')
	 * @returns {GlideRecord} The error GlideRecords (empty if none found)
	 */
	static getErrorsBySource(source, errorPrefix) {
		return EFErrorUtil.getErrorsBySource(source, errorPrefix);
	}

	/**
	 * Gets errors by key
	 * @param {string} key - The error key to search for
     * @param {string} errorPrefix - The error prefix from sys_error_appl.error_prefix
     *                               This is the unique identifier for the source application (e.g., 'SN-CMDB', 'SN-DISC')
	 * @returns {GlideRecord} The error GlideRecords (empty if none found)
	 */
	static getErrorsByKey(key, errorPrefix) {
		return EFErrorUtil.getErrorsByKey(key, errorPrefix);
	}
	
	/**
	 * Retrieves a configuration property for a specific source application. Retrieves default if not set/found per app.
	 *
	 * @param {string} prefix - The error prefix from sys_error_appl.error_prefix
	 * @param {string} property - The property to retrieve
	 * @returns {string|null} The value of the property or null if not found
	 */
	static getConfigProp(prefix, property) {
		const sourceAppSysId = _getErrorSourceAppSysId(prefix);
		if (!sourceAppSysId) {
			this.logger.error(sn_i18n.Message.getMessage("error_framework", "ErrorManager: Source Application record not found for {appPrefix}", {appPrefix: prefix}));
			return null;
		}
		
		try {
			return EFErrorUtil.getConfigProp(sourceAppSysId, property);
		} catch (e) {
			this.logger.error(e.message);
			return null;
		}
		
		function _getErrorSourceAppSysId(prefix) {
			const sourceAppGr = new GlideRecord(EFConstants.TABLES.ERROR_SOURCE_APPLICATION);
			if (!sourceAppGr.get(EFConstants.ERROR_SOURCE_APPLICATION_FIELDS.ERROR_PREFIX, prefix))
				return null;
			return sourceAppGr.getUniqueValue();
		}
	}

	/**
	 * Ignores one or more errors
	 * @param {GlideRecord|string|Array<string>} errorGrOrIds - The error GlideRecord, sys_id, or array of sys_ids to ignore
	 * @returns {Object} EFResponse object with success status and operation details
	 */
	static ignoreErrors(errorGrOrIds) {
		return EFErrorUtil.ignoreErrors(errorGrOrIds);
	}

	/**
	 * Closes one or more errors
	 * @param {GlideRecord|string|Array<string>} errorGrOrIds - The error GlideRecord, sys_id, or array of sys_ids to close
	 * @returns {Object} EFResponse object with success status and operation details
	 */
	static closeErrors(errorGrOrIds) {
		return EFErrorUtil.closeErrors(errorGrOrIds);
	}

	/**
	 * Marks one or more errors as open
	 * @param {GlideRecord|string|Array<string>} errorGrOrIds - The error GlideRecord, sys_id, or array of sys_ids to mark as open
	 * @returns {Object} EFResponse object with success status and operation details
	 */
	static reopenErrors(errorGrOrIds) {
		return EFErrorUtil.reopenErrors(errorGrOrIds);
	}

	/**
	 * Executes an action for a list of error sysIDs.
	 * Error code is derived from the error records and grouped automatically,
	 * so mixed-code error lists will create separate executions per error code.
	 * @param {string} actionId - The sys_id of the action to execute
	 * @param {Array<string>} errorIds - The sys_ids of the errors to execute the action against
	 * @param {Object} [params] - Optional key-value parameters passed through to the action executor.
	 *   For script actions, `params` is available as a top-level variable in the script scope.
	 *   For flow/subflow actions, `params` is added to the flow inputs.
	 *   For REST actions, `params` is included in the request body.
	 * @returns {Object} EFResponse object with success status containing array of execution sys_ids, or failure status
	 */
	static executeAction(actionId, errorIds, params) {
		try {
			const errorsByCode = EFErrorUtil.groupErrorsByCode(errorIds);
			const orchestrator = new EFActionExecutionOrchestrator();
			const results = [];

			for (const [errorCodeSysId, groupedErrorIds] of Object.entries(errorsByCode)) {
				const executionId = orchestrator.createExecution(actionId, groupedErrorIds, errorCodeSysId, params);
				if (executionId !== null) {
					results.push(executionId);
				}
			}

			if (results.length === 0) {
				const msg = `No applicable actions found for action '${actionId}' with the provided error IDs`;
				ErrorManager.logger.warn(msg);
				return EFResponse.failure(new Error(msg))
					.withMessage(msg)
					.toJSON();
			}

			ErrorManager.logger.debug(`Action initiated successfully: ${actionId}`);
			return EFResponse.success(results)
				.withMessage('Action initiated successfully')
				.toJSON();
		} catch (e) {
			ErrorManager.logger.error(`Failed to initiate action '${actionId}': ${e.message}`);
			return EFResponse.failure(e)
				.withMessage(e.message)
				.toJSON();
		}
	}

	/**
	 * Update error and category counts across current domain.
	 * @param {string} application - The sys_id of sys_error_appl to update counts for
	 * @param {GlideDateTime|string} [aggregationDate] - Optional date to use for time series aggregation
	 * @param {string} [scheduleSysId] - Optional sys_id of the sys_error_agg_schedule record. When provided, per-domain watermark state is managed automatically inside EFErrorCounter.
	 * @returns {Object} EFResponse object with success status and aggregation details
	 */
	static aggregateCounts(application, aggregationDate, scheduleSysId) {
		try {
			EFErrorUtil.abortIfDisabled(application);

			ErrorManager.logger.debug(`Starting count aggregation for application: ${application}`);
			const errorCounter = new EFErrorCounter(application, aggregationDate, scheduleSysId);
			const result = errorCounter.aggregateCounts();
			ErrorManager.logger.debug(`Count aggregation completed for application: ${application}`);

			return result
		} catch (e) {
			const log = sn_i18n.Message.getMessage("error_framework","ErrorManager: Failed to aggregateCounts: {errMsg}", {errMsg: e.message});
			ErrorManager.logger.error(log);
			return EFResponse.failure(e).withMessage(log).toJSON();
		}
	}

	/**
	 * Updates instance-specific error statistics.
	 * This is typically called after error instance creation to update metrics.
	 *
	 * @param {string} application - The sys_id of the source application (sys_error_appl)
	 * @param {string} instance - The sys_id of the error instance (sys_error_inst)
	 * @returns {Object} EFResponse object with success status and aggregation details
	 * @example
	 * // Update counts after creating an error instance
	 * ErrorManager.aggregateInstanceCounts(applicationSysId, instanceSysId);
	 */
	static aggregateInstanceCounts(application, instance) {
		try {
			EFErrorUtil.abortIfDisabled(application);
			
			ErrorManager.logger.debug(`Starting instance count update for: ${instance}`);
			const errorCounter = new EFErrorCounter(application);
			const result = errorCounter.aggregateInstanceCounts(instance);
			ErrorManager.logger.debug(`Instance count update completed for: ${instance}`);
			
			return result;
		} catch (e) {
			const log = sn_i18n.Message.getMessage("error_framework","ErrorManager: Failed to aggregateInstanceCounts: {errMsg}", {errMsg: e.message});
			ErrorManager.logger.error(log);
			return EFResponse.failure(e).withMessage(log).toJSON();
		}
	}

	/**
	 * Creates a specialized logger for action execution contexts.
	 * The logger can write to both system logs and the action execution log table.
	 *
	 * @param {string} executionItemId - The sys_id of the action execution item (sys_error_action_exec_item)
	 * @param {string} [source='ActionExecution'] - Optional source name for the logger
	 * @returns {EFLogger} Logger instance configured with execution context
	 * @example
	 * const logger = ErrorManager.getActionExecutionLogger(executionItemId);
	 * logger.info('Processing started', true); // Logs to execution table
	 * logger.debug('Debug info'); // Logs to syslog
	 */
	static getActionExecutionLogger(executionItemId, source) {
		const logger = EFLogger.forClass(source || 'ActionExecution');
		logger.setExecutionContext(executionItemId);
		return logger;
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
		ErrorManager.logger.debug(`Starting stale error closure`);
		EFErrorUtil.closeStaleErrorsForSource(source, lastOccurrence);
		ErrorManager.logger.debug(`Stale error closure completed`);
	}

	/**
	 * Returns the list of actions available for a given error code.
	 * Useful for LLM/agentic callers that need to discover available remediations and their parameter schemas.
	 * @param {string} errorCode - The error code string (e.g., 'SN-CMDB-001') or sys_id
	 * @returns {Array<Object>} Array of action objects, each containing:
	 *   - sys_id {string} - Action sys_id
	 *   - name {string} - Display name
	 *   - type {string} - Action type (script, flow_action, subflow, scripted_rest_resource)
	 *   - message {string} - Action description
	 *   - input {Object|null} - For parameterized actions, describes the expected params schema:
	 *       { params: [{ name, type, label, required, description }] }
	 */
	static getActions(errorCode) {
		return new EFActionUtils().getActions(errorCode);
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
		ErrorManager.logger.debug(`Starting stale error for key closure`);
		EFErrorUtil.closeStaleErrorsForKeys(key, lastOccurrence, source);
		ErrorManager.logger.debug(`Stale error for key closure completed`);
	}
}

// Initialize logger for the class
ErrorManager.logger = EFLogger.forClass('ErrorManager');
