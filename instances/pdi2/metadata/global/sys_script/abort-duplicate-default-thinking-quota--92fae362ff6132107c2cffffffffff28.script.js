(function executeRule(current, previous /*null when async*/ ) {
    if (current.ai_model_config) {
        var featureMappingGr = new GlideRecord('sys_gen_ai_model_thinking_quota_config');
        featureMappingGr.addQuery('ai_model_config', current.ai_model_config);
        featureMappingGr.addQuery('default', true);
        featureMappingGr.query();
        // If a record with the same ai_model_config already exists which is already a default tier, abort the action
        if (featureMappingGr.hasNext()) {
            gs.addErrorMessage(gs.getMessage("Duplicate default Thinking Quota with same model not allowed"));
            current.setAbortAction(true);
        }
    }

})(current, previous);
