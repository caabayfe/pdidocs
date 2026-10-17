function onChange(control, oldValue, newValue, isLoading) {

    // on load and on change update the default_value_helper
    var defaultValueDetails = g_form.getValue('default_value_details');
    try {
        defaultValueDetails = JSON.parse(defaultValueDetails);
    } catch (error) {
        defaultValueDetails = {
            defaultValue: {}
        };
    }
    var value = defaultValueDetails.defaultValue.value || 'NULL';
    var displayValue = defaultValueDetails.defaultValue.displayValue || 'NULL';
    g_form.setValue('default_value_helper', value, displayValue);

}
