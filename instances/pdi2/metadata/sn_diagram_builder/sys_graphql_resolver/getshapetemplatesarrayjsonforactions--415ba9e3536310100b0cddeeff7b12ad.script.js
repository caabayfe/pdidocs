(function process( /*ResolverEnvironment*/ env) {
    var actionIds = env.getArguments().actionIds;
    var configId = env.getArguments().configId;
    return JSON.stringify(DiagramBuilderDiagramActionApi.getShapeTemplatesByActionIds(actionIds, configId));
})(env);
