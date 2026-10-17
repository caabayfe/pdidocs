var NAASkillConfigVarAPI = {

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




    type: 'NAASkillConfigVarAPI'
};
