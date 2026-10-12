(function process( /*ResolverEnvironment*/ env) {

    var configId = env.getArguments().id;
    var currentApp = gs.getCurrentApplicationId();
    var sysAppGr = new GlideRecord('sys_app');
    sysAppGr.get(currentApp);

    var builderConfig = BuilderConfigurationService.getConfigurationByConfigId(configId);
    builderConfig.nodeDef = DiagramBuilderDiagramActionService.getDiagramBuilderDiagramActionsByConfigId(configId);
    builderConfig.categories = DiagramBuilderCategoryService.getDiagramBuilderRootCategoriesByConfigId(configId);
    builderConfig.appScope = sysAppGr.getValue('name');

    return builderConfig;

})(env);
