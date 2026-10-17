(function process( /*ResolverEnvironment*/ env) {

    var instanceIds = env.getArguments().ids;
    var builderInstances = [];
    instanceIds.forEach((instanceId) => {
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
        builderInstances.push(builderInstance);
    });

    return builderInstances;

})(env);
