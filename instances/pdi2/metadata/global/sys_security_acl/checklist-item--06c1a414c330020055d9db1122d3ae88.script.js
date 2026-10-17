answer = getChecklistItemAclAnswer();

function getChecklistItemAclAnswer() {
	if (current.checklist.nil())
		return true;

	var parentRecord = new GlideRecord('checklist');
	parentRecord.setWorkflow(false);
	if (!parentRecord.get(current.checklist)) {
		if (current.sys_created_by.equals(gs.getUserName()))
			return true;
		return false;
	}

	return parentRecord.canRead();
}
