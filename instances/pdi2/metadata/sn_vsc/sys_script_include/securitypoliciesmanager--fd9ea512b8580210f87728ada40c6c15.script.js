var SecurityPoliciesManager = Class.create();
SecurityPoliciesManager.prototype = {
    startTime: new GlideDateTime(),
    constants: new sn_vsc.SecurityCenterConstants(),
    spUtil: new SCSecurityPolicyUtil(),
    history: null,
    initialize: function() {},

    evaluatePolicies: function(trigger) {
        sc_sp_event_trigger = trigger;
        var gr = new GlideRecord(this.constants.SECURITY_POLICY);
        gr.addQuery('status', 'active');
        gr.addQuery('trigger.table', trigger.sys_class_name);
        gr.query();
        while (gr.next()) {
            this.evaluatePolicyFromTriggerRecord(gr.sys_id, trigger);
        }
    },

    evaluatePolicyFromTriggerRecord: function(policyID, trigger) {
        try {
            // Start the time
            startTime = new GlideDateTime();

            // Check for active
            var policy = new GlideRecord(this.constants.SECURITY_POLICY);
            policy.get(policyID);
            if (!this.policyIsActive(policy)) {
                return false;
            }

            // create history record
            this.history = new GlideRecord(this.constants.SECURITY_POLICY_HISTORY);
            this.history.initialize();
            this.history.setValue('policy', policyID);
            this.history.setValue('event_table', trigger.getTableName());
            this.history.setValue('event_id', trigger.sys_id);
            this.history.setValue('status', 'in_progress');
            this.history.setValue('start_time', this.startTime);
            this.history.setValue('previous_policy_updated_on', policy.sys_updated_on);
            this.history.setValue('previous_policy_updated_by', policy.sys_updated_by);
            this.history.insert();

            // conditions
            if (!this._runConditions(policy, trigger)) {
                this.history.setValue('conditions_met', false);
                this._setExecutionTime();
                this.history.setValue('status', 'complete');
                this.history.update();
                return false;
            }
            this.history.setValue('conditions_met', true);

            // actions
            var action_return = this._runActions(policy, trigger);
            this._setExecutionTime();
            this.history.setValue('status', 'complete');
            this.history.update();
            return action_return;
        } catch (e) {
            this._setExecutionTime();
            this.history.setValue('error_message', 'Execution Error:\n' + e.message);
            this.history.setValue('status', 'error');
            this.history.update();
            gs.error(e);
        }
    },

    /**
     * Returns true if the given policy record is a valid record and is active
     * @policy : A sn_vsc_security_policy record
     */
    policyIsActive: function(policy) {
        return (policy.isValidRecord() && policy.status == 'active');
    },

    /**
     * Sets the execution_time and finish_time of the history record based off of the current time.
     * This does not update the history record on the database
     */
    _setExecutionTime: function() {
        var endTime = new GlideDateTime();
        var execution_time = endTime.getNumericValue() - this.startTime.getNumericValue();
        this.history.setValue('execution_time', execution_time);
        this.history.setValue('finish_time', endTime);
    },

    /**
     * Appends the conditions details field if the action is of type 'sn_vsc_security_policy_condition'
     * Appends the actions details field if the action is of type 'sn_vsc_security_policy_action'
     */
    _appendDetails: function(message, action) {
        if (action.getTableName() == this.constants.SECURITY_POLICY_CONDITION) {
            this._appendConditionDetails(message);
        } else if (action.getTableName() == this.constants.SECURITY_POLICY_ACTION) {
            this._appendActionDetails(message);
        }
    },

    /**
     * Appends the condition details only if the action is of type 'sn_vsc_security_policy_condition'
     */
    _appendIfConditionDetails: function(message, action) {
        if (action.getTableName() == this.constants.SECURITY_POLICY_CONDITION) {
            this._appendConditionDetails(message);
        }
    },

    /**
     * Appends the action details only if the action is of type 'sn_vsc_security_policy_action'
     */
    _appendIfActionDetails: function(message, action) {
        if (action.getTableName() == this.constants.SECURITY_POLICY_ACTION) {
            this._appendActionDetails(message);
        }
    },

    /**
     * Appends the condition details of the history record with the given message
     */
    _appendConditionDetails: function(message) {
        var details = this.history.getValue('condition_details') || '';
        if (details) {
            details += '\n';
        }
        details += message;
        this.history.setValue('condition_details', details);
    },

    /**
     * Appends the action details of the history record with the given message
     */
    _appendActionDetails: function(message) {
        var details = this.history.getValue('action_details') || '';
        if (details) {
            details += '\n';
        }
        details += message;
        this.history.setValue('action_details', details);
    },

    /**
     * Runs all of the conditions for a given security policy and trigger
     * @policy ; The sn_vsc_security_policy record we are running the conditions of
     * @trigger : The record that the policy is triggering off of
     */
    _runConditions: function(policy, trigger) {
        var criteria = policy.getValue(this.constants.EVENTS_CRITERIA_TYPE);
        this._appendConditionDetails("Condition Criteria: " + criteria + '\n');
        var conditions = new GlideRecord(this.constants.SECURITY_POLICY_CONDITION);
        conditions.addQuery('policy', policy.sys_id);
        conditions.orderBy('order');
        conditions.query();
        if (conditions.getRowCount() <= 0) {
            this._appendConditionDetails("No Conditions");
            return true;
        }
        while (conditions.next()) {
            var conditionResult = this._runAction(conditions, trigger);
            if (criteria === 'any' && conditionResult == true)
                return true;
            if (criteria === 'all' && conditionResult == false)
                return false;
        }
        if (criteria === 'any')
            return false;
        else if (criteria === 'all')
            return true;

        // we should never get here, but just in case
        return false;
    },

    /**
     * Runs all of the actions for a given security policy and trigger
     * @policy ; The sn_vsc_security_policy record we are running the conditions of
     * @trigger : The record that the policy is triggering off of
     */
    _runActions: function(policy, trigger) {
        var actions = new GlideRecord(this.constants.SECURITY_POLICY_ACTION);
        actions.addQuery('policy', policy.getUniqueValue());
        actions.query();
        while (actions.next()) {
            this._runAction(actions, trigger);
        }
        return true;
    },

    /**
     * Runs the given action with the given trigger
     * @action : A record of either sn_vsc_security_policy_condition or sn_vsc_security_policy_action
     * @trigger : The record to use as the trigger
     */
    _runAction: function(action, trigger) {
        if (!action.isValidRecord())
            return false;

        var name = action.getDisplayValue('action_type');
        var inputInfo = this._getInputInfo(action);
        var inputs = this._inputInfoToActionInput(inputInfo);
        this._appendDetails(action.getTableName() + '.' + action.sys_id + " '" + name + "' inputs:\n" + JSON.stringify(inputInfo, null, 2), action);
        if (this._inputInfoIsEmpty(inputInfo)) {
            this._appendIfConditionDetails("No inputs set, returning true\n", action);
            return true;
        }
        var actionID = action.action_type.internal_name;
        var scope = action.action_type.sys_scope.scope;
        var triggerID = trigger.sys_id;
        var triggerRecord = trigger;
        var outputs = sn_fd.FlowAPI.executeActionQuick((scope + '.' + actionID), inputs);

        var return_value = outputs['return_value'];
        this._appendDetails("Outputs: " + JSON.stringify(outputs), action);
        this._appendIfConditionDetails("return_value: " + return_value + '\n', action);
        if (outputs && outputs.notification) {
            outputs.notification.setValue('execution', this.history.sys_id);
            outputs.notification.update();
        }
        if (action.getTableName() == this.constants.SECURITY_POLICY_CONDITION && typeof return_value !== 'boolean') {
            var message = "Security Policy Hub Action " + action.sys_id + " returned a non-boolean return_value";
            gs.warn(message);
            this._appendIfConditionDetails(message, action);
            return false;
        } else if (outputs.__action_status__.code === 0 || outputs.__dont_treat_as_error__ === true) {
            return return_value;
        } else {
            var message = "Security Policy Hub Action " + action.sys_id + " returned a non-zero status code";
            gs.warn(message);
            this._appendDetails(message, action);
        }

        return false;
    },

    /**
     * Returns true if the given input info object has no values (val) assigned to each of the input names
     * @info : A generic javascript object of form {"someInputName":{val:"",type:"",ref:""},...}
     */
    _inputInfoIsEmpty: function(info) {
        for (key in info) {
            if (info[key].val) {
                return false;
            }
        }
        return true;
    },

    /**
     * Retrieves information about all of the inputs for a given action
     * Returns a java object of form {"someInputName":{val:"someValue",type:"someType",ref:"someReference"},...} where
     * "someInputName" - The name of the input variable
     * "someValue" - The String value of input variable
     * "someType" - The type of the input, such as "string", "reference", "glide_list", etc
     * "someReference" - The name of the table being referenced, such as "sys_user"
     * @action : A record of either sn_vsc_security_policy_condition or sn_vsc_security_policy_action
     */
    _getInputInfo: function(action) {
        var hubActionID = action.getValue('action_type');
        var inputs = {};
        var fields = new GlideRecord('sys_hub_action_input');
        fields.addQuery('name', 'var__m_sys_hub_action_input_' + hubActionID);
        fields.query();
        while (fields.next()) {
            var element = fields.getValue('element');
            inputs[element] = this._getInputInfoValue(fields, action);
        }
        return inputs;
    },

    /**
     * Gets the value of the sys_hub_action_input for the given security policy action/condition.
     * @hubActionInput : A sys_hub_action_input record. This stores information about an input field such as "users"
     * @record : A record of either sn_vsc_security_policy_condition or sn_vsc_security_policy_action
     */
    _getInputInfoValue: function(hubActionInput, record) {
        var key = hubActionInput.getValue('element');
        var ref = hubActionInput.getValue('reference');
        var type = hubActionInput.getValue('internal_type');
        var variables = new GlideRecord("sys_variable_value");
        variables.addQuery("document_key", record.getValue('sys_id'));
        variables.addQuery('variable.element', key);
        variables.orderByDesc('sys_updated_on');
        variables.query();
        var info = {};
        if (variables.next()) {
            info.val = variables.getValue('value');
            info.type = type;
            info.ref = ref;
        }
        return info;
    },

    /**
     * Converts the information of inputs into actual values and references that are needed to call the sys_hub_action
     * @infoInput : A java object obtained from the _getInputInfo() method
     */
    _inputInfoToActionInput: function(infoInput) {
        var input = {};
        for (key in infoInput) {
            var val = infoInput[key].val;
            var type = infoInput[key].type;
            var ref = infoInput[key].ref;
            if (!val) {
                input[key] = this._getDefaultValue(ref);
                continue;
            }
            if (type === 'glide_list' && ref) {
                var ids = val.split(',');
                var gr = new GlideRecord(ref);
                var q;
                for (var i = 0; i < ids.length; i++) {
                    if (i == 0) {
                        q = gr.addQuery('sys_id', ids[i]);
                    }
                    q.addOrCondition('sys_id', ids[i]);
                }
                gr.query();
                gr.next();
                input[key] = gr;
                continue;
            } else if (ref) {
                input[key] = this._getReference(ref, val);
                continue;
            }
            input[key] = val;
        }
        return input;
    },

    /**
     * Returns a GlideRecord of the given table and id.
     * If the record does not exist, this returns an unitialized new GlideRecord object of the given table.
     * @table : The table name of the record being requested
     * @id : The sys_id of the record being requested
     */
    _getReference: function(table, id) {
        var gr = new GlideRecord(table);
        if (gr.get(id)) {
            return gr;
        }
        return new GlideRecord(table);
    },

    /**
     * Returns the default value that is required for a sys_hub_action to run
     * Call this when an input exists for a sys_hub_action, but no value is defined
     * @ref : (optional) The reference field value from the sys_hub_action_input record, or from the _getInputInfo() method
     */
    _getDefaultValue: function(ref) {
        var defaultVal = '';
        if (ref) {
            defaultVal = new GlideRecord(ref);
        }
        return defaultVal;
    },

    updatePolicyConfigureValue: function(policyId) {
        var isConditionPresent = false;
        var atLeastOneIsFilled = false;
        var users = "";
        var groups = "";
        var actionType = "";
        var actionArray = [];
        var grConditions = new GlideRecord(this.constants.SECURITY_POLICY_CONDITION);
        grConditions.addQuery('policy', policyId);
        grConditions.query();
        if (grConditions.getRowCount() > 0) {
            isConditionPresent = true;
        }

        var grActions = new GlideRecord(this.constants.SECURITY_POLICY_ACTION);
        grActions.addQuery('policy', policyId);
        grActions.query();

        while (grActions.next()) {
            var isConfigured = true;
            for (var key in grActions.action_attributes) {
                if (key == 'sys_meta' || key == 'sys_id') {
                    continue;
                }
                var value = grActions.action_attributes[key];
                var isMandatory = grActions.action_attributes[key].getED().isMandatory();
                if (value) {
                    atLeastOneIsFilled = true;
                }
                if (isMandatory && !value) {
                    isConfigured = false;
                    break;
                }
            }
            isConfigured = isConfigured && atLeastOneIsFilled;
            if (isConfigured && grActions.action_attributes.users != undefined && grActions.action_attributes.groups != undefined) {
                isConfigured = grActions.action_attributes.users != '' || grActions.action_attributes.groups != '';
            }
            if (isConfigured) {
                actionArray.push('NotEmpty');
            } else {
                actionArray.push("Empty");
            }
        }

        var grPolicy = new GlideRecord(this.constants.SECURITY_POLICY);
        grPolicy.addQuery('sys_id', policyId);
        grPolicy.query();
        if (grPolicy.next()) {
            if (isConditionPresent == true && atLeastOneIsFilled == true && !actionArray.includes("Empty")) {
                grPolicy.configured = "configured";
            } else {
                grPolicy.configured = "not_configured";
                grPolicy.status = "inactive";
            }

            grPolicy.update();
        }

    },

    type: 'SecurityPoliciesManager'
};
