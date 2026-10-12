var ListAIUtils = Class.create();
ListAIUtils.prototype = {
    initialize: function() {},

    SKILL_CONFIG_VAR_SET_TYPE: '65580fb5ff28321029fcffffffffff31',

    _getMRASkillConfiguration: function(task_skill_id) {
        var nowAssistSkillConfig = new sn_nowassist_admin.NowAssistSkillConfig();
        return nowAssistSkillConfig.getSkillConfiguration(task_skill_id);
    },

	getSkillFilter: function(skillConfig, tableName) {
        if (!skillConfig || !tableName || !skillConfig.task_skill_id)
            return '';

        try {
            var mraSkillConfiguration = this._getMRASkillConfiguration(skillConfig.task_skill_id);
            if (mraSkillConfiguration?.active) {
                var varSetTypeId = this.SKILL_CONFIG_VAR_SET_TYPE;
                var sets = mraSkillConfiguration.variable_sets.filter(function(varset) {
                    return varset.config_type === varSetTypeId;
                });
                return sets.length > 0 ? sets[0].props.filter : '';
            }
        } catch (e) {
            gs.warn('ListAIUtils.getSkillFilter: Failed to get skill filter for task_skill_id=' + skillConfig.task_skill_id + ', table=' + tableName + '. ' + e.message);
        }
        return '';
	},

    isSkillActive: function(skillConfig, tableName) {
        if (!skillConfig || !tableName || !skillConfig.task_skill_id)
            return false;

        try {
            var isAISupported = false;
            var mraSkillConfiguration = this._getMRASkillConfiguration(skillConfig.task_skill_id);
            if (mraSkillConfiguration?.active) {
                var varSetTypeId = this.SKILL_CONFIG_VAR_SET_TYPE;
                var sets = mraSkillConfiguration.variable_sets.filter(function(varset) {
                    return varset.config_type === varSetTypeId;
                });
                if (sets.length === 0) return false;
                var input_table = sets[0].props.table;
                if (input_table == tableName) {
                    isAISupported = true;
                } else {
                    var parents = this.getEveryParentTableRecursively(tableName);
                    for (let i = 0; i < parents.length; i++) {
                        var parent = parents[i];
                        if (input_table == parent) {
                            isAISupported = true;
                            break;
                        }
                    }
                }
            }
            isAISupported = isAISupported && this.isGAFJobCompleted(skillConfig);
            return isAISupported;
        } catch (e) {
            gs.warn('ListAIUtils.isSkillActive: Failed to check skill activity for task_skill_id=' + skillConfig.task_skill_id + ', table=' + tableName + '. ' + e.message);
            return false;
        }
    },

    isGAFJobCompleted: function(gafSkillConfig) {
        const {
            group_skill,
            action_skill
        } = gafSkillConfig;
        const result = new sn_gaf.GAFUtils().getGAFOfflineStatus(group_skill, action_skill);
        return result.status === "offline_job_complete";
    },

    getEveryParentTableRecursively: function(tableName) {
        var result = [];
        this._getParentTables(tableName, result);
        return result;
    },

    _getParentTables: function(tableName, result) {
        var tableHierarchy = new GlideTableHierarchy(tableName);
        var parent = tableHierarchy.getBase();
        // Recursively find and add parent tables to the result
        while (parent && parent !== tableName && !result.includes(parent)) {
            result.push(parent);
            tableName = parent;
            tableHierarchy = new GlideTableHierarchy(tableName);
            parent = tableHierarchy.getBase();
        }
    },

    type: 'ListAIUtils'
};
