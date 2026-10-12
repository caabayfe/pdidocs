function onLoad() {
    //Type appropriate comment here, and begin script below
    g_form.setDisplay("model_id", false);
    g_form.setDisplay("action_type.model_table", false);
    g_form.setDisplay("action_type.table_name", false);

    if (g_form.getValue("action") == '') {
        g_form.setSectionDisplay('action_inputs', false);
    } else {
        if (g_form.getValue("action_type.table_name") == 'ga_decision_tree') {
            g_form.setSectionDisplay('action_inputs', false);
        } else
            g_form.setSectionDisplay('action_inputs', true);
    }
    if (g_form.getValue("resource_generator") != '')
        g_form.getReference('resource_generator', hideFields);

    function hideFields(resourceGenerator) {
        if (resourceGenerator.getValue("generator_type") == "476f19bd53143110f67eddeeff7b1209") {
            g_form.setMandatory("action", false);
            g_form.setMandatory("action_type", false);
            g_form.setMandatory("recommendation_hint", false);
            g_form.setDisplay("recommendation_hint", false);
            g_form.setDisplay("action", false);
            g_form.setDisplay("action_type", false);
            g_form.setSectionDisplay("action_inputs", false);
        }
    }

}
