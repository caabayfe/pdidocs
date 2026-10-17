try {
    var diagramBuilderConfigGR = new GlideRecord("sn_diagram_builder_configuration");
    diagramBuilderConfigGR.query();
    diagramBuilderConfigGR.setValue("enable_search", true);
    diagramBuilderConfigGR.updateMultiple();
} catch (ex) {
    gs.error(ex);
}
