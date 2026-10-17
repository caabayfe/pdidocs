(function process( /*ResolverEnvironment*/ env) {
    var shapeTemplateIds = env.getArguments().templateIds;
    return JSON.stringify(DiagramBuilderShapeTemplateApi.getShapeTemplatesJson(shapeTemplateIds));
})(env);
