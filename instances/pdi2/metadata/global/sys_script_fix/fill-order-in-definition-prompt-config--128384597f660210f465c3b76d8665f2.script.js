gs.info(sn_i18n.Message.getMessage("one_extend", "Started executing fix script: Fill order in definition & prompt_config"));

// Populate order field for existing genAIPromptConfigs(sys_generative_ai_prompt_config) records.
var genAIPromptConfigGr = new GlideRecord("sys_generative_ai_prompt_config");
genAIPromptConfigGr.query();
genAIPromptConfigGr.addNullQuery('order');
genAIPromptConfigGr.setValue('order', 0);
genAIPromptConfigGr.updateMultiple();

gs.info(sn_i18n.Message.getMessage("one_extend", "Successfully populated order field for existing GenAIPromptConfig records"));

// Populate order field for existing capabilityDefinition(sys_one_extend_capability_definition) records.

var capabilityDefinitionGr = new GlideRecord("sys_one_extend_capability_definition");
capabilityDefinitionGr.query();
capabilityDefinitionGr.addNullQuery('order');
capabilityDefinitionGr.setValue('order', 0);
capabilityDefinitionGr.updateMultiple();

gs.info(sn_i18n.Message.getMessage("one_extend", "Successfully populated order field for existing CapabilityDefinition records"));

gs.info(sn_i18n.Message.getMessage("one_extend", "Successfully completed executing fix script: Fill order in definition & prompt_config"));
