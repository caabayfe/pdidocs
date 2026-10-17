(function process( /*ResolverEnvironment*/ env) {
    var shapeTemplateId = env.getArguments().templateId;
    return JSON.stringify(DiagramBuilderShapeTemplateApi.getShapeTemplateJson(shapeTemplateId, []));
})(env);
