(function executeRule(current, previous /*null when async*/) {
	var configLanguageGr = new GlideRecord(AutoResolutionConstants.CONFIG_LANGUAGE_TABLE_NAME);
	configLanguageGr.addQuery("ml_solution_name", current.ml_solution_name);
	configLanguageGr.query();

	// For each configuration language with the same solution name, set all the version numbers to be the same
	while (configLanguageGr.next()) {
		if (configLanguageGr.latest_trained_version === current.latest_trained_version) {
			continue;
		}

		configLanguageGr.latest_trained_version = current.latest_trained_version;
		configLanguageGr.ml_status_last_updated = current.ml_status_last_updated;
		configLanguageGr.update();
	}
})(current, previous);
