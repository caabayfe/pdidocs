answer = getChecklistTemplateAclAnswer();

function getChecklistTemplateAclAnswer() {
	if (current.sys_created_by.equals(gs.getUserName()))
		return true;
	return false;
}
