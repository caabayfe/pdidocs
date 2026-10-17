var CMDBAssistWorkspaceUtils = Class.create();
CMDBAssistWorkspaceUtils.prototype = {
    initialize: function() {
		this.CI_SUMMARIZATION_SKILL_ID = '67505b4577c412108cca067f5b5a996b';
		this.MANAGE_DUPLICATE_CIS_SKILL_ID = '3d021bc577c412108cca067f5b5a99f8';
		this.CMDB_ASSIST_PLUGIN_ID = 'com.snc.cmdb.gen.ai'
    },

	isManageDedupeActive: function () {
		return {
			pluginActive: this._isCMDBAssistPluginActive(),
			skillActive: this._isSkillActive(this.MANAGE_DUPLICATE_CIS_SKILL_ID)
		};
	},

	isCISummarizationActive: function () {
		return {
			pluginActive: this._isCMDBAssistPluginActive(),
			skillActive: this._isSkillActive(this.CI_SUMMARIZATION_SKILL_ID)
		};
	},

	_isCMDBAssistPluginActive: function() {
		return GlidePluginManager.isActive(this.CMDB_ASSIST_PLUGIN_ID);
	},

	_isSkillActive: function(skillId) {
		var configUtil = new sn_nowassist_admin.NowAssistSkillConfig();
		return configUtil.isSkillConfigurationActive(skillId) && 
			configUtil.isSkillConfigurationEnabledInProduct(skillId);

	},

    type: 'CMDBAssistWorkspaceUtils'
};
