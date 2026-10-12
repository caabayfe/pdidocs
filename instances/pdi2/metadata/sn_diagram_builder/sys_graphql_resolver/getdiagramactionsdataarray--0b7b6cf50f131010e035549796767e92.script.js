(function process( /*ResolverEnvironment*/ env) {
    var diagramActionIds = env.getArguments().diagramActionIds;
    return DiagramBuilderDiagramActionApi.getDiagramActionsDataArray(diagramActionIds);
})(env);
