var CreatorStudioGenAI = Class.create();
CreatorStudioGenAI.prototype = {
	// this function takes in gpm and scu for testing in ATF, normally this should just be initialized with new CreatorStudioGenAI()
	initialize: function(gpm, scu) {
		this.TEXT_2_CATALOG_PLUGIN_ID = "com.snc.text2catalog";
		this.AE_GEN_AI_PLUGIN_ID = "sn_ae_gen_ai";
		this.SKILL_CONFIG_SYS_ID = "42bdcc7021d98210f877f506640a1d2d";
		this.gpm = gpm || GlidePluginManager;
		this.scu = scu || new sn_nowassist_admin.NowAssistSkillConfig();
	},
	isText2CatalogSetUp: function() {
		const isText2CatalogActive = this.gpm.isActive(this.TEXT_2_CATALOG_PLUGIN_ID);
		const isAEGenAIActive = this.gpm.isActive(this.AE_GEN_AI_PLUGIN_ID);
		const skillConfigActive = this.scu.isSkillConfigurationActive(this.SKILL_CONFIG_SYS_ID);
		const skillConfigEnabledInProduct = this.scu.isSkillConfigurationEnabledInProduct(this.SKILL_CONFIG_SYS_ID);
		const isText2CatalogSetUp = isText2CatalogActive && isAEGenAIActive && skillConfigActive && skillConfigEnabledInProduct;
		return isText2CatalogSetUp;
	},
	isUserNowAssistCreator: function() {
		return gs.hasRole('now.assist.creator');
	},
	getText2CatalogInfo: function() {
		return {
			isText2CatalogSetUp: this.isText2CatalogSetUp(),
			isUserNowAssistCreator: this.isUserNowAssistCreator()
		};
	},
	type: 'CreatorStudioGenAI'
};
