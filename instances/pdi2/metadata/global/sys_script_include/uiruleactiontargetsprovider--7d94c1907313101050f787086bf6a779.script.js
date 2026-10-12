var UIRuleActionTargetsProvider = Class.create();
UIRuleActionTargetsProvider.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    MOBILE_VIEW_TABLE: 'sys_sg_view_config',
    PARAMETER_SCREEN_TABLE: 'sys_sg_parameter_screen',
    PARAMETER_SECTION_TABLE: 'sys_sg_parameter_section',

    /**
     * Get target field choices for UI rule action, from either parent mobile view or parent parameter screen
     */
    getTargets: function() {
        var uiRuleId = this.getParameter('sysparam_ui_rule_id');
        var uiRule = new GlideRecord('sys_sg_ui_rule');
        if (!uiRule.canRead()) {
            MobileMessageUtil.addSecurityErrorForTable('sys_sg_ui_rule');
            return null;
        }

        var type = this.getParameter('sysparam_ui_rule_action_operation');
        var inputTypeFilter = this.getParameter('sysparam_ui_rule_input_filter');
        var includesVariables = this.getParameter('sysparam_ui_rule_action_include_variables');
        uiRule.get(uiRuleId);
        var parentId = uiRule.parent_id;
        if (parentId == undefined || parentId == '') {
            gs.addErrorMessage(gs.getMessage("Cannot find any valid target for current UI rule action. Parent ID of UI rule cannot be empty"));
            return null;
        }

        var parentTable = uiRule.parent_table;
        if (parentTable == undefined || parentTable == '') {
            gs.addErrorMessage(gs.getMessage("Cannot find any valid target for current UI rule action. Parent table of UI rule cannot be empty"));
            return null;
        }

        var parent = new GlideRecord(parentTable);
        if (!uiRule.canRead()) {
            MobileMessageUtil.addSecurityErrorForTable(parentTable);
            return null;
        }

        parent.get(parentId);
        if (!parent.isValidRecord()) {
            gs.addErrorMessage(gs.getMessage("Cannot find any valid target for current UI rule action. Parent ID of UI rule is invalid."));
            return null;
        }

        switch (String(parentTable)) {
            case this.MOBILE_VIEW_TABLE:
                return this._getItemViewElements(parent, type);
            case this.PARAMETER_SCREEN_TABLE:
                return this._getParameterScreenInputs(parentId, inputTypeFilter, includesVariables);
            case this.PARAMETER_SECTION_TABLE:
                return this._getParameterSectionInputs(parentId, inputTypeFilter, includesVariables);
            default:
                gs.addErrorMessage(gs.getMessage("Cannot find any valid target for current UI rule action. Parent table of UI rule is not supported."));
                return null;
        }

    },

    _getItemViewElements: function(viewConfig, type) {
        var templateId = viewConfig.template;
        if (templateId == undefined || templateId == '') {
            gs.addErrorMessage(gs.getMessage("Cannot find any valid target for current UI rule action. Parent mobile view of UI rule cannot have an empty view template"));
            return null;
        }

        var viewTemplate = new GlideRecord('sys_sg_view_template');
        viewTemplate.get(templateId);
        var templateJsonToParse = viewTemplate.template_json;
        if (templateJsonToParse == undefined || templateJsonToParse == '') {
            gs.addErrorMessage(gs.getMessage("Cannot find any valid target for current UI rule action. Parent mobile view of UI rule cannot have an empty template JSON"));
            return null;
        }

        try {
            var elementProcessor = new ItemViewElementProcessor();
            var idList = [];
            if (type == "text")
                idList = elementProcessor.getItemViewTextElementsIds(templateJsonToParse);
            else
                idList = elementProcessor.getItemViewElementsIds(templateJsonToParse);
            if (idList.length <= 0) {
                gs.addErrorMessage(gs.getMessage("Cannot find any valid target for current UI rule action. Parent mobile view template JSON of UI rule doesn't contain any valid slot or view template JSON structure is invalid"));
                return null;
            }

            var result = {
                "parentTable": this.MOBILE_VIEW_TABLE,
                "targetList": JSON.stringify(idList)
            };

            return JSON.stringify(result);
        } catch (err) {
            gs.addErrorMessage(gs.getMessage("Cannot process view template slot: {0}", err.message));
        }
    },

    _getParameterScreenInputs: function(parameterScreenId, inputTypeFilter, includesVariables) {
        var inputList = [];
        inputList = inputList.concat(this._getInputsFromScreens(parameterScreenId, inputTypeFilter));
        inputList = inputList.concat(this._getInputsFromSectionsByScreen(parameterScreenId, inputTypeFilter));
        if (includesVariables) {
            inputList = inputList.concat(this._getVariablesFromScreen(parameterScreenId));
            inputList = inputList.concat(this._getVariablesFormSectionsByScreen(parameterScreenId));
        }

        if (inputList.length <= 0) {
            gs.addErrorMessage(gs.getMessage("Cannot find any valid target for current UI rule action. Parent parameter Screen of UI rule doesn't have any inputs"));
            return null;
        }

        var result = {
            "parentTable": this.PARAMETER_SCREEN_TABLE,
            "targetList": inputList
        };

        return JSON.stringify(result);
    },

    _getParameterSectionInputs: function(parameterSectionId, inputTypeFilter, includesVariables) {
        var inputList = this._getInputsFromSectionsById(parameterSectionId, inputTypeFilter);
        if (includesVariables)
            inputList = inputList.concat(this._getVariablesFromSectionsById(parameterSectionId));

        if (inputList.length <= 0) {
            gs.addErrorMessage(gs.getMessage("Cannot find any valid target for current UI rule action. Parent parameter section of UI rule doesn't have any inputs"));
            return null;
        }

        var result = {
            "parentTable": this.PARAMETER_SECTION_TABLE,
            "targetList": inputList
        };

        return JSON.stringify(result);
    },

    _getInputsFromScreens: function(parameterScreenId, inputTypeFilter) {
        return this._queryInputs(parameterScreenId, null, null, inputTypeFilter);

    },

    _getInputsFromSectionsByScreen: function(parameterScreenId, inputTypeFilter) {
        var sectionM2ms = new GlideRecord('sys_sg_parameter_section_m2m');
        sectionM2ms.addActiveQuery();
        sectionM2ms.addQuery("parameter_screen", parameterScreenId);
        sectionM2ms.query();

        var inputList = [];
        while (sectionM2ms.next()) {
            inputList = inputList.concat(this._queryInputs(null, sectionM2ms.getValue("parameter_section"), sectionM2ms.getValue("name"), inputTypeFilter));
        }

        return inputList;
    },

    _getInputsFromSectionsById: function(parameterSectionId, inputTypeFilter) {
        return this._queryInputs(null, parameterSectionId, null, inputTypeFilter);
    },

    _queryInputs: function(parameterScreenId, parameterSectionId, parameterSectionName, inputTypeFilter) {
        inputs = new GlideRecord('sys_sg_input');
        inputs.addActiveQuery();
        if (parameterScreenId != null)
            inputs.addQuery("parameter_screen", parameterScreenId);

        if (parameterSectionId != null)
            inputs.addQuery("parameter_section", parameterSectionId);

        if (inputTypeFilter != null)
            inputs.addQuery("type", inputTypeFilter);

        inputs.query();
        var inputList = [];
        while (inputs.next()) {
            var sectionPrefix = "";
            if (parameterSectionName != null)
                sectionPrefix = parameterSectionName + ".";

            var inputPrefix = "input: ";
            inputList.push(inputPrefix + sectionPrefix + inputs.getValue("name"));
        }

        return inputList;
    },

    _getVariablesFromScreen: function(parameterScreenId) {
        return this._queryVariables(parameterScreenId, null, null);
    },

    _getVariablesFromSectionsById: function(parameterSectionId) {
        return this._queryVariables(null, parameterSectionId, null);
    },

    _getVariablesFormSectionsByScreen: function(parameterScreenId) {
        var sectionM2ms = new GlideRecord('sys_sg_parameter_section_m2m');
        sectionM2ms.addActiveQuery();
        sectionM2ms.addQuery("parameter_screen", parameterScreenId);
        sectionM2ms.query();

        var variablesList = [];
        while (sectionM2ms.next()) {
            variablesList = variablesList.concat(this._queryVariables(null, sectionM2ms.getValue("parameter_section"), sectionM2ms.getValue("name")));
        }

        return variablesList;
    },

    _queryVariables: function(parameterScreenId, parameterSectionId, parameterSectionName) {
        var variables = new GlideRecord("sys_sg_variable");
        if (parameterScreenId != null)
            variables.addQuery("parameter_screen", parameterScreenId);

        if (parameterSectionId != null)
            variables.addQuery("parameter_section", parameterSectionId);

        variables.query();
        var variablesList = [];
        while (variables.next()) {
            var sectionPrefix = "";
            if (parameterSectionName != null)
                sectionPrefix = parameterSectionName + ".";

            var variablePrefix = "variable: ";
            variablesList.push(variablePrefix + sectionPrefix + variables.getValue("name"));
        }
        return variablesList;
    },

    type: 'UIRuleActionTargetsProvider'
});
