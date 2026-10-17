(function executeRule(current, previous /*null when async*/ ) {
	
    var s = new SchedulerScriptFactory().getSchedulerScript();
    s.propagateRATriggersForNode(current);
	
})(current, previous);
