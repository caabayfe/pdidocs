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

}
