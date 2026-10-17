var ChangeRemedialActionUtilSNC = Class.create();
ChangeRemedialActionUtilSNC.prototype = {
    initialize: function() {},

    FIELDS: {
        STATE: "state",
        ACTION_RECORD_ID: "action_record_id",
        PARENT_RECORD_ID: "parent_record_id",
        ACTION_EXECUTION_ID: "action_execution_id",
        PARENT: "parent",
        PLUGIN_NAME: "com.snc.change_management.change_model",
        STD_CHANGE_PRODUCER_VERSION: "std_change_producer_version",
        STD_CHANGE_PRODUCER: "std_change_producer",
        ACTION_RECORD_TABLE: "action_record_table",
        NAME: "name",
        GLIDE_DATE_TIME: "glide_date_time"
    },

    STANDARD_CHG_MODEL_SYS_ID: "e55d0bfec343101035ae3f52c1d3ae49",

    TABLES: {
        CHANGE_REQUEST: "change_request",
        SN_REACF_REMEDIAL_ACTION_EXECUTION: "sn_reacf_remedial_action_execution",
        CHG_MODEL: "chg_model",
        SN_CIMAF_ACTION: "sn_cimaf_action",
    },

    CHANGE_REQUEST: {
        CHANGE_NAMED_STATES: {
            "New": "-5",
            "Scheduled": "-2",
            "Implement": "-1",
            "Review": "0"
        },
        CHANGE_INITIAL_STATE_FOR_PLAYBOOK: "-5", //New
        REQUIRED_STATES_FOR_PLAYBOOK: ["-5", "-2", "-1", "0"], //New, Scheduled, Implement, Review
        REQUIRED_STATE_TRANSITION_FOR_PLAYBOOK: {
            "-5": "-2",
            "-2": "-1",
            "-1": "0"
        },
        CHANGE_FINAL_STATE_FOR_PLAYBOOK: "0", //Review
        CHANGE_CLOSE_CODES: {
            "failed": "unsuccessful", //if remedial action fails
            "completed": "successful" //if remedial action completes
        },
    },


    /**
     "key": sys id of standard change tmeplate,
     "value": sys id of sn_cimaf_action to be executed for changes created using this template
     To do - update this map with actual key value once ready, below is a dummy entry
    **/
    CHANGE_TEMPLATE_CONFIG: {
        "9bb3258e43216510c0d35dd2f7b8f258": "7193898953f25110ae50ddeeff7b12eb", //Restart service
        "5665e5ce43216510c0d35dd2f7b8f2a8": "6303db0d53b99910ae50ddeeff7b121e" //End process
    },

    createChange: function(remedialActionParams, remedialActionExecutionId) {
        var result = {};
        var remedialActionEngine = new sn_reacf.RemedialActionEngine();
        var remedialActionHelper = new sn_reacf.RemedialActionHelper();
        var params = {};

        if (gs.nil(remedialActionExecutionId) || gs.nil(remedialActionParams)) {
            gs.error("[RemediateForServerUtil] missing remedial action params or remedial action execution id");
            return;
        }

        for (var param in remedialActionParams) {
            params[param] = remedialActionParams[param].value;
        }
        var remedialActionExecutionGr = this._getGlideRecord(this.TABLES.SN_REACF_REMEDIAL_ACTION_EXECUTION, remedialActionExecutionId);
        if (gs.nil(params[this.FIELDS.PARENT]))
            params[this.FIELDS.PARENT] = remedialActionExecutionGr.getValue(this.FIELDS.PARENT_RECORD_ID);
        var existingParams = remedialActionHelper.getActionParams(remedialActionExecutionGr);
        if (!gs.nil(existingParams)) {
            for (var key in existingParams) {
                if ((!params[key] || params[key] == "") && (existingParams[key] && existingParams[key] != "")) {
                    params[key] = existingParams[key];
                }
            }
        }
        var executionRequest = remedialActionHelper.updateRemedialActionExecutionRequestById(remedialActionExecutionId, "", "", "", params);
        if (!gs.nil(executionRequest)) {
            executionRequest = remedialActionEngine.executeRemedialAction(remedialActionExecutionId);
        }
        return executionRequest;
    },

    /**
     Evaluate if current user is authroized to perform CI Action associated with the change request before update
    **/
    updateChangeWithAuthorization: function(changeRequestId, keyValuePairs) {
        var changeRequestGr = this._getGlideRecord(this.TABLES.CHANGE_REQUEST, changeRequestId);
        var templateId = this._getTemplateFromChange(changeRequestGr);
        var ciActionSysId = this.CHANGE_TEMPLATE_CONFIG[templateId];
        var ciActionGr = this._getGlideRecord(this.TABLES.SN_CIMAF_ACTION, ciActionSysId);
        var isAuthorized = new sn_cimaf.CIActionEngine().isAuthorized(ciActionGr);
        if (!isAuthorized) {
            return {
                "status": "Error",
                "message": gs.getMessage("You are not authorized to execute the associated CI action - {0}", ciActionGr.getValue(this.FIELDS.NAME))
            };
        }
        return this.updateChange(changeRequestId, keyValuePairs);
    },

    updateChange: function(changeRequestId, keyValuePairs) {
        var output = {
            "status": "Error",
        };
        if (!changeRequestId || gs.nil(keyValuePairs)) {
            gs.error("[ChangeRemedialActionUtilSNC][updateChangeState]: missing required parameters");
            output.message = gs.getMessage("Mandatory inputs missing");
            return output;
        }
        var changeRequestGr = this._getGlideRecord(this.TABLES.CHANGE_REQUEST, changeRequestId);
        var changeProcess = new global.ChangeProcess(changeRequestGr);
        var originalKeyValuePairs = JSON.parse(JSON.stringify(keyValuePairs));
        for (var key in keyValuePairs) {
            if (changeRequestGr.isValidField(key)) {
                var element = changeRequestGr.getElement(key);
                var descriptor = element.getED();
                var fieldType = descriptor.getInternalType();
                if (fieldType == this.FIELDS.GLIDE_DATE_TIME) {
                    var gdt = new GlideDateTime();
                    gdt.setDisplayValue(keyValuePairs[key]);
                    keyValuePairs[key] = gdt.getValue();
                }
            }
        }
        var state;
        if (keyValuePairs.state) {
            state = keyValuePairs.state;
            delete keyValuePairs.state;
        }
        if (state && this.CHANGE_REQUEST.CHANGE_NAMED_STATES[state]) {
            state = this.CHANGE_REQUEST.CHANGE_NAMED_STATES[state];
        }
        changeProcess.setValues(keyValuePairs);
        if (state && !changeProcess.canMoveTo(state)) {
            gs.error("[ChangeRemedialActionUtilSNC][updateChangeState]: cannot update state to {0}", state);
            output.message = gs.getMessage("Cannot update state to {0}", state);
            return output;
        }

        if ((!state && changeProcess.update()) || (state && changeProcess.moveTo(state) && changeProcess.update())) {
            output.status = "Success";
            output.keyValuePairs = originalKeyValuePairs;
            return output;
        }
        output.message = gs.getMessage("Unable to update change request.");
        return output;
    },

    implementChange: function(remedialActionExecution) {
        if (!remedialActionExecution) {
            gs.error("[ChangeRemedialActionUtilSNC][implementChange]: mandatory parameter remedial action execution is missing");
            return;
        } else if (typeof remedialActionExecution == "string") {
            remedialActionExecution = this._getGlideRecord(this.TABLES.SN_REACF_REMEDIAL_ACTION_EXECUTION, remedialActionExecution);
        }
        if (!remedialActionExecution.isValidRecord()) {
            gs.error("[ChangeRemedialActionUtilSNC][implementChange]: remedial action execution parameter is invalid");
            return;
        }
        var changeRequest = this._getGlideRecord(remedialActionExecution.getValue(this.FIELDS.ACTION_RECORD_TABLE), remedialActionExecution.getValue(this.FIELDS.ACTION_RECORD_ID));
        if (!changeRequest.isValidRecord()) {
            gs.error("[ChangeRemedialActionUtilSNC][implementChange]: change request associated to remedial action execution is invalid");
            return;
        }
        this._updateChangeState(changeRequest, this.CHANGE_REQUEST.CHANGE_NAMED_STATES.Implement);
        var templateId = this._getTemplateFromChange(changeRequest);
        var ciActionSysId = this.CHANGE_TEMPLATE_CONFIG[templateId];
        var remedialActionHelper = new sn_reacf.RemedialActionHelper();
        var actionParams = remedialActionHelper.getActionParams(remedialActionExecution);
        try {
            var inputs = {};
            inputs['change_request_sys_id'] = changeRequest.getUniqueValue(); // Sys ID (GUID) 
            inputs['ci_action_sys_id'] = ciActionSysId; // Sys ID (GUID) 
            inputs['action_parameters'] = actionParams; // JSON 
            inputs['change_close_code'] = this.CHANGE_REQUEST.CHANGE_CLOSE_CODES; // JSON 
            inputs['change_final_state'] = this.CHANGE_REQUEST.CHANGE_FINAL_STATE_FOR_PLAYBOOK; // String 

            sn_fd.FlowAPI.getRunner().subflow('sn_sow_inc.execute_ci_action_for_a_standard_change').inBackground().withInputs(inputs).run();

        } catch (ex) {
            var message = ex.message;
            gs.error(message);
        }
    },

    isChangeModelFavorable: function() {
        return this._isStandardChangeModelAvailable() && this._isRequiredStatesAvailable() && this._isRequiredStateTransitionPossible();
    },

    _getTemplateFromChange: function(changeRequestGr) {
        var templateVersionRecord = changeRequestGr[this.FIELDS.STD_CHANGE_PRODUCER_VERSION] ? changeRequestGr[this.FIELDS.STD_CHANGE_PRODUCER_VERSION].getRefRecord() : null;
        if (templateVersionRecord && templateVersionRecord.isValidRecord())
            return templateVersionRecord.getValue(this.FIELDS.STD_CHANGE_PRODUCER);
        return;
    },

    _updateChangeState: function(changeRequestGr, state) {
        var changeProcess = new global.ChangeProcess(changeRequestGr);
        if (changeProcess.canMoveTo(state)) {
            changeProcess.moveTo(state);
            return changeProcess.update();
        }
    },

    _getGlideRecord: function(tableName, sysId) {
        gr = new GlideRecord(tableName);
        gr.get(sysId);
        return gr;
    },

    _isStandardChangeModelAvailable: function() {
        if (new GlidePluginManager().isActive(this.FIELDS.PLUGIN_NAME)) {
            var chgModelGr = new GlideRecord(this.TABLES.CHG_MODEL);
            if (chgModelGr.get(this.STANDARD_CHG_MODEL_SYS_ID)) {
                return true;
            }
        }
        return false;
    },

    _isRequiredStatesAvailable: function() {
        var chgModelGr = new GlideRecord(this.TABLES.CHG_MODEL);
        if (chgModelGr.get(this.STANDARD_CHG_MODEL_SYS_ID)) {
            var changeModel = new global.ChangeModel(chgModelGr);
            var statesGr = changeModel.getStates();
            var states = new global.STTRMStateChoiceUtil(chgModelGr).getChoicesInfo(statesGr);
            var requiredStates = this.CHANGE_REQUEST.REQUIRED_STATES_FOR_PLAYBOOK;
            var availableStates = [];
            states.forEach(function(state) {
                availableStates.push(state.value);
            });
            for (var i = 0; i < requiredStates.length; i++) {
                if (availableStates.indexOf(requiredStates[i]) == -1)
                    return false;
            }
            var initialStateGr = changeModel.getInitialState();
            var initialState = new global.STTRMStateChoiceUtil(chgModelGr).getChoiceInfo(initialStateGr);
            return initialState && initialState.value == this.CHANGE_REQUEST.CHANGE_INITIAL_STATE_FOR_PLAYBOOK;
        }
        return false;
    },

    _isRequiredStateTransitionPossible: function() {
        var chgModelGr = new GlideRecord(this.TABLES.CHG_MODEL);
        if (chgModelGr.get(this.STANDARD_CHG_MODEL_SYS_ID)) {
            var changeModel = new global.ChangeModel(chgModelGr);
            var requiredTransitions = this.CHANGE_REQUEST.REQUIRED_STATE_TRANSITION_FOR_PLAYBOOK;
            for (var initialState in requiredTransitions) {
                var transitionStateGr = changeModel.getTransitionStates(initialState);
                var nextStates = new global.STTRMStateChoiceUtil(chgModelGr).getChoicesInfo(transitionStateGr);
                var nextStatesFlat = [];
                nextStates.forEach(function(state) {
                    nextStatesFlat.push(state.value);
                });
                if (nextStatesFlat.indexOf(requiredTransitions[initialState]) == -1)
                    return false;
            }
            return true;
        }
        return false;
    },

    type: 'ChangeRemedialActionUtilSNC'
};
