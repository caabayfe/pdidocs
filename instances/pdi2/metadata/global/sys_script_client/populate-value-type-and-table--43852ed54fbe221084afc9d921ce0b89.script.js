function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue == '') {
        return;
    }

    resetValues();

    var table = g_form.getValue('target_table');
    var ga = new GlideAjax('TargetFieldGlideAjax');
    ga.addParam('sysparm_name', 'getTargetFieldType');
    ga.addParam('sysparm_table_name', table);
    ga.addParam('sysparm_element', newValue);
    ga.getXMLWait();

    var ans = JSON.parse(ga.getAnswer());

    if (ans.reference_table) {
        configureReferenceTableMode(ans.reference_table);
    } else {
        configureStaticValueMode();
    }
}

function resetValues() {
    g_form.clearValue('value_table');
    g_form.clearValue('value_reference');
    g_form.clearValue('value_static');
}

function configureReferenceTableMode(referenceTable) {
    // Configure fields for reference table mode
    g_form.setValue('value_table', referenceTable + '');
    g_form.setDisplay('value_reference', true);
    g_form.setMandatory('value_reference', true);

    // Hide static value field
    g_form.setMandatory('value_static', false);
    g_form.setDisplay('value_static', false);
}

function configureStaticValueMode() {
    // Hide reference table fields
    g_form.setMandatory('value_reference', false);
    g_form.setDisplay('value_reference', false);
    g_form.setMandatory('value_table', false);
    g_form.clearValue('value_table');

    // Show static value field
    g_form.setDisplay('value_static', true);
    g_form.setMandatory('value_static', true);
}
