answer = getChecklistAclAnswer();

function getChecklistAclAnswer() {
	if (current.table.nil())
		return true;

	var tableName = current.table;
	var parentRecord = new GlideRecord(tableName);

	parentRecord.setWorkflow(false);
	if (!parentRecord.get(current.document)) {
		if (current.sys_created_by.equals(gs.getUserName()))
			return true;
		return false;
	}

	return parentRecord.canWrite();
}
