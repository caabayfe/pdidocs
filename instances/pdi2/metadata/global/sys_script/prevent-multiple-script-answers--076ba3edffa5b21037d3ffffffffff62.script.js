(function executeRule(current, previous /*null when async*/) {

	var questionSysId = current.question;
	var mapGr = new GlideRecord(current.getTableName());
	mapGr.addQuery("question", questionSysId);
	if(current.answer.script_configuration == '') {
		mapGr.addQuery("answer.script_configuration", "!=", '');
	}
	if(current.operation() == 'update') {
		mapGr.addQuery('sys_id', '!=', current.sys_id);
	}
	mapGr.query();
	if(mapGr.hasNext()) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage('Cannot save the record. An answer is already mapped to this question. Only one script answer can be mapped to a question.'));
	}

})(current, previous);
