(function executeRule(current, previous /*null when async*/) {

	// Remove all translated versions of an article when it is removed from the topic
	if (GlidePluginManager.isActive('com.glideapp.knowledge.i18n2')) {
		new KBContentTranslationUtil().removeTranslatedVersionsFromTopic(current);
	}

})(current, previous);
