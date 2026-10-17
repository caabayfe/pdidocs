(function process( /*ResolverEnvironment*/ env) {
    var nodeTypeIds = env.getArguments().nodeTypeIds;
    return JSON.stringify(DiagramBuilderNodeTypeApi.getShapeTemplatesByNodeTypeIds(nodeTypeIds));
})(env);
