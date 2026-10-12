(function process( /*ResolverEnvironment*/ env) {
	if (GlidePluginManager.isUpgradeSystemBusy()) {
		return PADConstants.UpgradeError;
	}

    var gr = new GlideRecord(PADConstants.TABLES.PD_PROCESS_DEFINITION);
    if (!gr.canDelete()) {
        return PADConstants.UnauthorizedError;
    }

    var pdProcessService = new PDProcessService();

    try {
        var response = pdProcessService.deleteProcess(env.getArguments());
        return response;
    } catch (err) {
        return {
            errorType: 'PROCESS_DELETION_FAILED',
            message: err
        };
    }
})(env);
