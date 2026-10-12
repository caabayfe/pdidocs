function transform(input) {
    const diagramActionArray = input?.graphqlData?.data?.snDiagramBuilder?.BuilderQueries?.getDiagramActionsByInstanceId;

    const paletteJson = Array.isArray(diagramActionArray) && diagramActionArray.length ?
        new DiagramBuilderPaletteUtils().buildPaletteJSON(diagramActionArray) : [];

    return paletteJson;
}
