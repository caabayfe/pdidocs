(function process( /*ResolverEnvironment*/ env) {
    // Check table level access
    if (!GlideSecurityManager.get().hasRightsTo(`record/${PADConstants.TABLES.PD_PANEL_OVERRIDE}/read`, null)) {
        return PADConstants.UnauthorizedError;
    }

    try {
        return new PDPanelOverrideService().getPanelOverrides(
            env.getArguments().processTypeId
        );

    } catch (err) {
        return [{
            errorType: 'QUERY_FAILED',
            message: err
        }];
    }
})(env);
