(function executeRule(current, previous /*null when async*/) {
    
	var parsedInputDefinitions = JSON.parse(current.input_definitions) || [];
	var parsedEvents = JSON.parse(current.events) || [];

	var dataToTranslate = JSON.stringify(
		parsedInputDefinitions.concat(parsedEvents)
	);
	
	var required_builder_translations = UxFrameworkScriptables.extractArtifactTranslations(dataToTranslate);

	// hydrating translations with "code" value
	current.required_builder_translations = (new global.InteractionTranslationUtils()).hydrateWithCode(required_builder_translations, current.sys_scope.scope);
})(current, previous);
