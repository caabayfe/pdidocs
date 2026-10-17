function refreshAIS() {
    var workspaceHandler = new AisMigrationWorkspaceHandler();
    workspaceHandler.enableAIS();
}

refreshAIS();
if (!current.isActionAborted()) action.setRedirectURL(current);
