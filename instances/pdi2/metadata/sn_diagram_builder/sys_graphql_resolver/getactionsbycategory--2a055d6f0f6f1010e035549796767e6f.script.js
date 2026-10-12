(function process( /*ResolverEnvironment*/ env) {
    var configId = env.getArguments().configId;
    var categoryId = env.getArguments().categoryId;
    return DiagramBuilderDiagramActionApi.getAllDiagramActionsForCategory(configId, categoryId);
})(env);
