var ActionUtilSNC = Class.create();
ActionUtilSNC.prototype = {
    initialize: function(context) {
        this.context = context;
        this.isValidContext = !gs.nil(context);
        this.returnParametersWithTypes = false;
        this.dynamicParameterMap = {};
    },

    type: 'ActionUtilSNC',

    toggleParameterTypes: function() {
        this.returnParametersWithTypes = !this.returnParametersWithTypes;
    },

    fetchActionsForGroup: function(groupId) {
        var resolvedActions = [];
        var actions = new GlideRecord('sn_ex_sp_m2m_action_group');
        actions.addQuery('group.active', true);
        actions.addQuery('action.active', true);
        actions.addQuery('group', groupId);
        actions.orderByDesc('primary');
        actions.orderBy('order');
        actions.query();
        while (actions.next()) {
            if (this.resolveActionVisibility(actions)) {
                resolvedActions.push({
                    actionId: actions.getValue('action'),
                    order: actions.getValue('order'),
                    actionName: actions.action ? actions.action.getDisplayValue('name') : '',
                    primary: actions.getValue('primary') == true,
                });
            }
        }
        return resolvedActions;

    },

    fetchFormattedActions: function(actionsList) {
        var that = this;
        return actionsList.map(function(action) {
            var gr = new GlideRecord('sn_ex_sp_action');
            if (!gr.get(action.actionId))
                return {};
            return that.mergeObjects(action, that.getActionDefaultObj(gr));
        }).filter(function(x) {
            return x.hasOwnProperty('type');
        });
    },

    getActionDefaultObj: function(action) {
        var action_Type = new GlideRecord('sn_ex_sp_action_type');

        if (action.table && this.isValidContext) {
            if (action.table != this.context.getTableName())
                return {};
        } else if (action.table && !this.isValidContext) {
            return {};
        }

        action_Type.get(action.action_type);

        var hasServerScript = !gs.nil(action_Type.server_script.toString());
        var reverseExecution = action_Type.getValue('reverse_execution');
        //get parameters for server script
        var serverscriptvalue = {
            "actionSysId": action.getUniqueValue()
        };
        if (hasServerScript) {
            var serverParameters = new GlideRecord('sn_ex_sp_action_parameter');
            serverParameters.addQuery('action', action.getUniqueValue());
            serverParameters.addQuery('is_client', false);
            serverParameters.query();
            while (serverParameters.next()) {
                var val = this.resolveParameter(serverParameters);
                serverscriptvalue[serverParameters.getValue('name')] = val;
            }
        }

        //get parameters for client script
        var clientParams = {
            "actionSysId": action.getUniqueValue()
        };
        var clientParamters = new GlideRecord('sn_ex_sp_action_parameter');
        clientParamters.addQuery('action', action.getUniqueValue());
        clientParamters.addQuery('is_client', true);
        clientParamters.query();
        while (clientParamters.next()) {
            var val = this.resolveParameter(clientParamters);
            clientParams[clientParamters.getValue('name')] = val;
        }

        var clientScript = this._replaceTranslations(action_Type.client_script.toString());

        return {
            type: action.getValue('action_type'),
            actionName: action.getDisplayValue('name'),
            actionIcon: action.getDisplayValue('icon'),
            clientParams: clientParams,
            clientScript: clientScript,
            serverScriptInputs: serverscriptvalue,
            hasServerScript: hasServerScript,
            reverseExecution: reverseExecution
        };
    },

    _replaceTranslations: function(script) {
        try {
            var keys = script.match(/\${(.+?)\}/g);
            if (keys && keys.length > 0) {
                var keyValueMap = {};
                for (var i = 0; i < keys.length; i++) {
                    if (keyValueMap[keys[i]]) {
                        continue;
                    }
                    keyValueMap[keys[i]] = gs.getMessage(keys[i].substring(keys[i].indexOf('${') + 2, keys[i].indexOf('}')).trim());
                    if (!keyValueMap[keys[i]]) {
                        keyValueMap[keys[i]] = '';
                    }
                    script = script.replaceAll(keys[i], keyValueMap[keys[i]]);
                }
            }
        } catch (e) {
            return script;
        }
        return script;
    },

    executeActionServerScript: function(actionId, actionParameters) {
        var gr = new GlideRecord('sn_ex_sp_action');
        gr.get(actionId);
        var actionTypeGR = gr.action_type.getRefRecord();
        var evaluator = new GlideScopedEvaluator();
        var that = this;
        Object.keys(actionParameters).map(function(x) {
            evaluator.putVariable(x, that._inputParamCreator(actionParameters[x]));
            return x;
        });
        return evaluator.evaluateScript(actionTypeGR, 'server_script');


    },

    _inputParamCreator: function(input) {
        if (this.returnParametersWithTypes && input.hasOwnProperty('param_type')) {
            if (input.param_type == 'json')
                return JSON.parse(input.value);
            return input.value;
        }
        return input;
    },

    _outputParamCreator: function(type) {
        var that = this;
        return function(value) {
            if (!that.returnParametersWithTypes)
                return value;
            return {
                'param_type': type,
                'value': value
            };
        };
    },

    resolveParameter: function(parameter) {
        var type = parameter.getValue('parameter_type').toString();
        var outputCreator = this._outputParamCreator(type);
        switch (type) {
            case 'string':
                return outputCreator(parameter.getValue('text'));
            case 'json':
                return outputCreator(parameter.getValue('json'));
            case 'dynamic':
                this.dynamicParameterMap[parameter.getValue('name')] = null;
                return outputCreator();
            case 'table':
                return outputCreator(this.isValidContext ? (parameter.is_display_value ? this.context.getDisplayValue(parameter.getValue('field')) : this.context.getElement(parameter.getValue('field')).toString()) : '');
        }
    },

    resolveActionVisibility: function(action) {
        switch (action.action_visibility.toString()) {
            case "self":
                if (this.isValidContext && this.context.getTableName() == 'sys_user') {
                    return this.context.getValue('user_name') == gs.getUserName();
                }
                return this.isValidContext ? this.context.getValue('sys_created_by') == gs.getUserName() : false;
            case "others":
                if (this.isValidContext && this.context.getTableName() == 'sys_user') {
                    return this.context.getValue('user_name') != gs.getUserName();
                }
                return this.isValidContext ? this.context.getValue('sys_created_by') != gs.getUserName() : false;
            case "manager":
                if (this.context.getTableName() == 'sys_user') {
                    return this.context.getValue('manager') == gs.getUserID();
                }
                return false;
            case "user_criteria":
                return sn_uc.UserCriteriaLoader.userMatches(gs.getUserID(), [action.getValue('user_criteria')]);
            case 'adv':
                var evaluator = new GlideScopedEvaluator();
                evaluator.putVariable('context', this.context);
                return evaluator.evaluateScript(action, 'script');
            case "all":
                return true;
            default:
                return false;
        }
    },

    //Writing own object.assin like function as it is not supported in ECMA Script 5
    mergeObjects: function() {
        var overiddenClone = {};
        for (var index = 0; index < arguments.length; index++) {
            for (var property in arguments[index]) {
                overiddenClone[property] = arguments[index][property];
            }
        }
        return overiddenClone;
    },

    /**
     * Gets the esignature object for the given approval record
     * @param {GlideRecord} approvalGr The approval record to check for esignture
     * @return {Object} with username, userSysId and e_sign_required
     */
    getEsignObj: function() {
        var esignature = {
            username: gs.getUserName(),
            userSysId: gs.getUserID(),
            e_sign_required: GlidePluginManager.isActive('com.glide.e_signature_approvals')
        };
        if (esignature.e_sign_required && this.isValidContext && this.context.getTableName() == 'sysapproval_approver') {
            var esigUtils = new global.ESignatureUtils();
            if (typeof esigUtils.isApprovalEnabled === 'function')
                esignature.e_sign_required = esigUtils.isApprovalEnabled(this.context);
            else {
                var sourceTable = this.context.source_table;
                if (gs.nil(sourceTable)) {
                    sourceTable = this.context.sysapproval.sys_class_name;
                }
                esignature.e_sign_required = esigUtils.isTableEnabled(sourceTable);
            }
        }
        return esignature;
    },
};
