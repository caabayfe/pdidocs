action.setRedirectURL(current);
if (!GlideSecurityManager.get().isScopeAdmin(current.target_scope) && !gs.hasRole('maint')) {
    current.setAbortAction(true);
    gs.addErrorMessage(gs.getMessage("Administration for {0} required", current.target_scope.name));
}
else 
    current.update();
