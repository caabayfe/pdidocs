
(function(context, pageParams, blockcontext){
	// return some_output
	var resourceList = NAASkillConfigUtil.getHelpfulResourceForPlugins();
	return {
		resources: resourceList,
		settingsTranslated: sn_i18n.Message.getMessage("sn_nowassist_admin", "Settings"),
		pluginsTranslated: sn_i18n.Message.getMessage("sn_nowassist_admin", "Plugins")
	};

})(context, pageParams, blockcontext);
