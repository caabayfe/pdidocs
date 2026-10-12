function evaluateProperty({
    api,
    helpers
}) {
    const externalControllerDependenciesNameMap = {};
    const externalControllerDependenciesOuputPropMappings = (api.elements.builder_core.mcpModel.macroponent.extControllerDep ?? []).reduce((acc, dependency) => {
        const controllerDefinition = api.elements.builder_core.controllerDefinitions[dependency.controllerSysId];
        if (controllerDefinition) {
            acc[dependency.name] = {};
            externalControllerDependenciesNameMap[dependency.name] = dependency.label;
            Object.keys(controllerDefinition.macroponent.outputPropMapping).forEach((key) => {
                acc[dependency.name][key] = null;
            });
        }
        return acc;
    }, {});

    const updatedResolvedContext = {...api.elements.builder_core.resolvedContext.outputs.page};
    updatedResolvedContext.context.props = api.elements.builder_core.resolvedContext.inputs.page.props;
    delete updatedResolvedContext.outputPropMappings;
    delete updatedResolvedContext.context.app;

    return {
        ...updatedResolvedContext,
        elementAndDataResourceNameMaps: {
            dataResources: {
                ...updatedResolvedContext.elementAndDataResourceNameMaps.dataResources,
                ...externalControllerDependenciesNameMap
            }
        },
        data: {
            ...updatedResolvedContext.data,
            ...externalControllerDependenciesOuputPropMappings
        }
    };
}
