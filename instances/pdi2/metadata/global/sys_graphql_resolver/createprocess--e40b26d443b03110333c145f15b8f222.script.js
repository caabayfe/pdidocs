(function process( /*ResolverEnvironment*/ env) {
	if (GlidePluginManager.isUpgradeSystemBusy()) {
		return PADConstants.UpgradeError;
	}

    var gr = new GlideRecord(PADConstants.TABLES.PD_PROCESS_DEFINITION);
    if (!gr.canCreate()) {
        return PADConstants.UnauthorizedError;
    }

    var pdProcessService = new PDProcessService();

    try {
        var response = pdProcessService.createProcess(env.getArguments());
        return response;
    } catch (err) {
        return {
            errorType: 'MUTATION_FAILED',
            message: err
        };
    }
})(env);
