(function process( /*ResolverEnvironment*/ env) {
    var padUtils = new global.PADUtilsSI();
    if (padUtils.isPADAuthorizedUser() || padUtils.userIsPADDelegatedDev()) {
        return global.PDUtils.isPlaybookGenerationEnabledForUser();
    }
})(env);
