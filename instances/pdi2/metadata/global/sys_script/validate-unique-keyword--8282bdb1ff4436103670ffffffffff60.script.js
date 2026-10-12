(function executeRule(current, previous /*null when async*/) {

	var keyword = current.keyword;
	if(keyword == 'null') {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("Cannot save the record. {0} is not a valid keyword.", keyword));
	}
	var questionGr = new GlideRecord(current.getTableName());
	questionGr.addQuery('keyword', keyword);
	// For updates, exclude the current record from the check
	if (current.operation() == 'update') {
		questionGr.addQuery('sys_id', '!=', current.sys_id);
	}
	questionGr.query();
	if(questionGr.hasNext()) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("Cannot save the record. Keyword {0} is already in use. Please choose a unique keyword.", keyword));

	}

})(current, previous);
