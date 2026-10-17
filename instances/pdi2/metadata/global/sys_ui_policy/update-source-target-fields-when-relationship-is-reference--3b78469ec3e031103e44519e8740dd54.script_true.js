function onCondition() {
    var child_source = g_form.getValue('source_type');
    var parent = g_form.getReference('parent_entity');
    var parent_source = parent.source_type;
    if (child_source == 'EXTERNAL_DATA') {
        if (parent_source != 'EXTERNAL_DATA') {
            g_form.setValue('source_field', 'u_case_id');
        }
    } else {
        g_form.setValue('source_field', 'sys_id');
    }
}
