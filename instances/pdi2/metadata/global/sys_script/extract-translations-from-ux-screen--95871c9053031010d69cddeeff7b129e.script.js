(function executeRule(current, previous /*null when async*/) {
	current.required_translations = UxFrameworkScriptables.extractTranslations(current.macroponent_config);
})(current, previous);
