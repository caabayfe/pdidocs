function disableAIS() {
    var workspaceHandler = new AisMigrationWorkspaceHandler();
    workspaceHandler.disableAIS();
}

disableAIS();
if (!current.isActionAborted()) action.setRedirectURL(current);
