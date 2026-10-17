var NowAdminAssistUtil = {

    /**
     * This is the API wrapper method for getSkillConfig function, which returns the object with status and body.
     *
     * @param {String} skillConfigId(sn_nowassist_skill_config)
     *
     * @return An object that contains status and body with details of skill configuration record
     * and its associated skill config variables.
     */
    getSkillConfigAPI: function(skillConfigId) {
        return NAASkillConfigAPI.getSkillConfigAPI(skillConfigId);
    },

    nowAssistPanelStatusAPI: function() {
        return NAANowAssistPanelAPI.nowAssistPanelStatusAPI();
    },

    activateSkillConfigAPI: function(skillConfigId, hasVarSet) {
        return NAASkillConfigAPI.activateSkillConfigAPI(skillConfigId, hasVarSet);
    },

    deActivateSkillConfigAPI: function(skillConfigId) {
        return NAASkillConfigAPI.deActivateSkillConfigAPI(skillConfigId);
    },

    duplicateSkillAPI: function(skillConfigId, isDomainDifferent, domainId) {
        return NAASkillConfigAPI.duplicateSkillAPI(skillConfigId, isDomainDifferent, domainId);
    },

    deleteSkillConfigAPI: function(skillConfigId) {
        return NAASkillConfigAPI.deleteSkillConfigAPI(skillConfigId);
    },

    saveSkillConfigGeneralDetailsAPI: function(payload) {
        return NAASkillConfigAPI.saveSkillConfigGeneralDetailsAPI(payload);
    },


    /**
     * This is the API wrapper method for getInstalledPlugins function, which returns the object with status and body.
     *
     * @return An object that contains status and body with details of plugin record
     */
    getTotalInstalledPluginsAPI: function() {
        var result = {};
        try {
            result.status = 200;
            result.body = {
                count: NAAPluginUtil.getInstalledPlugins().length
            };
        } catch (e) {
            result.status = 400;
            result.body = {
                error: e.message
            };
        }
        return result;
    },

	updateChatExperiences: function(skillConfigId, selectedVAList) {
        try {
            var associatedChatExperienceSysIds = selectedVAList.map(item => item.id);
            var sbNaaUtil = new SkillBuilderNaaUtils();
            return sbNaaUtil.updateContextProfileSkillRecord(skillConfigId, associatedChatExperienceSysIds);
        } catch (e) {
            gs.error("NowAdminAssistUtil: Unable to update chat experiences in NAA" + e.toString());
        }
        return null;

    },

    updateDeliveryModeAPI: function(skillConfigId, genAiSkillApplicabilityId, inProductActive, inProductRoles, inMobileActive, inMobileRoles, ceActive, ceRoles, updateRoles, chatExperiences, stepCompleted, isGeneratedFromSkillKit, editedInNask) {
        var result = {};

        try {

            var inProductUpdated = false;

            //There will be skillconfig for sure at this point. Fetching active flag here.
            var skillConfigGr = new GlideRecord(NAAConstant.SKILL_CONFIG);
            skillConfigGr.get(skillConfigId);
            var skillConfigStatus = NAASkillConfigUtil._getSkillConfigStatus(skillConfigId);

            if (!gs.nil(skillConfigStatus)) {
                inProductUpdated = NAASkillConfigManipulatorUtil.upsertSkillConfigStatus(skillConfigId, {
                    in_product_active: inProductActive,
                    in_product_roles: inProductRoles,
                    in_mobile_active: inMobileActive,
                    in_mobile_roles: inMobileRoles
                });
            } else {
                inProductUpdated = NAASkillConfigManipulatorUtil.upsertSkillConfigStatus(skillConfigId, {
                    active: skillConfigGr.getValue('active') ?? "0",
                    in_product_active: inProductActive,
                    in_product_roles: inProductRoles,
                    in_mobile_active: inMobileActive,
                    in_mobile_roles: inMobileRoles
                });
            }

            var genAiSkillApplicabilityData = {
                active: ceActive
            };

            // Update roles only if one sys_gen_ai_skill_applicability record mapped
            if (updateRoles) {
                genAiSkillApplicabilityData["roles"] = ceRoles;
            }
            NAAGuidedSetupUtil._upsertGuidedSetupStatus(skillConfigId, "select-delivery", stepCompleted);

            var genAiSkillUpdated = NAAGenAIUtil.updateGenAISkillApplicability(genAiSkillApplicabilityId, genAiSkillApplicabilityData);

            //Update Virtual assistants to sys_cs_context_profile_skill
            if(isGeneratedFromSkillKit && !editedInNask){
                NowAdminAssistUtil.updateChatExperiences(skillConfigId, chatExperiences);
            }


            if (inProductUpdated && genAiSkillUpdated) {
                result.status = 200;
                result.body = {};
            } else {
                result.status = 401;
                result.body = {
                    data: NAAConstant.UNAUTHORISED_MESSAGE
                };
            }
        } catch (e) {
            result.status = 400;
            result.body = {
                error: e
            };
        }

        return result;
    },

    updateSkillConfigVarSetAPI: function(skillConfigId, skillConfigVarSetId, skillConfigVarSetData) {
        var result = {};
        try {
            NAASkillConfigVarUtil.upsertSkillConfigVarSet(skillConfigId, skillConfigVarSetId, skillConfigVarSetData);
            result.status = 200;
            result.body = {};
        } catch (e) {
            result.status = 400;
            result.body = {
                error: e
            };
        }
        return result;
    },

    updateSkillConfigVarSetStepCompletedAPI: function(skillConfigId, skillConfigVarSetId, stepCompleted) {
        var result = {};
        try {
            NAAGuidedSetupUtil._upsertGuidedSetupStatus(skillConfigId, skillConfigVarSetId, stepCompleted);
            result.status = 200;
            result.body = {};
        } catch (e) {
            result.status = 400;
            result.body = {
                error: e
            };
        }
        return result;
    },

    getRolesListAPI: function() {
        var result = {};
        try {
            result.status = 200;
            result.body = {
                roles: NAARoleUtil.getRolesList()
            };
        } catch (e) {
            result.status = 400;
            result.body = {
                error: e
            };
        }
        return result;
    },



    type: 'NowAdminAssistUtil'
};
