function hasAccess() {
	var codeTaskGr = new GlideRecord("automation_error_code_task");
	codeTaskGr.addQuery('code', current.error_code+'');
	codeTaskGr.addActiveQuery();
	codeTaskGr.query();

	if (!codeTaskGr.next())
		return false;

	var errCodeTask = codeTaskGr.code_task.getRefRecord();
	return errCodeTask.getValue('assigned_to') == gs.getUserID();
}

answer = hasAccess();
