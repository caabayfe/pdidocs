gs.enableSessionScopeDebug(current.scope);
var currentName = GlideStringUtil.escapeHTML(current.name);
if (gs.isSessionScopeDebugging(current.scope)) {
	gs.addInfoMessage(gs.getMessage("Enabled session scope debugging for {0}", currentName));
} else {
	gs.addErrorMessage(gs.getMessage("Unable to enable session scope debugging for {0}", currentName));
}
action.setRedirectURL(current);
		
