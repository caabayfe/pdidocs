function handleSubmit() {
    var workspaceHandler = new AisMigrationWorkspaceHandler();
    var utils = new AISMigrationUtils();
    var canEnableAIS = utils.canEnableAIS();

    if ('true' == gs.getProperty('glide.ui.polaris.ais_ready', 'false') && !canEnableAIS)
        workspaceHandler.disableAIS();
    else if ('true' == gs.getProperty('glide.ui.polaris.ais_ready', 'false') && canEnableAIS)
        workspaceHandler.enableAIS();
    else
        workspaceHandler.enableAIS();
}

handleSubmit();
