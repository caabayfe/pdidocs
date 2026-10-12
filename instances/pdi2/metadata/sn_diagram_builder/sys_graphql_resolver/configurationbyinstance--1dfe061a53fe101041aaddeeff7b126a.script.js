(function process( /*ResolverEnvironment*/ env) {

    var instanceId = env.getArguments().id;
    var builderInstance = DiagramBuilderInstanceService.getInstanceByInstanceId(instanceId);

    var configId = builderInstance.builderConfiguration;
    var builderConfig = BuilderConfigurationService.getConfigurationByConfigId(configId);
    builderConfig.nodeDef = DiagramBuilderDiagramActionService.getDiagramBuilderDiagramActionsByConfigId(configId);
    builderConfig.categories = DiagramBuilderCategoryService.getDiagramBuilderRootCategoriesByConfigId(configId);
    builderConfig.diagramTemplate = DiagramBuilderDiagramTemplateService.getTemplateJSON(builderConfig.templateId);
    builderConfig.appScope = builderInstance.scopeName;
    builderConfig.actions = DiagramBuilderCanvasActionService.getActionsByConfigId(configId, instanceId);
    if (builderInstance.scopeId != gs.getCurrentApplicationId()) {
        builderInstance.readOnly = true;
    }

    builderInstance.configuration = builderConfig;
    return builderInstance;

})(env);
