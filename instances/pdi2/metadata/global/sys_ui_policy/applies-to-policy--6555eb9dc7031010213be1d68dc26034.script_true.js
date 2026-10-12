function onCondition() {
    if (g_form.getValue('applies_to') !== 'all_pages')
        return;

    if (g_form.getValue('sys_scope') === 'global' && g_scratchpad.isSecurityAdmin) {
        g_form.addInfoMessage(getMessage("'All Pages' HTTP response header is an instance wide configuration that will effect most pages. Specific type with headers configured may override or ignore this header configuration"));
        return;
    }

    if (!g_scratchpad.isSecurityAdmin)
        g_form.addErrorMessage(getMessage("'All Pages' HTTP response header can only be configured by user who has privileged access"));

    if (g_form.getValue('sys_scope') !== 'global')
        g_form.addErrorMessage(getMessage("'All Pages' HTTP response header can only be configured in 'Global' application"));

    g_form.setMandatory('record_type', false);
    g_form.setMandatory('record_id', false);
    g_form.setMandatory('header_name', false);
    g_form.setMandatory('header_value', false);
    g_form.setReadOnly('record_type', true);
    g_form.setReadOnly('record_id', true);
    g_form.setReadOnly('header_name', true);
    g_form.setReadOnly('header_value', true);
    g_form.setReadOnly('add_by', true);
    g_form.setReadOnly('order', true);
    g_form.setReadOnly('description', true);
    g_form.setReadOnly('active', true);
}
