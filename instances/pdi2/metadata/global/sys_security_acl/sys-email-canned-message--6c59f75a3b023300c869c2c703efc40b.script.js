(function() {
	if (!GlideSecurityManager.get().hasRightsTo("processor/EmailClientProcessor/execute", null))
		return false;

	var user = current.getValue('user');
	var group = current.getValue('group');

	if (!user && !group)
		return true;

	if (user && user == gs.getUserID())
		return true;

	if (group && gs.getUser().isMemberOf(group))
		return true;

	return false;
})();
