function transform(input) {
    var transformObj = {
        "diagramJSON": JSON.parse(input.instanceData.data.snDiagramBuilder.BuilderQueries.getInstanceById.diagramJSON),
        "builderConfig": input.instanceData.data.snDiagramBuilder.BuilderQueries.getInstanceById.configuration
    };
    return transformObj;
}
