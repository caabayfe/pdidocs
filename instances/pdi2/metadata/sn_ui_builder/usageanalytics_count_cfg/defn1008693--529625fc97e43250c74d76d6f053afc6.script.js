function getMultiControllerPresetsCount() {
    var gr = new GlideRecord('sys_ux_component_preset');
    gr.addNullQuery('controller');
    gr.addNotNullQuery('controller_dependencies');
    gr.query();

    var multiControllerPresetsCount = 0;
    while (gr.next()) {
        var controllerDependencies = gr.getValue('controller_dependencies');
        try {
            var dependenciesArray = JSON.parse(controllerDependencies);
            dependenciesArray.length > 1 && multiControllerPresetsCount++;
        } catch (err) {}
    }
    return multiControllerPresetsCount;
}

answer = getMultiControllerPresetsCount();
