function enableAIS() {
    var workspaceHandler = new AisMigrationWorkspaceHandler();
    workspaceHandler.enableAIS();
}

enableAIS();
if (!current.isActionAborted()) action.setRedirectURL(current);
