getGrantableRoles();

function getGrantableRoles() {
	if (lookup.getElement("grantable") != null)
		lookup.addQuery('grantable', true);
}
