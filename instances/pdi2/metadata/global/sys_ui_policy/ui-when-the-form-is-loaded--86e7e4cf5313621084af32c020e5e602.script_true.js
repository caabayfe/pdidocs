function onCondition() {
    g_form.setDisplay('value_table', false);
    g_form.setDisplay('sys_scope', false);

    if (g_form.isNewRecord()) {
        hideValueFields();
    } else {
        showActiveValueField();
    }
}

function hideValueFields() {
    g_form.setDisplay('value_reference', false);
    g_form.setDisplay('value_static', false);
}

function showActiveValueField() {
    if (g_form.getValue('value_reference')) {
        setFieldState('value_reference', true, true); // show + mandatory
        setFieldState('value_static', false, false); // hide + optional
    } else if (g_form.getValue('value_static')) {
        setFieldState('value_reference', false, false); // hide + optional
        setFieldState('value_static', true, true); // show + mandatory
    }
}

function setFieldState(fieldName, visible, mandatory) {
    g_form.setDisplay(fieldName, visible);
    g_form.setMandatory(fieldName, mandatory);
}
