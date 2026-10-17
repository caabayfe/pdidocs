(function process( /*ResolverEnvironment*/ env) {
    var actionId = env.getArguments().actionId;
    return JSON.stringify(DiagramBuilderDiagramActionApi.getShapeTemplateByActionId(actionId));
})(env);
