var NAASkillConfigVarUtil = {

    upsertSkillConfigVarSet: function(skillConfigId, skillConfigVarSetId, skillConfigVarSetData, updateGSStatus = true, insert = false, parent = null, isDomainDifferent) {
        try {
            if (gs.nil(skillConfigId))
                throw new Error(NAAConstant.NULL_SKILL_CONFIG_ID_MESSAGE);

            var skillConfigVarSetVariableGr = new GlideRecord(NAAConstant.SKILL_CONFIG_VAR_SET);
            if (insert) {
                skillConfigVarSetVariableGr.initialize();
                skillConfigVarSetData['skill_config'] = skillConfigId;
                skillConfigVarSetData['step_completed'] = false;
                skillConfigVarSetData['parent'] = parent;
            } else {
                // Screen_id is appended to the var set data from _getSkillConfiguration function while retreving var set, removing skill_id while updating the var set.
                if (!gs.nil(skillConfigVarSetData['screen_id'])) {
                    delete skillConfigVarSetData['screen_id'];
                }
                skillConfigVarSetVariableGr.get(skillConfigVarSetId);
            }

            if (NAARoleUtil._hasEditAccess(skillConfigVarSetVariableGr)) {
                for (var key in skillConfigVarSetData) {
                    if (key !== "step_completed")
                        skillConfigVarSetVariableGr.setValue(key, skillConfigVarSetData[key]);
                }
                if (!gs.nil(skillConfigVarSetData.props) && !NAAObjectUtil.isObjectEmpty(skillConfigVarSetData.props)) {
                    for (var variableName in skillConfigVarSetData.props) {
                        if (variableName !== "sys_meta" && variableName !== "sys_id")
                            skillConfigVarSetVariableGr.vars[variableName] = skillConfigVarSetData.props[variableName];
                    }
                }
                var parentSkillConfigVarSetId = null;
                if (insert) {
                    if (isDomainDifferent) {
                        skillConfigVarSetVariableGr.sys_domain = null;
                        skillConfigVarSetVariableGr.sys_domain_path = null;
                        skillConfigVarSetVariableGr.sys_overrides = skillConfigVarSetData.sys_id;
                    }
                    parentSkillConfigVarSetId = skillConfigVarSetVariableGr.insert();
                } else {
                    skillConfigVarSetVariableGr.update();
                }

                if (updateGSStatus)
                    NAAGuidedSetupUtil._upsertGuidedSetupStatus(skillConfigId, skillConfigVarSetId, skillConfigVarSetData.step_completed);
                if (!gs.nil(skillConfigVarSetData.override_sets)) {
                    for (var overrideSetIndex = 0; overrideSetIndex < skillConfigVarSetData.override_sets.length; overrideSetIndex++) {
                        var overrideSet = skillConfigVarSetData.override_sets[overrideSetIndex];
                        NAASkillConfigVarUtil.upsertSkillConfigVarSet(skillConfigId, overrideSet.sys_id, overrideSet, updateGSStatus, insert, parentSkillConfigVarSetId, isDomainDifferent);
                    }
                }
            }
        } catch (e) {
            gs.error("Error ocured while upserting skill configuration varset: " + e);
        }
    },

    _getSkillConfigurationVariables: function(skillConfigId, guidedSetupStepStatus, shouldIncludeVariableOverrides) {
        var skillConfigVarSetGr = new GlideRecord(NAAConstant.SKILL_CONFIG_VAR_SET);
        skillConfigVarSetGr.addQuery('skill_config', skillConfigId);
        skillConfigVarSetGr.orderBy('order');
        skillConfigVarSetGr.query();

        var skillConfigVariables = [];
        while (skillConfigVarSetGr.next()) {
            var varSetUIData = NAASkillConfigVarUtil._getVarSetUIData(skillConfigVarSetGr.getValue("sys_id"));
            skillConfigVariables.push(NAASkillConfigVarUtil._getVariableSetInfo(skillConfigVarSetGr, shouldIncludeVariableOverrides, varSetUIData, guidedSetupStepStatus));
        }

        return skillConfigVariables;
    },

    _getVarSetUIData: function(skillVarSetId) {
        var varSetUIGr = new GlideRecord(NAAConstant.SKILL_CONFIG_VAR_SET_UI);
        varSetUIGr.addQuery("var_set", skillVarSetId);
        varSetUIGr.query();

        var varSetUIInfo = {};
        if (varSetUIGr.next()) {
            var advancedScriptOutput = {};
            if (!gs.nil(varSetUIGr.getValue("advanced_script"))) {
                var evaluator = new GlideScopedEvaluator();
                var evaluatorOutput = evaluator.evaluateScript(varSetUIGr, 'advanced_script', {
                    "skillConfigVarSetUiGr": varSetUIGr
                });
                advancedScriptOutput = NAAObjectUtil.isObject(evaluatorOutput) ? evaluatorOutput : {};
            }

            varSetUIInfo[varSetUIGr.getValue('var_set')] = {
                name: !gs.nil(advancedScriptOutput["name"]) ? advancedScriptOutput["name"] : varSetUIGr.getDisplayValue('name'),
                description: !gs.nil(advancedScriptOutput["description"]) ? advancedScriptOutput["description"] : varSetUIGr.getDisplayValue('description'),
                hide_step: !gs.nil(advancedScriptOutput["hide_step"]) ? advancedScriptOutput["hide_step"] : varSetUIGr.getValue('hide_step') === "1",
                title: !gs.nil(advancedScriptOutput["title"]) ? advancedScriptOutput["title"] : varSetUIGr.getDisplayValue('title'),
                screen_id: !gs.nil(advancedScriptOutput["screen_id"]) ? advancedScriptOutput["screen_id"] : varSetUIGr.getValue('screen_id'),
                screen_table: varSetUIGr.getValue('screen_table')
            };
        }

        return varSetUIInfo;
    },

    _getVariableSetInfo: function(skillConfigVarSetGr, shouldIncludeVariableOverrides, varSetUIData, guidedSetupStepStatus) {
        var stepDetails = {};
        var varSetUI = varSetUIData[skillConfigVarSetGr.getValue('sys_id')];

        stepDetails.name = varSetUI ? varSetUI.name : skillConfigVarSetGr.getDisplayValue('name');
        stepDetails.description = varSetUI ? varSetUI.description : skillConfigVarSetGr.getDisplayValue('description');
        stepDetails.sys_scope = skillConfigVarSetGr.getValue('sys_scope');
        stepDetails.step_completed = guidedSetupStepStatus.hasOwnProperty(skillConfigVarSetGr.getValue('sys_id')) ? guidedSetupStepStatus[skillConfigVarSetGr.getValue('sys_id')] : skillConfigVarSetGr.getValue('step_completed') === "1";
        stepDetails.order = skillConfigVarSetGr.getValue('order');
        stepDetails.hide_step = varSetUI ? varSetUI.hide_step : skillConfigVarSetGr.getValue('hide_step') === "1";
        stepDetails.title = varSetUI ? varSetUI.title : skillConfigVarSetGr.getDisplayValue('title');
        stepDetails.sys_id = skillConfigVarSetGr.getValue('sys_id');
        stepDetails.sys_domain = skillConfigVarSetGr.getValue('sys_domain');
        stepDetails.config_type = skillConfigVarSetGr.getValue('config_type');
        stepDetails.skill_config = skillConfigVarSetGr.getValue('skill_config');
        stepDetails.parent = skillConfigVarSetGr.getValue('parent');
        stepDetails.parent_label = skillConfigVarSetGr.getDisplayValue('parent');

        //skill var set template
        var skillVarSetTemplateGr = new GlideRecord(NAAConstant.SKILL_CONFIG_TYPE);
        var configType = skillConfigVarSetGr.getValue('config_type');

        if (!gs.nil(varSetUI)) {
            if (!gs.nil(varSetUI.screen_id)) {
                stepDetails.screen_table = varSetUI.screen_table;
                stepDetails.screen_id = varSetUI.screen_id;
            } else {
                if (skillVarSetTemplateGr.get(configType)) {
                    stepDetails.screen_table = skillVarSetTemplateGr.getValue('screen_table');
                    stepDetails.screen_id = skillVarSetTemplateGr.getValue('screen_id');
                }
            }
        } else {
            if (!gs.nil(skillConfigVarSetGr.getValue('screen_id'))) {
                stepDetails.screen_table = skillConfigVarSetGr.getValue('screen_table');
                stepDetails.screen_id = skillConfigVarSetGr.getValue('screen_id');
            } else {
                if (skillVarSetTemplateGr.get(configType)) {
                    stepDetails.screen_table = skillVarSetTemplateGr.getValue('screen_table');
                    stepDetails.screen_id = skillVarSetTemplateGr.getValue('screen_id');
                }
            }
        }

        //props for skill var set
        stepDetails.props = NAASkillConfigVarUtil._getVariables(skillConfigVarSetGr);
        stepDetails.propsMetadata = NAASkillConfigVarUtil._getVariableMetadata(skillConfigVarSetGr);
        if (shouldIncludeVariableOverrides) {
            stepDetails.override_sets = NAASkillConfigVarUtil._getVariableOverrides(skillConfigVarSetGr, varSetUIData, guidedSetupStepStatus);
        }

        return stepDetails;
    },
    _getVariableMetadata: function(glideRecord) {
        var propMetadata = {};
        var vars = glideRecord.vars;
        try {
            for (var item in vars) {
                if (item !== "sys_meta") {
                    propMetadata[item] = {
                        label: vars[item].getLabel()
                    };
                }
            }
        } catch (e) {
            gs.error("NowAdminAssistUtil: Failed to compile variables for var set with id " + glideRecord.getValue('sys_id') + ": " + e.toString());
        }
        return propMetadata;
    },


    _getVariables: function(glideRecord) {
        var variables = {};
        var vars = glideRecord.vars;
        try {
            for (var item in vars) {
                if (item !== "sys_meta") {
                    variables[item] = vars[item].toString();
                }
            }
        } catch (e) {
            gs.error("NowAdminAssistUtil: Failed to compile variables for var set with id " + glideRecord.getValue('sys_id') + ": " + e.toString());
        }

        return variables;
    },

    _getVariableOverrides: function(variableSetGr, varSetUIData, guidedSetupStepStatus) {
        var skillConfigVarSetGr = new GlideRecord(variableSetGr.getTableName());
        skillConfigVarSetGr.addQuery('parent', variableSetGr.getValue('sys_id'));
        skillConfigVarSetGr.orderBy('order');
        skillConfigVarSetGr.query();

        var overrideSet = [];
        while (skillConfigVarSetGr.next()) {
            overrideSet.push(NAASkillConfigVarUtil._getVariableSetInfo(skillConfigVarSetGr, true, varSetUIData, guidedSetupStepStatus));
        }

        return overrideSet;
    },

    _getSkillConfigVarSetHierarchy: function(skillConfigId) {
        var skillConfigVarSetGr = new GlideRecord(NAAConstant.SKILL_CONFIG_VAR_SET);
        skillConfigVarSetGr.addQuery("skill_config", skillConfigId);
        skillConfigVarSetGr.addNullQuery("parent");
        skillConfigVarSetGr.query();

        var hierarchyTree = {};
        while (skillConfigVarSetGr.next()) {
            hierarchyTree[skillConfigVarSetGr.getUniqueValue()] = NAASkillConfigVarUtil._getSkillConfigVarSetChildHierarchy(skillConfigVarSetGr.getUniqueValue());
        }

        return hierarchyTree;
    },

    _getSkillConfigVarSetChildHierarchy: function(skillConfigVarSetId) {
        var hierarchyTree = {};
        var skillConfigVarSetGr = new GlideRecord(NAAConstant.SKILL_CONFIG_VAR_SET);
        skillConfigVarSetGr.addQuery("parent", skillConfigVarSetId);
        skillConfigVarSetGr.query();


        while (skillConfigVarSetGr.next()) {
            hierarchyTree[skillConfigVarSetGr.getUniqueValue()] = NAASkillConfigVarUtil._getSkillConfigVarSetChildHierarchy(skillConfigVarSetGr.getUniqueValue());
        }

        return hierarchyTree;
    },

    _doesSkillConfigContainVarSets: function(skillConfigId) {
        var skillConfigVarSetGr = new GlideRecord(NAAConstant.SKILL_CONFIG_VAR_SET);
        skillConfigVarSetGr.addQuery('skill_config', skillConfigId);
        skillConfigVarSetGr.addQuery('hide_step', false);
        skillConfigVarSetGr.addNullQuery('parent');
        skillConfigVarSetGr.setLimit(1);
        skillConfigVarSetGr.query();

        return skillConfigVarSetGr.getRowCount() > 0;
    },

	/**
	 * 
	 */
    clearSourceSkillConfigFromVarset: function(skillConfigId) {
        var skillConfigVarSetGr = new GlideRecord(NAAConstant.SKILL_CONFIG_VAR_SET);
        skillConfigVarSetGr.addQuery("config_type", NAAConstant.CONSTANTS.SKILL_CONFIG_DEFAULT_DEFINITION_CONFIG_TYPE);
        skillConfigVarSetGr.addQuery("skill_config", skillConfigId);
        skillConfigVarSetGr.query();
        while (skillConfigVarSetGr.next()) {
            skillConfigVarSetGr.vars.source_skill_config = "";
            skillConfigVarSetGr.update();
        }
    },

    type: 'NAASkillConfigVarUtil'
};
