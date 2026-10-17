function onCondition() {
    if (g_form.getValue('applies_to') !== 'specific_type')
        return;

    if (g_form.isNewRecord())
        g_form.addInfoMessage(getMessage("Application for 'Specific Type' HTTP response header record and the type record you pick should be the same"));

    g_form.setMandatory('record_type', true);
    g_form.setMandatory('record_id', true);
    g_form.setMandatory('header_name', true);
    g_form.setMandatory('header_value', true);
    g_form.setReadOnly('record_type', false);
    g_form.setReadOnly('record_id', false);
    g_form.setReadOnly('header_name', false);
    g_form.setReadOnly('header_value', false);
    g_form.setReadOnly('add_by', false);
    g_form.setReadOnly('order', false);
    g_form.setReadOnly('description', false);
    g_form.setReadOnly('active', false);
}
