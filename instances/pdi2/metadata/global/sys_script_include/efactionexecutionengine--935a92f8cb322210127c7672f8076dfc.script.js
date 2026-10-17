/**
 * @class EFActionExecutionEngine
 * @classdesc Engine responsible for executing error actions and managing execution lifecycle
 */
class EFActionExecutionEngine {
    /**
     * Initializes the execution engine with execution item
     * @param {GlideRecord} executionItemGr - The action execution item GlideRecord
     */
    constructor(executionItemGr) {
        this.factory = new EFActionExecutorFactory();
        this.utils = new EFActionUtils();
        this.constants = EFConstants;
        this.itemGr = executionItemGr;
        this.logger = EFLogger.forClass('EFActionExecutionEngine');
        this.logger.setExecutionContext(executionItemGr.getValue('sys_id'));
    }

    /**
     * Executes the action and manages complete execution lifecycle.
     * Handles state transitions, timing, logging, and result storage.
     * @returns {Object} The execution result with success flag and execution details
     * @throws {Error} If request parameters are invalid or execution fails
     */
    execute() {
        const startTime = new GlideDateTime();

        try {
            const req = JSON.parse(this.itemGr.getValue('request'));
            const actionId = req.actionId;
            const errorMsgSysId = req.errorMsgSysId;
            const errorMsgSysIds = req.errorMsgSysIds;
            const params = req.params;

            if (!actionId || (!errorMsgSysId && !errorMsgSysIds))
                throw new Error(sn_i18n.Message.getMessage("error_framework", "Missing required parameters in request. Found: actionId={actionId}, errorMsgSysId={errorMsgSysId}, errorMsgSysIds={errorMsgSysIds}", {
                    actionId: !!actionId,
                    errorMsgSysId: !!errorMsgSysId,
                    errorMsgSysIds: !!errorMsgSysIds
                }));

            this._updateExecutionState(EFConstants.EXECUTION_STATES.IN_PROGRESS);

            const actionGr = new GlideRecord(this.constants.TABLES.ERROR_ACTION);
            if (!actionGr.get('sys_id', actionId))
                throw new Error(sn_i18n.Message.getMessage("error_framework", "Could not find action with sys_id: {actionId}", {actionId: actionId}));

            this.logger.debug(sn_i18n.Message.getMessage("error_framework", "Starting execution: {actionName}", {actionName: actionGr.getValue('name')}), true);

            // Build context and execute
            const actionType = actionGr.getValue('type');
            const context = this._buildContextForActionExecution(actionGr, errorMsgSysId, params);
            const executor = this.factory.createExecutor(actionType);
            executor.validateContext(context);
            const result = executor.execute(context);
            this._validateExecutionResult(result);

            const state = result.success ? EFConstants.EXECUTION_STATES.COMPLETED : EFConstants.EXECUTION_STATES.FAILED;

            const errorMsg = result.success ? null : (result.message || sn_i18n.getMessage("error_framework", "Action execution failed"));
            
            // Close errors if action was successful and errorToClose array is provided
            if (result.success && result.errorsToClose && Array.isArray(result.errorsToClose) && result.errorsToClose.length > 0) {
                try {
                    ErrorManager.closeErrors(result.errorsToClose);
                    this.logger.debug(sn_i18n.Message.getMessage("error_framework", "Closed {count} error(s): {errorIds}", {
                        count: result.errorsToClose.length,
                        errorIds: result.errorsToClose.join(', ')
                    }), true);
                } catch (e) {
                    this.logger.error(sn_i18n.Message.getMessage("error_framework", "Failed to close errors: {errorMessage}", {
                        errorMessage: e.message
                    }), true);
                }
            }

            this._completeExecution(state, result, errorMsg, startTime);

            if (result.success)
                this.logger.debug(sn_i18n.Message.getMessage("error_framework", "Execution completed successfully"), true);
            else
                this.logger.error(sn_i18n.Message.getMessage("error_framework", "Execution failed: {errorMsg}", {errorMsg: errorMsg}), true);

        } catch (e) {
            const errorMessage = e.message || sn_i18n.getMessage("error_framework", "An unexpected error occurred during action execution");
            this._completeExecution(EFConstants.EXECUTION_STATES.FAILED, null, errorMessage, startTime);
            this.logger.error('Unexpected error during execution: ' + errorMessage);
            this.logger.error(sn_i18n.Message.getMessage("error_framework", "Failed to execute the action: {errorMessage}", {errorMessage: errorMessage}), true);
        }
    }

    /**
     * Updates the execution item state.
     * Parent execution state is managed exclusively by the EFUpdateParentState business rule.
     * @private
     * @param {string} state - The new state
     */
    _updateExecutionState(state) {
        this.itemGr.state = state;
        this.itemGr.update();
    }

    /**
     * Completes the execution by updating state, response, and timing
     * @private
     * @param {string} state - Final state (completed/failed)
     * @param {Object} result - Execution result
     * @param {string} errorMsg - Error message if failed
     * @param {GlideDateTime} startTime - Execution start time
     */
    _completeExecution(state, result, errorMsg, startTime) {
        const endTime = new GlideDateTime();
        const duration = endTime.getNumericValue() - startTime.getNumericValue();

        this.itemGr.state = state;
        this.itemGr.execution_time_ms = duration;

        if (result)
            this.itemGr.response = JSON.stringify(result);

        if (errorMsg)
            this.itemGr.error_message = errorMsg;

        this.itemGr.update();
        this.logger.debug(sn_i18n.Message.getMessage("error_framework", "Completed in {duration}ms", {duration: duration}), true);
    }

    /**
     * Validates the execution result structure
     * @private
     * @param {Object} result - The execution result to validate
     * @throws {Error} If result is invalid or missing required fields
     */
    _validateExecutionResult(result) {
        if (!result || typeof result !== 'object')
            throw new Error(sn_i18n.getMessage("error_framework", "Invalid executor response format. Expected an object."));

        if (typeof result.success !== 'boolean')
            throw new Error(sn_i18n.getMessage("error_framework", "Executor response missing 'success' field"));
    }

    /**
     * Builds context for action execution based on action type
     * @private
     * @param {GlideRecord} actionGr - The action GlideRecord
     * @param {string} errorMsgSysId - The error message system ID
     * @param {Object} [params] - Optional parameters from the original executeAction call
     * @returns {Object} Context object for execution
     * @throws {Error} If action type is unsupported
     */
    _buildContextForActionExecution(actionGr, errorMsgSysId, params) {
        // Create base context with executionSysId and either individual or bulk error IDs
        const req = JSON.parse(this.itemGr.getValue('request'));
        const errorMsgSysIds = req.errorMsgSysIds;

        const context = {
            executionSysId: this.itemGr.getValue('sys_id'),
            params: params || {}
        };

        if (errorMsgSysIds && Array.isArray(errorMsgSysIds)) {
            context.errorSysIds = errorMsgSysIds;
        } else {
            context.errorSysId = errorMsgSysId;
        }

        const actionType = actionGr.getValue('type');
        switch (actionType) {
            case EFConstants.ACTION_TYPES.SCRIPT:
                context.scriptGr = actionGr;
                return context;
            case EFConstants.ACTION_TYPES.SUBFLOW: {
                const subFlowGr = new GlideRecord(actionGr.getValue('target_document_table'));
                if (subFlowGr.get('sys_id', actionGr.getValue('target_document'))) {
                    context.subflowName = subFlowGr.getValue('internal_name');
                }
                return context;
            }
            case EFConstants.ACTION_TYPES.FLOW_ACTION: {
                const flowActionGr = new GlideRecord(actionGr.getValue('target_document_table'));
                if (flowActionGr.get('sys_id', actionGr.getValue('target_document'))) {
                    context.flowActionName = flowActionGr.getValue('internal_name');
                }
                return context;
            }
            case EFConstants.ACTION_TYPES.SCRIPTED_REST_RESOURCE: {
                const restApiGr = new GlideRecord(actionGr.getValue('target_document_table'));
                if (restApiGr.get('sys_id', actionGr.getValue('target_document'))) {
                    const operationUri = restApiGr.getValue('operation_uri');
                    let endpoint = this.utils.getInstanceURL() + operationUri;
                    context.method = restApiGr.getValue('http_method');
                    context.endpoint = endpoint;
                }
                return context;
            }
            default:
                throw new Error(sn_i18n.Message.getMessage("error_framework", "Unsupported action type '{actionType}'. Please check action configuration.", {actionType: actionType}));
        }
    }

    /**
     * Executes an action asynchronously
     * @param {string} actionType - The type of action
     * @param {Object} context - The execution context
     */
    executeActionAsync(actionType, context) {
        // Implement async logic if needed
    }
}
