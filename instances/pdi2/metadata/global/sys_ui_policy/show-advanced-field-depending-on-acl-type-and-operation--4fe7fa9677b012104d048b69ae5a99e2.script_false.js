function onCondition() {
    // hide advanced field
    g_form.setDisplay('advanced', false);
    g_scratchpad.acl_advanced = g_form.getValue('advanced');
    g_form.setValue('advanced', false);
}
