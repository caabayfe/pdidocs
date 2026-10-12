gs.disableSessionScopeDebug(current.scope);
var currentName = GlideStringUtil.escapeHTML(current.name);
var msg = "Session Debugging for " + currentName;
if (gs.isSessionScopeDebugging(current.scope)) {
	gs.addErrorMessage(gs.getMessage("Unable to disable session scope debugging for {0}", currentName));
} else {
	gs.addInfoMessage(gs.getMessage("Disabled session scope debugging for {0}", currentName));
}
action.setRedirectURL(current);		
