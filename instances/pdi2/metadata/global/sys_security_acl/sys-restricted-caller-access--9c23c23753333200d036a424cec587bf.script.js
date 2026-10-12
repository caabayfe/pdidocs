if (current.isNewRecord())
	answer = gs.isScopeAdminForAnyApp() || gs.hasRole("admin");
else {
	answer = GlideSecurityManager.get().isScopeAdmin(current.target_scope);

	if (answer && current.getValue('target_scope') == 'global')
		answer = !new global.GRCASignatureUtils().hasSignatureRecord(current);
}
