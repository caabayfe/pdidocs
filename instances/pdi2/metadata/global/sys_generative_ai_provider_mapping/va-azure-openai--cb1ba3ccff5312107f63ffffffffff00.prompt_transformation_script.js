(function(promptObj, configGrSysId, payload, promptTemplateRole, childPrompts, capabilityId) {
	/*
		Create Azure OpenAI Chat completions request format for VA Implementation.
	*/
    return new sn_generative_ai.ChatCompletionsTextGenerationPromptTransformationUtil().transformPrompt(promptObj, configGrSysId, payload, promptTemplateRole, childPrompts);
})(promptObj, configGrSysId, payload, promptTemplateRole, childPrompts, capabilityId);
