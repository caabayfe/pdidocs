action.setRedirectURL(current);
var sa = new ScopedAdministration();
var scopeAdminRoles = sa.getScopeAdminRolesArray(current);
	
if (scopeAdminRoles.length == 0) {
	var preface = gs.getMessage("Application Administration uses the 'Application Administrator' role to define what users are application administrators.");

	gs.addErrorMessage(preface + " " + gs.getMessage("None of the roles defined by this application have 'Application Administrator' enabled."));
} else
	sa.addScopeAdminRolesToAdminContains(current);
