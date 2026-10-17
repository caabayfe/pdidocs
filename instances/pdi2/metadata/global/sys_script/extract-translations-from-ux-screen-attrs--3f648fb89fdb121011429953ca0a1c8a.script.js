
(function executeRule(current, previous /*null when async*/ ) {
	current.required_translations = [];
	if (current.advanced_performance_settings) {
	    // Normalize non-breaking spaces and trim out any stray whitespace
        var advancePerfSettings = current.advanced_performance_settings
            .replace(/\u00A0/g, ' ')
            .trim();

		try {
			advancePerfSettings = JSON.parse(advancePerfSettings) || {};
		} catch (e) {
			gs.warn("Unable to parse Advanced performance settings", e);
			return;
		}
		if (advancePerfSettings.fullPageLoader && advancePerfSettings.fullPageLoader.label) {
			current.required_translations = UxFrameworkScriptables.extractTranslations(JSON.stringify(advancePerfSettings.fullPageLoader.label));
		}
	}
})(current, previous);
