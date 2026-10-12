(function process( /*ResolverEnvironment*/ env) {
    // Check table level access
    if (!GlideSecurityManager.get().hasRightsTo(`record/${PADConstants.TABLES.PD_PROCESS_DEFINITION}/read`, null)) {
        return PADConstants.UnauthorizedError;
    }

    var pdProcessService = new PDProcessService();

    try {
        var response = pdProcessService.getUnsupportedFeatures(env.getArguments());
        return response;
    } catch (err) {
        return {
            errorType: 'QUERY_FAILED',
            message: err
        };
    }
})(env);
