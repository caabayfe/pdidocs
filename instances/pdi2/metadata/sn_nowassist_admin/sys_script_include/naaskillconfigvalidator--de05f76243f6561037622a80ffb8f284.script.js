var NAASkillConfigValidator = {

    isSkillConfigVisibleInOverrides: function(skillConfigUiGr, skillConfigUiId, skillConfigId) {
        var skillConfigOverrides = NAASkillConfigUtil.getOverrideSkillConfigurations(skillConfigUiGr, skillConfigUiId, skillConfigId);

        if (!gs.nil(skillConfigOverrides)) {
            if (!gs.nil(skillConfigOverrides.visibility))
                return skillConfigOverrides.visibility;
        }
        return true;
    },

    doesSkillConfigContainVarSets: function(skillConfigId) {
        var skillConfigVarSetGr = new GlideRecord(NAAConstant.SKILL_CONFIG_VAR_SET);
        skillConfigVarSetGr.addQuery('skill_config', skillConfigId);
        skillConfigVarSetGr.addQuery('hide_step', false);
        skillConfigVarSetGr.addNullQuery('parent');
        skillConfigVarSetGr.setLimit(1);
        skillConfigVarSetGr.query();

        return skillConfigVarSetGr.getRowCount() > 0;
    },

    /*
	This method, if it returns false, will override the default functionality of displaying skills that do not utilize third-party providers for for GCC or self-hosted instances, instead showing all skills.
    */
    isExternalProviderFilteringDisabled: function() {
        return NAAStringUtil.isPropertyTrue(gs.getProperty("sn_nowassist_admin.is_external_provider_filtering_disabled", true));
    },

    isExternalProvider: function(capabilityId, skillConfigId) {
        var isExternal = false;
        if (!capabilityId) {
            return isExternal;
        }
        var isRegulatedOrSelfHostedInstance = NAAConstant.PLUGIN_UTIL.isRegulatedOrSelfHostedInstance();
        if (isRegulatedOrSelfHostedInstance) {
            try {
                var sbNaaUtil = new SkillBuilderNaaUtils();
                var defaultCapabilityDefinition = sbNaaUtil.getDefaultCapabilityDefinitionForSkillConfig(skillConfigId);
                var provider = NAAGenAIUtil.getProviderFromCapability(capabilityId, defaultCapabilityDefinition).providerName;
                if (gs.nil(provider)) {
                    var skillConfigM2M = new GlideRecord(NAAConstant.CONFIG_SKILL_M2M);
                    skillConfigM2M.addQuery('skill_config', skillConfigId);
                    skillConfigM2M.query();
                    if (skillConfigM2M.next()) {
                        provider = NAAGenAIUtil.getProviderFromCapability(skillConfigM2M.getValue('skill_id'), defaultCapabilityDefinition).providerName;
                    }
                }
                if (!gs.nil(provider)) {
                    var modelConfigGr = new GlideRecord(NAAConstant.GENERATIVE_AI_MODEL_CONFIG);
                    modelConfigGr.addQuery('provider.provider', provider);
                    modelConfigGr.query();
                    while (modelConfigGr.next()) {
                        var external = modelConfigGr.getValue('external');
                        if (external === NAAConstant.TRUE_ONE || external === NAAConstant.TRUE) {
                            isExternal = true
                        }
                    }
                }

            } catch (error) {
                gs.error('Error fetching external provider', error.toString());
            }
        }
        return isExternal;
    },

    /**
     * 
     */
    getIsSkillGeneratedFromSkillKit: function(configId) {
        var skillConfigVarGr = new GlideRecord(NAAConstant.SKILL_CONFIG_VAR_SET);
        skillConfigVarGr.addQuery("skill_config.sys_id", configId);
        // Below sys_id is 'Skill builder Delivery step' or "view trigger" config type
        skillConfigVarGr.addQuery("config_type.sys_id", "IN", NAAConstant.SKILL_BUILDER_DELIVERY_STEP_CONFIG_TYPE.concat(",", NAAConstant.DEFAULT_VIEW_TRIGGER_VAR_SET_CONFIG_TYPE));
        skillConfigVarGr.query();
        return skillConfigVarGr.getRowCount() > 0;
    },

    /**
     * 
     */
    isSkillActive: function(skillConfigGr, skillConfigStatus, active) {
        if (!gs.nil(active)) {
            if (!gs.nil(skillConfigStatus)) {
                if ((skillConfigStatus['active'] === "1") != active)
                    return false;
            } else if ((skillConfigGr.getValue('active') === "1") != active) {
                return false;
            }
        }

        return true;
    },

    /**
     * 
     */
    isSkillNotActive: function(skillConfigGr, skillConfigStatus, active) {
        return !NAASkillConfigValidator.isSkillActive(skillConfigGr, skillConfigStatus, active);
    },

    /**
     * 
     */
    canDisplayWWNACard: function() {
        try {
            var skillConfigStatusGr = new GlideRecord(NAAConstant.SKILL_CONFIG_STATUS);
            skillConfigStatusGr.addQuery('active', true);

            // Perform a JOIN with the SKILL_CONFIG_VAR_SET table
            skillConfigStatusGr.addJoinQuery(NAAConstant.SKILL_CONFIG_VAR_SET, 'skill_config', 'skill_config')
                .addCondition('config_type', NAAConstant.CONSTANTS.WWNA_CONFIG_TYPE_ID)
                .addCondition('skill_config', '!=', NAAConstant.CONSTANTS.NACM_SKILL_CONFIG_TEMPLATE);

            skillConfigStatusGr.query();
            return skillConfigStatusGr.getRowCount() == 0;
        } catch (error) {
            gs.error("An error occured in canDisplayWWNACard: " + error.toString());
            return false;
        }
    },

    isNowLLMAvailableForSkill: function(skillConfigId) {
        try {
            var capabilityList = NAASkillConfigUtil.getCapabilitiesBySkillId(skillConfigId);
            for (let capability of capabilityList) {
                var providerList = [...NAAGenAIUtil._getAllProviderIdsFromCapability(capability)];
                if (!providerList.includes(NAAConstant.NOW_LLM_PROVIDER_ID)) {
                    return false;
                }
            }
            return true;
        } catch (error) {
            gs.error("NAASkillConfigValidator: Error occurred in isNowLLMAvailableForSkill function:" + error.toString());
        }
    },

    type: 'NAASkillConfigValidator'
};
