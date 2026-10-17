(function process( /*ResolverEnvironment*/ env) {
    try {
        return new PDActivityDefinitionService().getActivityDefinitions();
    } catch (error) {
        return [{
            errorType: 'QUERY_FAILED',
            message: error
        }];
    }

})(env);
