(function executeRule(current, previous /*null when async*/) {
	// The only runtime translation needed from inputs are default values.
	// The label and description are removed to prevent the these values
	// from also being included as required translations by the extractor.
	var mappedInputs = [];
	var inputs = JSON.parse(current.inputs || '[]');
	for (var inputIdx in inputs) {
		var input = inputs[inputIdx];
		input.fieldType = input.type;
		delete input.label;
		delete input.description;
		mappedInputs.push(input);
	}

	var stepInputs = {};
	var steps = JSON.parse(current.steps || '{}');
	for (var stepId in steps) {
		var step = steps[stepId];
		stepInputs[stepId] = step.inputs;
	}

	var runtimeData = {
		inputs: mappedInputs,
		stepInputs: stepInputs,
	};

	current.required_translations = UxFrameworkScriptables.extractArtifactTranslations(JSON.stringify(runtimeData));
	
	// extractArtifactTranslations supports DefaultValueExtractor
	var required_builder_translations = UxFrameworkScriptables.extractArtifactTranslations(current.inputs);

	// hydrating translations with "code" value
	current.required_builder_translations = (new global.InteractionTranslationUtils()).hydrateWithCode(required_builder_translations, current.sys_scope.scope);
})(current, previous);
