function onCondition() {
    // show advanced field
    g_form.setDisplay('advanced', true);
    if (g_scratchpad.acl_advanced != null && g_scratchpad.acl_advanced !== 'undefined') {
        g_form.setValue('advanced', g_scratchpad.acl_advanced);
    }
}
