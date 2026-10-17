(function process( /*ResolverEnvironment*/ env) {
    var instanceId = env.getArguments().instanceId;
    var builderInstance = DiagramBuilderInstanceService.getInstanceByInstanceId(instanceId);
    var configId = builderInstance.builderConfiguration;
    return DiagramBuilderDiagramActionService.getDiagramBuilderDiagramActionsByConfigId(configId);
})(env);
