function onCondition() {
    g_form.hideFieldMsg('info_custom_fields');
    var infoMessage = getMessage('Add comma separated list of fields from both Table and Reference table in the following format {table.<fieldname1>},{table.<fieldname2>} or {reference_table.<fieldnameX>}, {reference_table.<fieldnameY>}');
    g_form.showFieldMsg('info_custom_fields', infoMessage, 'info');
}
