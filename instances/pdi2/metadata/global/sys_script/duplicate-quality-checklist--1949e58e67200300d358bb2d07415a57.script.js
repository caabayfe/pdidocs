(function executeRule(current, previous /*null when async*/) {

	if(current.operation() == "update" && !current.name.changes())
		return;	
	var QualityChecklist = new GlideRecord('kb_quality_checklist');
	QualityChecklist.addQuery('name', current.name);
	QualityChecklist.addQuery('sys_id', '!=', current.getUniqueValue());
	QualityChecklist.query();


	if(QualityChecklist.hasNext()){
		gs.addErrorMessage(gs.getMessage('An AQI Checklist called \'{0}\' already exists.', [current.name]));
		current.setAbortAction(true);
	}


})(current, previous);
