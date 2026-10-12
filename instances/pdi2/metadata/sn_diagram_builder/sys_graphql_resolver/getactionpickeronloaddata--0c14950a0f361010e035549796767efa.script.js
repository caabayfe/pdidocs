(function process( /*ResolverEnvironment*/ env) {
    var configurationId = env.getArguments().configId;

    var categories = DiagramBuilderCategoryService.getDiagramBuilderRootCategoriesByConfigId(configurationId);
    var selectedCategory = categories[0];
    var actions = DiagramBuilderDiagramActionApi.getAllDiagramActionsForCategory(configurationId, selectedCategory.sysId);
    return {
        "categories": categories,
        "actions": actions
    };
})(env);
