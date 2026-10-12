var NAASkillConfigManipulatorUtil = {

    upsertSkillConfig: function(skillConfigId, skillConfigData, insert = false) {

        var skillConfigGr = new GlideRecord(NAAConstant.SKILL_CONFIG);
        if (NAARoleUtil._hasEditAccess(skillConfigGr)) {

            if (insert)
                skillConfigGr.initialize();
            else
                skillConfigGr.get(skillConfigId);

            for (var key in skillConfigData) {
                skillConfigGr.setValue(key, skillConfigData[key]);
            }
            return insert ? skillConfigGr.insert() : skillConfigGr.update();
        }
        return null;
    },

    _deleteSkillConfig: function(skillConfigId) {
        try {
            var deleted = false;
            var skillConfigGr = new GlideRecord(NAAConstant.SKILL_CONFIG);
            if (skillConfigGr.get(skillConfigId) && NAARoleUtil._hasEditAccess(skillConfigGr)) {
                deleted = skillConfigGr.deleteRecord();
            }
            var skillConfigStatusGr = new GlideRecord(NAAConstant.SKILL_CONFIG_STATUS);
            skillConfigStatusGr.addQuery('skill_config', skillConfigId);
            skillConfigStatusGr.setLimit(1);
            skillConfigStatusGr.query();
            if (NAARoleUtil._hasEditAccess(skillConfigStatusGr)) {
                skillConfigStatusGr.deleteMultiple();
            }
            var skillConfigVarSetGr = new GlideRecord(NAAConstant.SKILL_CONFIG_VAR_SET);
            skillConfigVarSetGr.addQuery('skill_config', skillConfigId);
            skillConfigVarSetGr.query();
            if (NAARoleUtil._hasEditAccess(skillConfigVarSetGr)) {
                skillConfigVarSetGr.deleteMultiple();
            }
            var skillConfigM2MSkill = new GlideRecord(NAAConstant.CONFIG_SKILL_M2M);
            skillConfigM2MSkill.addQuery('skill_config', skillConfigId);
            skillConfigM2MSkill.query();
            if (NAARoleUtil._hasEditAccess(skillConfigM2MSkill)) {
                skillConfigM2MSkill.deleteMultiple();
            }
            var skillConfigAppGr = new GlideRecord(NAAConstant.SKILL_CONFIG_APP);
            skillConfigAppGr.addQuery('skill_config', skillConfigId);
            skillConfigAppGr.query();
            if (NAARoleUtil._hasEditAccess(skillConfigAppGr)) {
                skillConfigAppGr.deleteMultiple();
            }
            return deleted;
        } catch (error) {
            gs.error("Error encountered while deleting the skill", error.toString());
            return null;
        }
    },

    _updateSkillConfigStatus: function(skillConfigStatusGr, skillConfigStatusData) {
        for (var key in skillConfigStatusData) {
            skillConfigStatusGr.setValue(key, skillConfigStatusData[key]);
        }
        return skillConfigStatusGr.update();
    },

    _insertSkillConfigStatus: function(skillConfigId, skillConfigStatusGr, skillConfigStatusData) {
        skillConfigStatusGr.initialize();
        skillConfigStatusGr.setValue('skill_config', skillConfigId);
        for (var key in skillConfigStatusData) {
            skillConfigStatusGr.setValue(key, skillConfigStatusData[key]);
        }
        if (NAAPluginUtil.isDomainSeparationInstalled()) {
            var skillConfigGr = new GlideRecord(NAAConstant.SKILL_CONFIG);
            if (skillConfigGr.get(skillConfigId)) {
                if (!gs.nil(skillConfigGr.getValue('sys_overrides'))) {
                    var parentSkillConfigStatusGr = new GlideRecord(NAAConstant.SKILL_CONFIG_STATUS);
                    parentSkillConfigStatusGr.addQuery('skill_config', skillConfigGr.getValue('sys_overrides'))
                    parentSkillConfigStatusGr.setLimit(1);
                    parentSkillConfigStatusGr.query();
                    if (parentSkillConfigStatusGr.next()) {
                        skillConfigStatusGr.setValue('sys_overrides', parentSkillConfigStatusGr.getUniqueValue());
                    }
                }
            }
        }
        return skillConfigStatusGr.insert();
    },

    _insertSkillConfigStatusFromBR: function(skillConfigId, skillConfigStatusData) {
        try {
            if (gs.nil(skillConfigId))
                return null;

            var skillConfigStatusGr = new GlideRecord(NAAConstant.SKILL_CONFIG_STATUS);
            skillConfigStatusGr.addQuery('skill_config', skillConfigId);
            skillConfigStatusGr.setLimit(1);
            skillConfigStatusGr.query();
            if (!skillConfigStatusGr.next() && NAARoleUtil._hasEditAccess(skillConfigStatusGr)) {
                return NAASkillConfigManipulatorUtil._insertSkillConfigStatus(skillConfigId, skillConfigStatusGr, skillConfigStatusData);
            }
        } catch (error) {
            gs.error("NAASkillConfigManipulatorUtil : upsertSkillConfigStatus failed to create/update status of skill config" + error.toString());
        }
        return null;
    },

    upsertSkillConfigStatus: function(skillConfigId, skillConfigStatusData) {
        try {
            if (gs.nil(skillConfigId))
                return null;

            var skillConfigStatusGr = new GlideRecord(NAAConstant.SKILL_CONFIG_STATUS);
            skillConfigStatusGr.addQuery('skill_config', skillConfigId);
            skillConfigStatusGr.setLimit(1);
            skillConfigStatusGr.query();
            if (NAARoleUtil._hasEditAccess(skillConfigStatusGr)) {
                if (skillConfigStatusGr.next()) {
                    return NAASkillConfigManipulatorUtil._updateSkillConfigStatus(skillConfigStatusGr, skillConfigStatusData);
                } else {
                    return NAASkillConfigManipulatorUtil._insertSkillConfigStatus(skillConfigId, skillConfigStatusGr, skillConfigStatusData);
                }
            }
            return null;
        } catch (error) {
            gs.error("NAASkillConfigManipulatorUtil : upsertSkillConfigStatus failed to create/update status of skill config" + error.toString());
            return null;
        }
    },

    type: 'NAASkillConfigManipulatorUtil'
};
