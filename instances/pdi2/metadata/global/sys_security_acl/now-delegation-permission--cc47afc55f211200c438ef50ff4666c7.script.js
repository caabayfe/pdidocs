answer = hasAccess();

function hasAccess() {
	if (GlideController.getGlobal("permission_service_permissions_list") == true)
		return true;
	
	var scopeID = GlideController.getGlobal("permission_service_scope_id");
	var isScopedAdministrationEnabled = false;
	if ((''+scopeID).indexOf("NOT_FOUND") == -1)
		isScopedAdministrationEnabled = new ScopedAdministration().isScopedAdministrationOn(scopeID);
	
	if (isScopedAdministrationEnabled)
		return GlideSecurityManager.get().isScopeAdmin(scopeID);
	else
		return gs.hasRole('admin');
}
