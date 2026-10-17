try {
    var diagramBuilderConfigGR = new GlideRecord("sn_diagram_builder_configuration");
    diagramBuilderConfigGR.addNullQuery('diagram_options');
    diagramBuilderConfigGR.query();

    diagramBuilderConfigGR.setValue("diagram_options", BuilderConfiguration.getDefaultDiagramOptions());
    diagramBuilderConfigGR.updateMultiple();
} catch (ex) {
    gs.error(ex);
}
