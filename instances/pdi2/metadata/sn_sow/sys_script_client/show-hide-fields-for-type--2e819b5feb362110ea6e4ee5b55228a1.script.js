function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading) {
        return;
    }
    var type = g_form.getValue('type');
    // Hide everything at first and re-add as needed
    g_form.setDisplay('value', false);
    g_form.setDisplay('translated_text', false);
    g_form.setDisplay('ref_table', false);
    g_form.setDisplay('ref_doc', false);
    g_form.setDisplay('conditions', false);
    g_form.setDisplay('field_name', false);
    g_form.setDisplay('field_list', false);
    g_form.setDisplay('simple_name_values', false);


    if (type == 'constant' || type == 'json') {
        g_form.setDisplay('value', true);
    } else if (type == 'translated_text') {
        g_form.setDisplay('translated_text', true);
    } else if (type == 'par_visualization') {
        g_form.setValue('ref_table', 'par_visualization');
        g_form.setDisplay('ref_doc', true);
    } else if (type == 'condition') {
        g_form.setDisplay('ref_table', true);
        g_form.setDisplay('conditions', true);
    } else if (type == 'field_name') {
        g_form.setDisplay('ref_table', true);
        g_form.setDisplay('field_name', true);
    } else if (type == 'field_list') {
        g_form.setDisplay('ref_table', true);
        g_form.setDisplay('field_list', true);
    } else if (type == 'simple_name_values') {
        g_form.setDisplay('simple_name_values', true);
    }
}
