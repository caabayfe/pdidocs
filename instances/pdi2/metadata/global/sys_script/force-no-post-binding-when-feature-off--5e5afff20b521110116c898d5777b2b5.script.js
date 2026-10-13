(function executeRule(current, previous /*null when async*/ ) {
    if (!current) return;


    // On insert, if the feature is disabled then set the run after binding to false
    var eventRuleUtil = new EventRuleUtil();

    var isRunAfterBindingEnabled = eventRuleUtil.isFieldMappingRunAfterBindingEnabled();
    if (!isRunAfterBindingEnabled) {
        current.setValue('run_after_binding', '0');
        return;
    }

})(current, previous);
