var NAASkillConfigAPI = {
    /**
     * This is the API wrapper method for getSkillConfig function, which returns the object with status and body.
     *
     * @param {String} skillConfigId(sn_nowassist_skill_config)
     *
     * @return An object that contains status and body with details of skill configuration record
     * and its associated skill config variables.
     */
    getSkillConfigAPI: function(skillConfigId) {
        var result = {};
        try {
            var skillConfig = NAASkillConfigUtil.getSkillConfig(skillConfigId);
            result.status = 200;
            result.body = {
                skillConfig: skillConfig
            };
        } catch (e) {
            result.status = 400;
            result.body = {
                error: e
            };
        }
        return result;
    },

    activateSkillConfigAPI: function(skillConfigId, hasVarSet) {
        hasVarSet = hasVarSet || false;
        var result = {};

        try {
            var activatedObj = NAASkilConfigActivateToggler.activateSkillConfig(skillConfigId, hasVarSet);
            if (gs.nil(activatedObj.update)) {
                result.status = 422;
                result.body = {
                    data: activatedObj.message
                }
            } else if (activatedObj.update) {
                result.status = 200;
                result.body = {
                    parent: activatedObj.parent
                };
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



    deActivateSkillConfigAPI: function(skillConfigId) {
        var result = {};
        try {
            var deactivatedObj = NAASkilConfigActivateToggler.deActivateSkillConfig(skillConfigId);
            if (gs.nil(deactivatedObj.update)) {
                result.status = 422;
                result.body = {
                    data: deactivatedObj.message
                }
            } else if (deactivatedObj.update) {
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

    duplicateSkillAPI: function(skillConfigId, isDomainDifferent, domainId) {
        var result = {};
        try {
            let duplicatedSkillConfigId = isDomainDifferent ? NAACloneUtil._duplicateSkillInDifferentDomain(skillConfigId, domainId) : NAACloneUtil._duplicateSkillInSameDomain(skillConfigId);

            result.status = 200;
            result.body = {
                newSkillConfigId: duplicatedSkillConfigId,
                hasVarSet: NAASkillConfigVarUtil._doesSkillConfigContainVarSets(duplicatedSkillConfigId)
            };
        } catch (e) {
            result.status = 400;
            result.body = {
                error: e
            };
        }
        return result;
    },



    deleteSkillConfigAPI: function(skillConfigId) {
        var result = {};
        try {
            result.status = 200;
            result.body = {
                deleted: NAASkillConfigManipulatorUtil._deleteSkillConfig(skillConfigId),
            };
        } catch (e) {
            result.status = 400;
            result.body = {
                error: e
            };
        }
        return result;
    },

    saveSkillConfigGeneralDetailsAPI: function(payload) {
        var result = {};
        var skillConfigGr = new GlideRecord(NAAConstant.SKILL_CONFIG);
        if (skillConfigGr.get(payload.sysId) && NAARoleUtil._hasEditAccess(skillConfigGr)) {
            skillConfigGr.setValue('name', payload.name);
            skillConfigGr.setValue('description', payload.description);
            skillConfigGr.setValue('workflow', false);
            result.updated = skillConfigGr.update();
            result.skillTranslatedText = NAASkillConfigUtil._getSkillsUpdatedTranslatedText(payload.name, payload.skillFamilyName, payload.skillParentame, payload.skillFamilyParentName);
            return result;
        }
        result.updated = false;
        return result;
    },


    type: 'NAASkillConfigAPI'
};
