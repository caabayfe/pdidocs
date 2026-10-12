/**
 * Builds AI list configuration for Now List data broker transforms.
 * Centralizes parsing of raw skill configuration and computing the aiListConfig
 * object consumed by both input and output transforms.
 */
var ListAIConfigBuilder = Class.create();
ListAIConfigBuilder.prototype = {
    initialize: function() {},

    /**
     * Builds the full MRA AI config object.
     *
     * @param {string|Object} rawSkillConfig - Serialized or parsed skill configuration.
     * @param {string} table - The target table name.
     * @param {Object} aiGroupInfo - Optional grouping context (sysId, requestedType, label, groupId).
     * @returns {Object} Populated AI config object, or empty object if config is invalid.
     */
    buildMRAConfig: function(rawSkillConfig, table, aiGroupInfo) {
        var skillConfig = this._parseSkillConfig(rawSkillConfig);
        if (!Object.keys(skillConfig).length) return {};

        if (!table || !skillConfig.task_skill_id) return {...skillConfig};

        var groupInfo = aiGroupInfo || {};
        var listAIUtils = new sn_now_list_common.ListAIUtils();
        var isAISupported = listAIUtils.isSkillActive(skillConfig, table);
        var aiLayoutMode = groupInfo.requestedType || (groupInfo.sysId ? 'single' : '');

        return {
            ...skillConfig,
            "aiLayoutMode": aiLayoutMode,
            "aiGroupingEnabled": isAISupported && (aiLayoutMode == 'single' || aiLayoutMode == 'grouped'),
            "groupSkillId": skillConfig.group_skill,
            "singleGroupId": groupInfo.sysId,
            "skillFilter": listAIUtils.getSkillFilter(skillConfig, table),
            "isAISupported": isAISupported,
            "label": groupInfo.label,
            "groupId": groupInfo.groupId,
        };
    },

    /**
     * Resolves whether AI is supported for the given skill config and table.
     *
     * @param {string|Object} rawSkillConfig - Serialized or parsed skill configuration.
     * @param {string} tableName - The target table name.
     * @returns {boolean} True if the skill is active and AI is supported for the table.
     */
    resolveIsAISupported: function(rawSkillConfig, tableName) {
        var skillConfig = this._parseSkillConfig(rawSkillConfig);
        if (!Object.keys(skillConfig).length || !skillConfig.task_skill_id) return false;
        return new sn_now_list_common.ListAIUtils().isSkillActive(skillConfig, tableName);
    },

    /**
     * Parses rawSkillConfig safely. Accepts a JSON string or a plain object.
     * Returns an empty object on parse failure or invalid input.
     *
     * @param {string|Object} rawSkillConfig
     * @returns {Object}
     */
    _parseSkillConfig: function(rawSkillConfig) {
        try {
            var parsed = typeof rawSkillConfig === 'string' ? JSON.parse(rawSkillConfig) : rawSkillConfig;
            return (parsed && typeof parsed === 'object') ? parsed : {};
        } catch (e) {
            gs.warn('ListAIConfigBuilder._parseSkillConfig: Failed to parse skillConfiguration. ' + e.message);
            return {};
        }
    },

    type: 'ListAIConfigBuilder'
};
