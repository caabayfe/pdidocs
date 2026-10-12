(function executeRule(current, previous /*null when async*/) {
	//Automatically add translated versions of connected Kb article
	if (GlidePluginManager.isActive('com.glideapp.knowledge.i18n2')) {
		new sn_ex_sp.KBContentTranslationUtil().addTranslatedVersionsToTopic(current);
	}
})(current, previous);
