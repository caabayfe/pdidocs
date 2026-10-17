const EFActionExecutionOrchestrator = Class.create();
EFActionExecutionOrchestrator.prototype = {
    initialize: function() {
        this.constants = EFConstants;
        this.utils = new EFActionUtils();
        this.logger = EFLogger.forClass('EFActionExecutionOrchestrator');
    },

    /**
     * Creates a new execution record and its items
     */
    createExecution: function(actionSysId, errorSysIds, errorCodeSysId, params) {
        if (!actionSysId || !errorSysIds || !errorCodeSysId || errorSysIds.length === 0)
            throw new Error(sn_i18n.Message.getMessage("error_framework", "Missing required parameters for action execution creation"));

        let source_app, is_bulk;
        const actionGR = this.utils.getTableRecordGr(EFConstants.TABLES.ERROR_ACTION, 'sys_id', actionSysId);
        if (actionGR.next()) {
            source_app = actionGR.getValue("source_application");
            is_bulk = actionGR.getValue("is_bulk") == true;
        }

        this.logger.debug('Checking if action ' + actionSysId + ' is applicable for error code ' + errorCodeSysId);
        if (!this.utils.isActionApplicable(actionSysId, errorCodeSysId)) {
            this.logger.warn('Action ' + actionSysId + ' is not applicable to error code ' + errorCodeSysId + ' - verify sys_error_code_to_action_m2m mapping exists');
            return null;
        }

        const execution = new GlideRecord(this.constants.TABLES.ERROR_ACTION_EXECUTION);
        execution.initialize();
        execution.action = actionSysId;
        execution.state = 'ready';
        execution.run_as = gs.getUserID();
        execution.source_application = source_app;
        execution.error_code = errorCodeSysId;

        const executionSysId = execution.insert();

        // Advance parent to 'queued' before inserting items so that EFUpdateParentState,
        // which fires synchronously on item completion, sees state IN ('queued','in_progress')
        // and successfully transitions the parent to its terminal state.
        execution.state = "queued";
        execution.update();

        if (is_bulk) {
            // For bulk actions, create single execution item with all error_sys_ids
            const executionItemId = this._createBulkExecutionItem(executionSysId, errorSysIds, actionSysId, source_app, params);
            this.logger.debug('Bulk action execution item created: ' + executionItemId);
        } else {
            // For individual actions, create separate execution items
            for (let i = 0; i < errorSysIds.length; i++) {
                const executionItemId = this._createExecutionItem(executionSysId, errorSysIds[i], actionSysId, source_app, params);
                this.logger.debug('Action execution item created: ' + executionItemId);
            }
        }

        return executionSysId;
    },

    /**
     * Creates a single execution item for individual actions
     */
    _createExecutionItem: function(executionSysId, errorSysId, actionSysId, source_app, params) {
        const item = new GlideRecord(this.constants.TABLES.ERROR_ACTION_EXECUTION_ITEM);
        item.initialize();
        item.action_execution = executionSysId;
        item.source_application = source_app;
        item.error = errorSysId;
        item.state = 'queued';
        const req = { actionId: actionSysId, errorMsgSysId: errorSysId };
        if (params) req.params = params;
        item.request = JSON.stringify(req);
        return item.insert();
    },

    /**
     * Creates a single execution item for bulk actions with all error_sys_ids
     */
    _createBulkExecutionItem: function(executionSysId, errorSysIds, actionSysId, source_app, params) {
        const item = new GlideRecord(this.constants.TABLES.ERROR_ACTION_EXECUTION_ITEM);
        item.initialize();
        item.action_execution = executionSysId;
        item.source_application = source_app;
        // For bulk actions, error field is optional (as per schema update)
        item.state = 'queued';
        const req = { actionId: actionSysId, errorMsgSysIds: errorSysIds, isBulk: true };
        if (params) req.params = params;
        item.request = JSON.stringify(req);
        return item.insert();
    },

    processItem: function(itemSysId) {
        const item = new GlideRecord(this.constants.TABLES.ERROR_ACTION_EXECUTION_ITEM);
        if (!item.get(itemSysId)) {
            this.logger.error("Item not found: " + itemSysId);
            return false;
        }
        
        // Execute the action through engine
        const engine = new EFActionExecutionEngine(item);
        engine.execute();

        return true;
    },


    type: 'EFActionExecutionOrchestrator'
};
