function onLoad() {
    if (g_form.isNewRecord()) {
        g_form.addInfoMessage(getMessage('Select a Reference first to display any available Reference table rules.'));
        g_form.setReadOnly('table_archive_rule', true);
    }
}
