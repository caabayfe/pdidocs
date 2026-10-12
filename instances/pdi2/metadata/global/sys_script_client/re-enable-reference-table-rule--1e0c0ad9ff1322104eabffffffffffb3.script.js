function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading)
        return;
    if (g_form.isNewRecord())
        g_form.setReadOnly('table_archive_rule', false);
    g_form.clearValue('table_archive_rule');
    if (g_form.getValue('reference') === '') {
        g_form.addInfoMessage(getMessage('Select a Reference first to display any available Reference table rules.'));
        g_form.clearValue('table');
        g_form.clearValue('element');
    }
    else {
        var referenceNameStr = g_form.getValue('reference').toString();
        var parts = referenceNameStr.split('.');
        var element = parts.pop();
        var table = parts.join('.');  //returns everything before the last '.', or just the table if parts.length == 1
        g_form.setValue('table', table);
        g_form.setValue('element', element);
    }
}
