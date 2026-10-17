// Make sure our user access role is associated with our menu
var menuRoles = current.menu.roles.toString();
var roleName = current.user_role.getDisplayValue();

if (menuRoles.indexOf(roleName) === -1) {
	if (menuRoles != "")
		menuRoles += ",";
	
	menuRoles += roleName;
	var menuRecord = new GlideRecord("sys_app_application");
	menuRecord.addQuery("sys_id", current.menu)
	menuRecord.query();
	if (menuRecord.next()) {
		menuRecord.roles = menuRoles;
		menuRecord.updateWithReferences();
	}
}
