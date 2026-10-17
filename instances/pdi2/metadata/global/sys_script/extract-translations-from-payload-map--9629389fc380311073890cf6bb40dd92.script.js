(function executeRule(current, previous /*null when async*/) {
	var extractor = new DeclarativeActionTranslationExtractor();
	var previousRequiredTranslations = previous ? previous.required_translations : "[]";
	var translationsArray = extractor.getTranslations(current.payload_map, current.sys_scope.scope.toString(), previousRequiredTranslations);
	if(translationsArray.length > 0) {
		current.required_translations = JSON.stringify(translationsArray);
	} else {
		current.required_translations = '';
	}
})(current, previous);
