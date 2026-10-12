(function executeRule(current, previous /*null when async*/ ) {

    g_scratchpad.dynamicEvaluationEnabled = gs.getProperty("glide.list.actions_conditional_evaluation_enabled") === "true" || false;

})(current, previous);
