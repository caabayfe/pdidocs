try {
    var diagramBuilderConfigGR = new GlideRecord("sn_diagram_builder_configuration");
    diagramBuilderConfigGR.addEncodedQuery('advanced=true');
    diagramBuilderConfigGR.query();
    var isUpdateRequired = false;
    while (diagramBuilderConfigGR.next()) {
        var props = JSON.parse(diagramBuilderConfigGR.getValue("props"));
        if (!props.hasOwnProperty("recenterThresholdPercentage")) {
            props["recenterThresholdPercentage"] = 100;
            isUpdateRequired = true;
        }
        if (!props.hasOwnProperty("additionalNodeProps")) {
            props["additionalNodeProps"] = [];
            isUpdateRequired = true;
        }
        if (!props.hasOwnProperty("additionalEdgeProps")) {
            props["additionalEdgeProps"] = [];
            isUpdateRequired = true;
        }

        if (isUpdateRequired) {
            diagramBuilderConfigGR.setValue("props", JSON.stringify(props));
            diagramBuilderConfigGR.update();
        }
    }
} catch (ex) {
    gs.error(ex);
}
