function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    //if target table changes, then target field along with value should reset
    resetValueField('value_static');
    resetValueField('value_table');
    resetValueField('value_reference');
    g_form.clearValue('target_field');
}

function resetValueField(fieldName) {
    g_form.setMandatory(fieldName, false);
    g_form.setDisplay(fieldName, false);
    g_form.clearValue(fieldName);
}
