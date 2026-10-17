action.setRedirectURL(current);
var sa = new global.ScopedAdministration();
var scopeAdminRoles = sa.getScopeAdminRolesArray(current);
	
if (scopeAdminRoles.length == 0) {
	var preface = gs.getMessage("Scoped administration uses the 'Assignable by' roles referenced by the application's roles in order to determine what users are scope administrator.");

	gs.addErrorMessage(preface + " " + gs.getMessage("None of the roles defined by this application have an 'Assignable by' set yet."));
} else
	sa.addScopeAdminRolesToAdminContains(current);
