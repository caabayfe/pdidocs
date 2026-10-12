(function process(/*ResolverEnvironment*/ env) {

    return DiagramBuilderShapeTemplateService.getShapeTemplatesByIDs(env.getArguments().templateIds);

})(env);
