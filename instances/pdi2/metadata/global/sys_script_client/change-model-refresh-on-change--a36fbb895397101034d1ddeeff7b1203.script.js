function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    // Make an ajax request for the model information, apply record presets, initial state etc.
    if (isLoading && !g_form.isNewRecord())
        return;

    var ga = new GlideAjax('ChangeModelAJAXProcessor');
    ga.addParam("sysparm_name", "getModel");
    ga.addParam("sysparm_table", g_form.getTableName());
    ga.addParam("sysparm_change_sys_id", g_form.getUniqueValue());
    ga.addParam("sysparm_model_sys_id", g_form.getValue("chg_model"));
    ga.addParam("sysparm_model_on_form", g_form.hasField("chg_model"));
    ga.addParam("sysparm_change_type", g_form.getValue("type"));
    ga.addParam("sysparm_template_sys_id", g_form.getValue("chg_model_template"));
    ga.getXML(updateScratchpad);

    function updateScratchpad(response) {
        var answer = response.responseXML.documentElement.getAttribute("answer");
        var refreshedElements = JSON.parse(answer);

        g_scratchpad.change_model.refreshReadOnlyFields(false);
        g_scratchpad.change_model.refreshModel(refreshedElements);
        g_scratchpad.change_model.updateStates(true);
        g_scratchpad.change_model.updatePresets();
        g_scratchpad.change_model.refreshReadOnlyFields(true);
    }
}
