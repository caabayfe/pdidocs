if (current.isNewRecord())
	answer = gs.isScopeAdminForAnyApp() || gs.hasRole("admin");
else
	answer = GlideSecurityManager.get().isScopeAdmin(current.target_scope);
