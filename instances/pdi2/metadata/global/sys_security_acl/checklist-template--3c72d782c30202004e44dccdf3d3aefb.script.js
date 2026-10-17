answer = (function() {
	if (current.sys_created_by.equals(gs.getUserName()))
		return true;

	if (gs.getUser().isMemberOf(current.getValue('group')))
		return true;

	return false;
}());
