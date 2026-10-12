(function process( /*ResolverEnvironment*/ env) {
    var diagramActionId = env.getArguments().diagramActionId;
    return DiagramBuilderDiagramActionApi.getDiagramActionDataById(diagramActionId);
})(env);
