function onCondition() {
    var substatus = g_form.getValue('substatus');
    var mandatoryfields = g_scratchpad.formMandatoryFields;
    var serialField = 'serial_number';
    if (mandatoryfields && mandatoryfields[0]) {
        var fields = mandatoryfields[0];
        for (var i = 0; i < fields.length; i++) {
            if (g_form.hasField(fields[i])) {
                g_form.setMandatory(fields[i], false);
                g_form.hideFieldMsg(fields[i]);
            }
        }
    }
    if (g_form.hasField(serialField)) {
        g_form.setMandatory(serialField, false);
        g_form.hideFieldMsg(serialField);
    }
    if (g_form.hasField('location')) {
        g_form.setReadOnly('location', true);
    }
    if (g_form.isNewRecord() && substatus === 'pre_allocated') {
        g_form.setReadOnly('substatus', false);
        g_form.setReadOnly('install_status', false);
    }
    var sections = g_form.getSectionNames();
    for (var i = 1; i < sections.length; i++) {
        g_form.setSectionDisplay(sections[i], false);
    }
    g_form.hideRelatedLists();
}
