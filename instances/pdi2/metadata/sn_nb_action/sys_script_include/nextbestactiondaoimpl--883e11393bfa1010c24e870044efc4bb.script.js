var NextBestActionDAOImpl = Class.create();
NextBestActionDAOImpl.prototype = {
    initialize: function() {
        this._log = new global.GSLog(sn_nb_action.Constants.PROP_LOG_LEVEL, this.type);
    },
    getRules: function(currentRecord, fields, ruleContext) {
        var hasUnsavedChanges = fields && Object.keys(fields).length > 0 ? true : false;
        var fieldNames = hasUnsavedChanges ? Object.keys(fields) : [];
        var fieldsQuery = '';
        if (hasUnsavedChanges) {
            for (var j = 0; j < fieldNames.length; j++) {
                if (j == 0)
                    fieldsQuery = '^' + sn_nb_action.Constants.COL_FIELD_AFF_RULE + 'LIKE' + fieldNames[j];
                else
                    fieldsQuery = fieldsQuery + '^OR' + sn_nb_action.Constants.COL_FIELD_AFF_RULE + 'LIKE' + fieldNames[j];

            }
        }
        var currentContextId = ruleContext.getUniqueValue();
        var currentContextTable = ruleContext.getValue(sn_nb_action.Constants.COL_CONTEXT);
        var parentContextIds = this.getHierarchicalParentContextIds(currentContextId, currentContextTable);

        var rules = new GlideRecord(sn_nb_action.Constants.TBL_RULE_BASE);
        var currentTableQuery = sn_nb_action.Constants.COL_ACTIVE + "=true^" +
            sn_nb_action.Constants.COL_RULE_CONTEXT + "=" + currentContextId + fieldsQuery;

        var parentTableQuery = parentContextIds.length > 0 ?
            sn_nb_action.Constants.COL_ACTIVE + "=true^" +
            sn_nb_action.Constants.COL_RULE_CONTEXT + "IN" + parentContextIds + "^" +
            sn_nb_action.Constants.COL_APPLIES_TO_CHILD_TABLES + "=true" + fieldsQuery :
            '';

        var encodedQuery = parentTableQuery ? currentTableQuery + "^NQ" + parentTableQuery : currentTableQuery;

        rules.addEncodedQuery(encodedQuery);
        rules.orderBy(sn_nb_action.Constants.COL_ORDER);
        rules.query();

        return rules.hasNext() ? rules : null;
    },
    /**
     * @param {Array} parentContextIds - parent context ids of the current context table
     * Iteratively fetches all parent context IDs from TBL_RULE_CONTEXT
     * Ensures that only valid parent contexts (including grandparent contexts) are considered.
     */
    getHierarchicalParentContextIds: function(currentContextId, currentContextTable) {
        this.getRAParentContextMethods = new sn_nb_action.GetRAParentContextMethods();
        var parentContextIds = [];
        var currentId = currentContextId;
        var currentTable = currentContextTable;

        while (currentId) {
            var ruleContextGr = new GlideRecord(sn_nb_action.Constants.TBL_RULE_CONTEXT);
            ruleContextGr.addQuery(sn_nb_action.Constants.COL_SYS_ID, currentId);
            ruleContextGr.addActiveQuery();
            ruleContextGr.query();

            if (!ruleContextGr.next()) {
                this._log.error("Active context record with sys id - " + currentId + " is not found while searching hierarchical parent contexts");
                break;
            }

            var parentContextId = ruleContextGr.getValue(sn_nb_action.Constants.COL_MAP_PARENT_CONTEXT);
            if (!parentContextId) {
                break;
            }

            // Fetch parent context's table
            var parentContextGr = new GlideRecord(sn_nb_action.Constants.TBL_RULE_CONTEXT);
            parentContextGr.addQuery(sn_nb_action.Constants.COL_SYS_ID, parentContextId);
            parentContextGr.addActiveQuery();
            parentContextGr.query();

            if (!parentContextGr.next()) {
                this._log.error("Active parent context record with sys id - " + parentContextId + " is not found while searching hierarchical parent contexts.");
                break;
            }

            var parentContextTable = parentContextGr.getValue(sn_nb_action.Constants.COL_CONTEXT);
            var expectedParentTables = this.getRAParentContextMethods.fetchParentTables(currentTable);

            if (expectedParentTables.includes(parentContextTable)) {
                parentContextIds.push(parentContextId);
                currentId = parentContextId;
                currentTable = parentContextTable;
            } else {
                this._log.error("Parent context table - " + parentContextTable + " is not a valid parent of the child context table - " + currentTable +
                    ", since the actual expected parent tables are - " + JSON.stringify(expectedParentTables));
                break;
            }
        }
        return parentContextIds;
    },
    getActionTypes: function() {
        var actionTypes = new GlideRecord(sn_nb_action.Constants.TBL_ACTION_TYPE_DEFINITION);
        actionTypes.addActiveQuery();
        actionTypes.query();
        if (actionTypes.hasNext())
            return actionTypes;

        return false;
    },
    /*
     * Returns a map of action type definition with table name key and action type definition as value
     */
    loadActionTypesByTable: function() {
        var actionTypesRecord = this.getActionTypes();
        if (actionTypesRecord) {
            var actionTypes = {};
            while (actionTypesRecord.next()) {
                var actionType = {};
                actionType[sn_nb_action.Constants.COL_SYS_ID] = actionTypesRecord.getUniqueValue();
                actionType[sn_nb_action.Constants.COL_NAME] = actionTypesRecord.getValue(sn_nb_action.Constants.COL_NAME);
                actionType[sn_nb_action.Constants.COL_TABLE_NAME] = actionTypesRecord.getValue(sn_nb_action.Constants.COL_TABLE_NAME);
                var rendererRecord = actionTypesRecord[sn_nb_action.Constants.COL_RENDERER].getRefRecord();
                actionType[sn_nb_action.Constants.COL_RENDERER] = rendererRecord.getValue(sn_nb_action.Constants.COL_TAG);
                actionTypes[actionTypesRecord.getValue(sn_nb_action.Constants.COL_TABLE_NAME)] = actionType;
            }
            return actionTypes;
        }
        return false;
    },
    /*
     * Creates and return recommended action context for the given currentRecord and ruleContext configuration
     */
    createContext: function(currentRecord, ruleContextId) {

        var userId = gs.getUserID();
        var context = new GlideRecord(sn_nb_action.Constants.TBL_ACTION_CONTEXT);
        context.initialize();
        context.setValue(sn_nb_action.Constants.COL_CONTEXT_TABLE, currentRecord.getTableName());
        context.setValue(sn_nb_action.Constants.COL_DOCUMENT, currentRecord.getUniqueValue());
        context.setValue(sn_nb_action.Constants.COL_USER, userId);
        context.setValue(sn_nb_action.Constants.COL_RULE_CONTEXT, ruleContextId);
        var contextId = "";
        try {
            contextId = context.insert();
            if (!gs.nil(contextId)) {
                this._log.debug("Context " + context.getDisplayValue() + " created.");
                return context;
            }
        } finally {
            if (gs.nil(contextId))
                return this.getContext(currentRecord);

        }

        return false;
    },
    getContext: function(currentRecord, ruleContextId) {
        var userId = gs.getUserID();
        var context = new GlideRecord(sn_nb_action.Constants.TBL_ACTION_CONTEXT);
        context.addQuery(sn_nb_action.Constants.COL_CONTEXT_TABLE, currentRecord.getTableName());
        context.addQuery(sn_nb_action.Constants.COL_DOCUMENT, currentRecord.getUniqueValue());
        context.addQuery(sn_nb_action.Constants.COL_USER, userId);
        context.addQuery(sn_nb_action.Constants.COL_RULE_CONTEXT, ruleContextId);
        context.orderByDesc(sn_nb_action.Constants.COL_SYS_CREATED_ON);
        context.query();
        if (context.next())
            return context;

        //upgrade scenario handling
        return this._getContextUpgrade(currentRecord, userId);
    },

    getContextFromSysId: function(raContextSysId) {
        var raExecutionContext = new GlideRecord(sn_nb_action.Constants.TBL_ACTION_CONTEXT);
        raExecutionContext.get(raContextSysId);
        if (raExecutionContext.isValidRecord())
            return raExecutionContext;
        return false;
    },

    getContextFromExecutionId: function(raExecutionId) {
        var raExecutionGr = new GlideRecord(sn_nb_action.Constants.TBL_ACTION_DETAIL);
        raExecutionGr.get(raExecutionId);
        var raExecutionContext = raExecutionGr[sn_nb_action.Constants.COL_CONTEXT].getRefRecord();
        if (raExecutionContext.isValidRecord())
            return raExecutionContext;
        return false;
    },

    /**
     * Handling upgrade to RA>=v10 when rule context might not be present for existing RA Execution context records.
     * Try refetching context using just tablename, document id.
     */
    _getContextUpgrade: function(currentRecord, userId) {
        var context = new GlideRecord(sn_nb_action.Constants.TBL_ACTION_CONTEXT);
        context.addQuery(sn_nb_action.Constants.COL_CONTEXT_TABLE, currentRecord.getTableName());
        context.addQuery(sn_nb_action.Constants.COL_DOCUMENT, currentRecord.getUniqueValue());
        context.addQuery(sn_nb_action.Constants.COL_USER, userId);
        context.addNullQuery(sn_nb_action.Constants.COL_RULE_CONTEXT);
        context.query();
        if (context.next())
            return context;
        return false;
    },

    getAllContexts: function(currentRecord, ruleContextId) {
        var context = new GlideRecord(sn_nb_action.Constants.TBL_ACTION_CONTEXT);
        if (!gs.nil(ruleContextId))
            context.addEncodedQuery(sn_nb_action.Constants.COL_RULE_CONTEXT + "=" + ruleContextId + "^OR" + sn_nb_action.Constants.COL_RULE_CONTEXT + "ISEMPTY");
        context.addQuery(sn_nb_action.Constants.COL_CONTEXT_TABLE, currentRecord.getTableName());
        context.addQuery(sn_nb_action.Constants.COL_DOCUMENT, currentRecord.getUniqueValue());
        context.orderByDesc(sn_nb_action.Constants.COL_SYS_CREATED_ON);
        context.query();
        return context;
    },

    getOldContext: function(currentRecord) {
        var context = new GlideRecord(sn_nb_action.Constants.TBL_ACTION_CONTEXT);
        context.addQuery(sn_nb_action.Constants.COL_CONTEXT_TABLE, currentRecord.getTableName());
        context.addQuery(sn_nb_action.Constants.COL_DOCUMENT, currentRecord.getUniqueValue());
        context.addQuery(sn_nb_action.Constants.COL_USER, '');
        context.addEncodedQuery('stateNOT INnew,ready');
        context.orderByDesc(sn_nb_action.Constants.COL_SYS_CREATED_ON);
        context.query();
        if (context.next())
            return context;


        return false;
    },

    copyOldActionsToNewContext: function(oldContextRecord, newContextRecord) {
        var actionDetailgr = new GlideRecord(sn_nb_action.Constants.TBL_ACTION_DETAIL);
        actionDetailgr.addQuery(sn_nb_action.Constants.COL_CONTEXT, oldContextRecord.getUniqueValue());
        actionDetailgr.addEncodedQuery('stateNOT INnew');
        actionDetailgr.query();

        while (actionDetailgr.next()) {
            if (this.isInProgressGuidance(actionDetailgr))
                continue;

            actionDetailgr.setValue(sn_nb_action.Constants.COL_CONTEXT, newContextRecord.getUniqueValue());
            var inputObj = {};
            for (var input in actionDetailgr.action_inputs) {
                if (input != "sys_meta" && input != "sys_id") {
                    inputObj[input] = actionDetailgr.action_inputs[input];
                }
            }
            actionDetailgr.insert();
            for (var input1 in actionDetailgr.action_inputs) {
                if (input1 != "sys_meta" && input1 != "sys_id") {
                    actionDetailgr.action_inputs[input1] = inputObj[input1];
                }
            }

            actionDetailgr.update();
        }
        newContextRecord.setValue(sn_nb_action.Constants.COL_STATE, sn_nb_action.Constants.STATE_IN_USE);
        newContextRecord.update();
    },

    isInProgressGuidance: function(actionDetailgr) {
        if (actionDetailgr[sn_nb_action.Constants.COL_STATE] == sn_nb_action.Constants.STATE_IN_PROGRESS && actionDetailgr[sn_nb_action.Constants.COL_RECOMMENDED][sn_nb_action.Constants.COL_SYS_CLASS_NAME] == sn_nb_action.Constants.TBL_GUIDANCE)
            return true;

    },

    setContextState: function(contextRecord, state, refresh, recommendationType) {
        if (sn_nb_action.NextBestActionUtil.isValidRecord(contextRecord) && sn_nb_action.NextBestActionUtil.isValidContextState(state.toLowerCase())) {
            contextRecord.setValue(sn_nb_action.Constants.COL_STATE, state.toLowerCase());
            if (refresh) {
                if (recommendationType == sn_nb_action.Constants.VAL_FIELD_RECOMMENDATIONS)
                    contextRecord.setValue(sn_nb_action.Constants.COL_REFRESHED_ON_FIELD_TYPE, new GlideDateTime());
                else
                    contextRecord.setValue(sn_nb_action.Constants.COL_REFRESHED_ON, new GlideDateTime());

            }
            if (sn_nb_action.NextBestActionUtil.isValidString(contextRecord.update()))
                return true;
            else
                this._log.error("Could not set context state [" + contextRecord.getUniqueValue() + "," + state + "]");

        }
        return false;
    },

    setContextEvaluationStatus: function(raExecutionContextGr, evalStatus, recommendationType) {
        if (recommendationType == sn_nb_action.Constants.VAL_SIDE_PANEL_RECOMMENDATIONS) {
            raExecutionContextGr.setValue(Constants.COL_EVALUATION_STATUS, evalStatus);
            if (sn_nb_action.NextBestActionUtil.isValidString(raExecutionContextGr.update()))
                return true;
            else
                this._log.error("Could not set evaluation state [" + raExecutionContextGr.getUniqueValue() + "," + evalStatus + "]");
        }
    },

    setContextRecommendationOutput: function(raExecutionContextGr, recommendationOutput) {
        raExecutionContextGr.setValue(Constants.COL_RECOMMENDATION_OUTPUT, JSON.stringify(recommendationOutput));
        if (sn_nb_action.NextBestActionUtil.isValidString(raExecutionContextGr.update()))
            return true;
        else
            this._log.error("Could not set recommendation output for RA execution record id = " + raExecutionContextGr.getUniqueValue());
    },

    /*
     * Fetches the context inputs object from the context record based on the provided currentRecord and ruleContextId
     */
    getContextInputsObject: function(currentRecord, ruleContextId) {
        var contextRecord = this.getContext(currentRecord, ruleContextId);
        if (!contextRecord) {
            this._log.error("Could not find context for " + currentRecord.getUniqueValue());
            return {};
        }
        var contextInputsGlideVar = sn_nb_action.NextBestActionUtil.getGlideVarInputsAndLabels(contextRecord, Constants.COL_CONTEXT_INPUTS);
        return contextInputsGlideVar.inputsObject;
    },


    addActionDetails: function(contextRecord, actionDetailArr, ruleContextGr) {
        var actCount = 0;
        if (sn_nb_action.NextBestActionUtil.isValidRecord(contextRecord) && actionDetailArr && actionDetailArr.length > 0) {
            var maxAgeInDateTime = sn_nb_action.NextBestActionUtil.getMaxAge(contextRecord, ruleContextGr);
            for (var i = 0; i < actionDetailArr.length; i++) {
                var actionDetail = actionDetailArr[i];
                if (actionDetail && typeof actionDetail.isValid === "function" && actionDetail.isValid()) {
                    var actDetSysId = this._addActionDetail(contextRecord, actionDetail, maxAgeInDateTime);
                    if (sn_nb_action.NextBestActionUtil.isValidString(actDetSysId)) {
                        actCount++;
                        this._log.debug("Action " + actDetSysId + " added for " + actionDetailArr[i].getAction());
                    } else {
                        this._log.debug("Failed to add Action " + actionDetailArr[i].getAction());
                    }
                }
            }
        }
        return actCount;
    },
    _addActionDetail: function(contextRecord, actionDetail, maxAgeInDateTime) {
        var actionDetailRecord = new GlideRecord(sn_nb_action.Constants.TBL_ACTION_DETAIL);
        actionDetailRecord.initialize();
        actionDetailRecord.setValue(sn_nb_action.Constants.COL_CONTEXT, contextRecord.getUniqueValue());
        actionDetailRecord.setValue(sn_nb_action.Constants.COL_ACTION_TYPE, actionDetail.getActionType());
        actionDetailRecord.setValue(sn_nb_action.Constants.COL_RECOMMENDED, actionDetail.getAction());
        actionDetailRecord.setValue(sn_nb_action.Constants.COL_MAX_AGE, maxAgeInDateTime);
        var actionDetailRecordId = actionDetailRecord.insert();
        var actionInputs = actionDetail.getActionInputs();
        var contextSysId = actionDetailRecord.context.document;
        var actionSysId = actionDetailRecord.recommended;
        var recommendedActionParentId = sn_nb_action.NextBestActionUtil.getHashValue(contextSysId, actionSysId, actionInputs);
        actionDetailRecord.setValue(sn_nb_action.Constants.COL_PARENT_RA_ID, recommendedActionParentId);
        actionDetailRecord.update();
        if (!NextBestActionUtil.isEmptyObject(actionInputs)) {
            sn_nb_action.NextBestActionUtil.setGlideVarInputs(actionDetailRecord, sn_nb_action.Constants.COL_ACTION_INPUTS, actionInputs);
            actionDetailRecord.update();
        }
        var actionDetailOrderArr = sn_nb_action.NextBestActionUtil.getObjectValues(actionDetail.getRules());
        var actionOrderCount = this.addActionDetailOrders(actionDetailOrderArr, actionDetailRecordId);
        this._log.debug("Action Detail Order record added count " + actionOrderCount + " added for Action Detail " + actionDetailRecordId);
        return actionDetailRecordId;
    },

    addActionDetailOrders: function(actionDetailOrderArr, actionDetailRecordSysId) {
        var actionOrderCount = 0;
        if (actionDetailOrderArr && actionDetailOrderArr.length > 0) {
            for (var i = 0; i < actionDetailOrderArr.length; i++) {
                var actionDetailOrder = actionDetailOrderArr[i];
                var actionDetailRecordId = actionDetailRecordSysId || actionDetailOrder.getActionDetail();
                if (actionDetailOrder && typeof actionDetailOrder.isValid === "function" && actionDetailOrder.isValid()) {
                    var actDetOrderSysId = this._addActionDetailOrder(actionDetailOrder, actionDetailRecordId);
                    if (sn_nb_action.NextBestActionUtil.isValidString(actDetOrderSysId)) {
                        actionOrderCount++;
                        this._log.debug("Action Detail Order" + actDetOrderSysId + " added for Action Detail " + actionDetailRecordId);
                    } else {
                        this._log.debug("Failed to add Action Detail Order for Action Detail " + actionDetailRecordId);
                    }
                }
            }
        }
        return actionOrderCount;
    },
    _addActionDetailOrder: function(actionDetailOrder, actionDetailRecordId) {
        var actionDetailOrderRecord = new GlideRecord(sn_nb_action.Constants.TBL_ACTION_ORDER_DETAIL);
        actionDetailOrderRecord.initialize();
        actionDetailOrderRecord.setValue(sn_nb_action.Constants.COL_RULE, actionDetailOrder.getRule());
        actionDetailOrderRecord.setValue(sn_nb_action.Constants.COL_NEXT_BEST_ACTION, actionDetailRecordId);
        actionDetailOrderRecord.setValue(sn_nb_action.Constants.COL_INTER_ORDER, actionDetailOrder.getInterOrder());
        actionDetailOrderRecord.setValue(sn_nb_action.Constants.COL_INTRA_ORDER, actionDetailOrder.getIntraOrder());
        actionDetailOrderRecord.setValue(sn_nb_action.Constants.COL_ROLES, actionDetailOrder.getRoles());
        actionDetailOrderRecord.setValue(sn_nb_action.Constants.COL_RECOMMENDATION_HINT, actionDetailOrder.getHint());
        actionDetailOrderRecord.setValue(sn_nb_action.Constants.COL_CONTEXT_GROUPS, actionDetailOrder.getActionGroupsAsCommaSeparatedString());
        return actionDetailOrderRecord.insert();
    },
    updateActionDetailOnUpgrade: function(actionDetailRecord) {
        if (actionDetailRecord.getValue(sn_nb_action.Constants.COL_ACTIVE) == 0)
            return this.removeRuleFromActionDetail(actionDetailRecord);

        var actionDetailOrderObj = sn_nb_action.ActionDetailOrder.createFromRule(actionDetailRecord[sn_nb_action.Constants.COL_RULE] + '', actionDetailRecord[sn_nb_action.Constants.COL_RULE][sn_nb_action.Constants.COL_ORDER], 1, actionDetailRecord[sn_nb_action.Constants.COL_RULE][sn_nb_action.Constants.COL_ROLES] + '');
        var actionDetailOrderId = this._addActionDetailOrder(actionDetailOrderObj, actionDetailRecord.getUniqueValue());
        if (sn_nb_action.NextBestActionUtil.isValidString(actionDetailOrderId))
            return this.removeRuleFromActionDetail(actionDetailRecord);
        else
            this._log.debug("Failed to add Action Detail Order record for existing Action Detail Record " + actionDetailRecord.getUniqueValue() + "for upgrade scenario");

        return false;
    },
    removeRuleFromActionDetail: function(actionDetailRecord) {
        actionDetailRecord.setValue(sn_nb_action.Constants.COL_RULE, '');
        var actionDetailId = actionDetailRecord.update();
        if (sn_nb_action.NextBestActionUtil.isValidString(actionDetailId))
            return true;
        else
            this._log.debug("Failed to remove rule for existing Action Detail Record " + actionDetailRecord.getUniqueValue() + "for upgrade scenario");

        return false;
    },
    updateActionDetailOrders: function(actionDetailOrderArr) {
        var actionOrderCount = 0;
        if (actionDetailOrderArr && actionDetailOrderArr.length > 0) {
            for (var i = 0; i < actionDetailOrderArr.length; i++) {
                var actionDetailOrder = actionDetailOrderArr[i];
                if (actionDetailOrder && typeof actionDetailOrder.isValid === "function" && actionDetailOrder.isValid()) {
                    var actDetOrderSysId = this._updateActionDetailOrder(actionDetailOrder);
                    if (sn_nb_action.NextBestActionUtil.isValidString(actDetOrderSysId)) {
                        actionOrderCount++;
                        this._log.debug("Action Detail Order" + actDetOrderSysId + " updated for Action Detail " + actionDetailOrder.getActionDetail());
                    } else {
                        this._log.debug("Failed to update Action Detail Order details for " + actionDetailOrder.getActionDetailOrderId());
                    }
                }
            }
        }
        return actionOrderCount;
    },
    _updateActionDetailOrder: function(actionDetailOrder) {
        var actDetOrderSysId = actionDetailOrder.getActionDetailOrderId();
        if (gs.nil(actDetOrderSysId))
            return false;

        var actionDetailOrderRecord = new GlideRecord(sn_nb_action.Constants.TBL_ACTION_ORDER_DETAIL);
        if (!actionDetailOrderRecord.get(actDetOrderSysId))
            return false;

        actionDetailOrderRecord.setValue(sn_nb_action.Constants.COL_RULE, actionDetailOrder.getRule());
        if (actionDetailOrder.isActive() === true)
            actionDetailOrderRecord.setValue(sn_nb_action.Constants.COL_ACTIVE, true);
        else if (actionDetailOrder.isActive() === false)
            actionDetailOrderRecord.setValue(sn_nb_action.Constants.COL_ACTIVE, false);

        if (!gs.nil(actionDetailOrder.getInterOrder()))
            actionDetailOrderRecord.setValue(sn_nb_action.Constants.COL_INTER_ORDER, actionDetailOrder.getInterOrder());

        actionDetailOrderRecord.setValue(sn_nb_action.Constants.COL_INTRA_ORDER, actionDetailOrder.getIntraOrder());
        actionDetailOrderRecord.setValue(sn_nb_action.Constants.COL_ROLES, actionDetailOrder.getRoles());
        actionDetailOrderRecord.setValue(sn_nb_action.Constants.COL_CONTEXT_GROUPS, actionDetailOrder.getActionGroupsAsCommaSeparatedString());
        return actionDetailOrderRecord.update();
    },
    /*
     * Returns GlideRecord of all the recommended actions for the given context
     */
    getActionDetail: function(contextRecord, actionSysId) {
        if (sn_nb_action.NextBestActionUtil.isValidRecord(contextRecord) && sn_nb_action.NextBestActionUtil.isValidString(actionSysId)) {
            var actionDetail = new GlideRecord(sn_nb_action.Constants.TBL_ACTION_DETAIL);
            actionDetail.addActiveQuery();
            actionDetail.addQuery(sn_nb_action.Constants.COL_CONTEXT, contextRecord.getUniqueValue());
            actionDetail.addQuery(sn_nb_action.Constants.COL_RECOMMENDED, actionSysId);
            actionDetail.query();
            if (actionDetail.next())
                return actionDetail;

        }
        return false;
    },

    checkActionDetailFromExecution: function(currentRecord, actionSysId, attributes) {
        var actionDetail = new GlideRecord(sn_nb_action.Constants.TBL_ACTION_DETAIL);
        actionDetail.addActiveQuery();
        actionDetail.addQuery(sn_nb_action.Constants.COL_CONTEXT_DOCUMENT_ID, currentRecord.getUniqueValue());
        actionDetail.addQuery(sn_nb_action.Constants.COL_RECOMMENDED, actionSysId);
        actionDetail.addQuery(sn_nb_action.Constants.COL_ATTRIBUTE, JSON.stringify(attributes));
        actionDetail.query();
        if (actionDetail.hasNext())
            return true;
        return false;
    },

    getAttributesFromActionRecord: function(currentRecord, actionRecord) {
        var actionDetail = new GlideRecord(sn_nb_action.Constants.TBL_ACTION_DETAIL);
        actionDetail.addActiveQuery();
        actionDetail.addQuery(sn_nb_action.Constants.COL_CONTEXT_DOCUMENT_ID, currentRecord.getUniqueValue());
        actionDetail.addQuery(sn_nb_action.Constants.COL_RECOMMENDED, actionRecord.getUniqueValue());
        actionDetail.addNotNullQuery(sn_nb_action.Constants.COL_ATTRIBUTE);
        actionDetail.query();
        if (actionDetail.next())
            return actionDetail.getValue(sn_nb_action.Constants.COL_ATTRIBUTE);
        return false;
    },

    getActionDetailBySysId: function(actionDetailSysId) {
        if (sn_nb_action.NextBestActionUtil.isValidString(actionDetailSysId)) {
            var actionDetail = new GlideRecord(sn_nb_action.Constants.TBL_ACTION_DETAIL);
            if (actionDetail.get(actionDetailSysId))
                return actionDetail;

        }
        return false;
    },
    /*
     * Returns GlideRecord of all the recommended actions for the given context
     */
    getAllActionDetails: function(contextRecord, states, recommendationType) {
        if (sn_nb_action.NextBestActionUtil.isValidRecord(contextRecord)) {
            var actionDetails = new GlideRecord(sn_nb_action.Constants.TBL_ACTION_DETAIL);
            if (states)
                actionDetails.addQuery(sn_nb_action.Constants.COL_STATE, states);

            if (recommendationType) {
                if (recommendationType == sn_nb_action.Constants.VAL_FIELD_RECOMMENDATIONS)
                    actionDetails.addQuery(sn_nb_action.Constants.COL_ACTION_TYPE, sn_nb_action.Constants.VAL_ACTION_TYPE_FIELD_RECOMMENDATION);
                else
                    actionDetails.addQuery(sn_nb_action.Constants.COL_ACTION_TYPE, '!=', sn_nb_action.Constants.VAL_ACTION_TYPE_FIELD_RECOMMENDATION);

            }
            actionDetails.addQuery(sn_nb_action.Constants.COL_CONTEXT, contextRecord.getUniqueValue());
            actionDetails.orderByDesc(sn_nb_action.Constants.COL_SYS_CREATED_ON);
            actionDetails.query();
            if (actionDetails.hasNext())
                return actionDetails;

        }
    },
    // Returns Gliderecord of all Action Detail Order records for a given context
    getActionDetailOrdersFromContext: function(contextRecord, onlyActive, limit) {
        if (sn_nb_action.NextBestActionUtil.isValidRecord(contextRecord)) {
            var actionDetailOrders = new GlideRecord(sn_nb_action.Constants.TBL_ACTION_ORDER_DETAIL);
            if (onlyActive)
                actionDetailOrders.addQuery(sn_nb_action.Constants.COL_ACTIVE, true);

            actionDetailOrders.addQuery(sn_nb_action.Constants.COL_NEXT_BEST_ACTION + "." + sn_nb_action.Constants.COL_CONTEXT, contextRecord.getUniqueValue());
            if (limit)
                actionDetailOrders.setLimit(limit);

            actionDetailOrders.query();
            if (actionDetailOrders.hasNext())
                return actionDetailOrders;

        }
        return false;
    },
    // Returns Gliderecord of all Action Detail Order records for a given recommended action.
    getActionDetailOrders: function(actionDetailRecord, onlyActive) {
        if (sn_nb_action.NextBestActionUtil.isValidRecord(actionDetailRecord)) {
            var actionDetailOrders = new GlideRecord(sn_nb_action.Constants.TBL_ACTION_ORDER_DETAIL);
            if (onlyActive)
                actionDetailOrders.addActiveQuery();

            actionDetailOrders.addQuery(sn_nb_action.Constants.COL_NEXT_BEST_ACTION, actionDetailRecord.getUniqueValue());
            actionDetailOrders.orderBy(sn_nb_action.Constants.COL_INTRA_ORDER);
            actionDetailOrders.query();
            if (actionDetailOrders.hasNext())
                return actionDetailOrders;

        }
        return false;
    },
    setActionState: function(actionDetailRecord, state) {
        if (sn_nb_action.NextBestActionUtil.isValidRecord(actionDetailRecord) && sn_nb_action.NextBestActionUtil.isValidActionState(state.toLowerCase())) {
            actionDetailRecord.setValue(sn_nb_action.Constants.COL_STATE, state.toLowerCase());
            if (sn_nb_action.NextBestActionUtil.isValidString(actionDetailRecord.update()))
                return true;
            else
                this._log.error("Could not set action state" + [actionDetailRecord.getUniqueValue(), state]);

        }
        return false;
    },
    setActionAttribute: function(actionDetailRecord, attribute) {
        if (actionDetailRecord && actionDetailRecord.isValidRecord() && attribute && attribute != null) {
            actionDetailRecord.setValue(sn_nb_action.Constants.COL_ATTRIBUTE, JSON.stringify(attribute));
            if (sn_nb_action.NextBestActionUtil.isValidString(actionDetailRecord.update()))
                return true;
            else
                this._log.error("Could not update action attribute " + [actionDetailRecord, attribute]);

        }
        return false;
    },
    /**
     * Fetches Rule Context record using ruleContextId. If ruleContextId is not present, 
     * depends on table details and active query to fetch recently created context record.
     */
    getRuleContext: function(contextTable, ruleContextId) {
        var ruleContextGr = new GlideRecord(sn_nb_action.Constants.TBL_RULE_CONTEXT);
        if (!gs.nil(ruleContextId)) {
            if (ruleContextGr.get(ruleContextId)) {
                if (ruleContextGr.getValue(sn_nb_action.Constants.COL_ACTIVE) == 1)
                    return ruleContextGr;
                else {
                    this._log.error("Context(sn_nb_action_rule_context) record with sys_id=" + ruleContextId + " is inactive");
                    return false;
                }
            } else {
                this._log.error("Could not find a Context(sn_nb_action_rule_context) record with sys_id=" + ruleContextId);
                return false;
            }
        }
        ruleContextGr.addActiveQuery();
        ruleContextGr.addQuery(sn_nb_action.Constants.COL_CONTEXT, contextTable);
        ruleContextGr.orderByDesc(sn_nb_action.Constants.COL_SYS_CREATED_ON);
        ruleContextGr.query();
        if (ruleContextGr.next()) {
            return ruleContextGr;
        }
        this._log.error("Could not find an active Context(sn_nb_action_rule_context) record for context table=" + contextTable);
        return false;
    },
    getRulesFromContext: function(ruleContext) {
        var rules = new GlideRecord(sn_nb_action.Constants.TBL_RULE_BASE);
        rules.addActiveQuery();
        rules.addQuery(sn_nb_action.Constants.COL_RULE_CONTEXT, ruleContext.getValue(sn_nb_action.Constants.COL_SYS_ID));
        rules.query();
        return rules;
    },

    /**
     * To fetch states and attributes of all RAexecution records based on parentRA of current RAexecution
     */

    getStatesAttributesListFromActionDetails: function(hash, actionDetailRecord) {
        var detailList = [];
        var actionDetail = new GlideRecord(sn_nb_action.Constants.TBL_ACTION_DETAIL);
        actionDetail.addQuery(sn_nb_action.Constants.COL_PARENT_RA_ID, hash);
        actionDetail.addQuery(sn_nb_action.Constants.COL_SYS_ID, "!=", actionDetailRecord.getUniqueValue());
        actionDetail.addQuery(sn_nb_action.Constants.COL_RECOMMENDED, actionDetailRecord.recommended);
        actionDetail.addQuery(sn_nb_action.Constants.COL_CONTEXT_DOCUMENT_ID, actionDetailRecord.context.document);
        actionDetail.query();
        while (actionDetail.next()) {
            var detailObj = {
                state: actionDetail.getValue(sn_nb_action.Constants.COL_STATE),
                attributes: actionDetail.getValue(sn_nb_action.Constants.COL_ATTRIBUTE)
            };
            detailList.push(detailObj);
        }
        return detailList;
    },

    /**
     * For deletion of all RAexecution in new state only for current user based on RAcontext.
     */
    deleteRAByContext: function(contextRecordId, recommendationType) {
        var rowCount = 0;
        var raExecutionGr = new GlideRecord(sn_nb_action.Constants.TBL_ACTION_DETAIL);
        raExecutionGr.addQuery(sn_nb_action.Constants.COL_CONTEXT, contextRecordId);
        raExecutionGr.addQuery(sn_nb_action.Constants.COL_STATE, sn_nb_action.Constants.STATE_NEW);
        if (recommendationType) {
            if (recommendationType == sn_nb_action.Constants.VAL_FIELD_RECOMMENDATIONS)
                raExecutionGr.addQuery(sn_nb_action.Constants.COL_ACTION_TYPE, sn_nb_action.Constants.VAL_ACTION_TYPE_FIELD_RECOMMENDATION);
            else
                raExecutionGr.addQuery(sn_nb_action.Constants.COL_ACTION_TYPE, '!=', sn_nb_action.Constants.VAL_ACTION_TYPE_FIELD_RECOMMENDATION);

        }
        raExecutionGr.query();
        if (raExecutionGr.hasNext()) {
            rowCount = raExecutionGr.getRowCount();
            raExecutionGr.deleteMultiple();
        }
        return rowCount;
    },
    getSearchActionMapRecord: function(searchSourcetable, ruleContext) {
        var aisActionMapGr = new GlideRecord(Constants.TBL_SEARCH_RESULT_RA_MAPPING);
        aisActionMapGr.addQuery('search_source_table', searchSourcetable);
        aisActionMapGr.addQuery('context', ruleContext.getUniqueValue());
        aisActionMapGr.addActiveQuery();
        aisActionMapGr.query();
        if (aisActionMapGr.next())
            return aisActionMapGr;

        return false;
    },
    getGeniusActionMapRecord: function(geniusId, ruleContext) {


        var gr = new GlideRecord(Constants.TBL_SYS_SEARCH_GENIUS_RESULT_MODEL);
        gr.get(geniusId);

        gr.query();
        if (gr.next()) {

            var genius_config_id = gr.ais_genius_config.sys_id;
            var geniusActionMapGr = new GlideRecord(Constants.TBL_SEARCH_RESULT_RA_MAPPING);
            geniusActionMapGr.addQuery(Constants.COL_GENIUS_RESULT_CONFIG, genius_config_id);
            geniusActionMapGr.addQuery(Constants.COL_CONTEXT, ruleContext.getUniqueValue());
            geniusActionMapGr.addQuery(Constants.COL_MAP_GENIUS_RESULT, Constants.CHOICE_YES);
            geniusActionMapGr.addActiveQuery();
            geniusActionMapGr.query();
            if (geniusActionMapGr.next())
                return geniusActionMapGr;

            return false;
        }
        return false;
    },
    getTableRecordBySysId: function(table, sysId) {
        var tableRecordDetail = new GlideRecord(table);
        if (sn_nb_action.NextBestActionUtil.isValidString(sysId)) {
            if (tableRecordDetail.get(sysId)) {
                if (tableRecordDetail.canRead())
                    return tableRecordDetail;
                else {
                    this._log.error("Cannot access record of the table " + table);
                    return false;
                }
            }
        }
        return false;
    },
    getSecureTableRecordBySysId: function(table, sysId) {
        var tableRecordDetail = new GlideRecordSecure(table);
        if (sn_nb_action.NextBestActionUtil.isValidString(sysId)) {
            if (tableRecordDetail.get(sysId))
                return tableRecordDetail;

        }
        return false;
    },

    addSearchExecutionRecord: function(contextRecord, actionType, actionInputs, actionId, ruleContextGr) {
        var maxAgeInDateTime = sn_nb_action.NextBestActionUtil.getMaxAge(contextRecord, ruleContextGr);
        var actionDetailRecord = new GlideRecord(sn_nb_action.Constants.TBL_ACTION_DETAIL);
        actionDetailRecord.initialize();
        actionDetailRecord.setValue(sn_nb_action.Constants.COL_CONTEXT, contextRecord.getUniqueValue());
        actionDetailRecord.setValue(sn_nb_action.Constants.COL_ACTION_TYPE, actionType);
        actionDetailRecord.setValue(sn_nb_action.Constants.COL_MAX_AGE, maxAgeInDateTime);
        actionDetailRecord.setValue(sn_nb_action.Constants.COL_RECOMMENDED, actionId);
        actionDetailRecord.setValue(sn_nb_action.Constants.COL_USE_CASE, sn_nb_action.Constants.CHOICE_USE_CASE_SEARCH);
        var actionDetailRecordId = actionDetailRecord.insert();
        var contextSysId = actionDetailRecord.context.document;
        var actionSysId = actionDetailRecord.recommended;
        var recommendedActionParentId = sn_nb_action.NextBestActionUtil.getHashValue(contextSysId, actionSysId, actionInputs);
        actionDetailRecord.setValue(sn_nb_action.Constants.COL_PARENT_RA_ID, recommendedActionParentId);
        if (!NextBestActionUtil.isEmptyObject(actionInputs)) {
            sn_nb_action.NextBestActionUtil.setGlideVarInputs(actionDetailRecord, sn_nb_action.Constants.COL_ACTION_INPUTS, actionInputs);
        }
        actionDetailRecord.update();
        return actionDetailRecordId;
    },

    /**
     * To verify if any context inputs exists for the given context
     */
    hasContextInputs: function(ruleContext, excludeContextTableInput) {
        var contextInputGr = new GlideRecord(Constants.TBL_CONTEXT_INPUT);
        contextInputGr.addQuery(Constants.COL_MODEL, ruleContext.getUniqueValue());
        if (excludeContextTableInput) {
            contextInputGr.addQuery(Constants.COL_ELEMENT, '!=', Constants.CONTEXT_TABLE_INPUT);
        }
        contextInputGr.query();
        if (contextInputGr.hasNext())
            return true;
        else
            return false;

    },

    /**
     * Retrieves context records that are eligible for a recommendation refresh.
     *
     * Filters records from the Action Context table based on the provided rule context sys_ids,
     * current record sys_id, and user (if `refreshAllUsers` is false). Excludes contexts that are
     * currently in the "WAITING" evaluation status.
     *
     * @param {Array<String>} ruleContextSysIds - An array of sys_ids of the rule contexts.
     * @param {String} currentRecordSysId - The sys_id of the current record.
     * @param {Boolean} refreshAllUsers - Flag indicating whether to refresh recommendations for all users.
     *
     * @returns {GlideRecord} A GlideRecord object of matched context records.
     */
    getContextsForForceRefresh: function(ruleContextSysIds, currentRecordSysId, refreshAllUsers) {
        var context = new GlideRecord(Constants.TBL_ACTION_CONTEXT);
        context.addQuery(Constants.COL_RULE_CONTEXT, 'IN', ruleContextSysIds);
        context.addQuery(Constants.COL_DOCUMENT, currentRecordSysId);
        context.addQuery(Constants.COL_EVALUATION_STATUS, '!=', Constants.EVALUATION_STATUS_CHOICES.WAITING);
        if (!refreshAllUsers) {
            context.addQuery(Constants.COL_USER, gs.getUserID());
        }
        context.query();
        return context;
    },

    type: 'NextBestActionDAOImpl'
};
