function onCondition() {
    var fieldName = 'dynamic_value_field';
    g_form.setDisplay('dynamic_value_field', true);
    g_form.setDisplay('dynamic_value_field.reference', true);
    if (g_form.getValue('dynamic_value_field'))
        g_form.setDisplay('dynamic_value_dot_walk_path', true);

    if (g_form.getControl(fieldName)) {
        var tabIndex = g_tabs2Sections.findTabIndex(fieldName);
        if (tabIndex > -1)
            g_tabs2Sections.showTab(tabIndex);
    }
}
