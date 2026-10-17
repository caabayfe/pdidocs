gs.info(sn_i18n.Message.getMessage("one_extend", "Started executing fix script: Fill filter_type  for ai_prompt_config"));

// Populate filter_type field for existing genAIPromptConfigs(sys_generative_ai_prompt_config) records.
var genAIPromptConfigGr = new GlideRecord("sys_generative_ai_prompt_config");
genAIPromptConfigGr.query();
genAIPromptConfigGr.addNullQuery('filter_type');
genAIPromptConfigGr.setValue('filter_type', 'default');
genAIPromptConfigGr.updateMultiple();

gs.info(sn_i18n.Message.getMessage("one_extend", "Successfully completed executing fix script: Fill filter_type  for ai_prompt_config"));
