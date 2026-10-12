(function executeRule(current, previous /*null when async*/ ) {

    var triggerRunnerMappingGR = new GlideRecord("sys_trigger_runner_mapping");
    if (triggerRunnerMappingGR.get("identifier", current.getUniqueValue()))
        triggerRunnerMappingGR.deleteRecord();

})(current, previous);
