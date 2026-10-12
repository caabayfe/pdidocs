(function process( /*ResolverEnvironment*/ env) {
    var configId = env.getArguments().configId;
    var searchTerm = env.getArguments().searchTerm;
    var categorySysIds = [];
    var actions = DiagramBuilderDiagramActionApi.getAllDiagramActionsForSearchTerm(configId, searchTerm) || [];
    actions.forEach(function(action) {
        categorySysIds.push(action.categoryId);
    });

    var categories = DiagramBuilderCategoryService.getDiagramBuilderRootCategories(categorySysIds);

    return {
        actions: actions,
        categories: categories
    };

})(env);
