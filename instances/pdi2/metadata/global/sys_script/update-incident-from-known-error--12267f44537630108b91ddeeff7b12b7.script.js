(function executeRule(current, previous /*null when async*/ ) {
	var incidentGr = current.task.getRefRecord();
	var knownErrorGr = current.kb_knowledge.getRefRecord();
	var incidentUpdated = false;
	if (JSUtil.nil(incidentGr.problem_id) && JSUtil.notNil(knownErrorGr.source) && knownErrorGr.source.sys_class_name == "problem") {
		incidentGr.setValue('problem_id', knownErrorGr.source);
		incidentGr.update();
	}

})(current, previous);
