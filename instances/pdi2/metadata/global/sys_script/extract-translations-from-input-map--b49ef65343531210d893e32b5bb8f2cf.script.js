(function executeRule(current, previous /*null when async*/) {
	var extractor = new DeclarativeActionTranslationExtractor();
	var previousRequiredTranslations = previous ? previous.required_translations : "[]";
	var regex = /translate\((\\"|'|")(.+?)\1\);?\s*/g;

	var inputMap = current.getValue("interaction_input_map");
	var translationCalls = inputMap.match(regex);

	var translationsArray = extractor.getTranslationsFromArray(translationCalls, current.sys_scope.scope.toString(), previousRequiredTranslations);
	if(translationsArray.length > 0) {
		current.required_translations = JSON.stringify(translationsArray);
	} else {
		current.required_translations = '';
	}
})(current, previous);
