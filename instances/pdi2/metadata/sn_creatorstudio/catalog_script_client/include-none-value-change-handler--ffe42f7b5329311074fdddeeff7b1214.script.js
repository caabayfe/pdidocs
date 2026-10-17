function onChange(control, oldValue, newValue, isLoading) {
    if (isLoading || newValue == '') {
        return;
    }
    // If include_none is moved from true to false and "none" is the currently selected default value
    // then select the first choice as default value since "none" is not an option
    if (newValue === 'false') {
        var choices = JSON.parse(g_form.getValue('choices'));
        // remove the "none" choice from choices, if present
        choices = choices.filter(item => item.value);
        if (choices && choices.length > 0 && g_form.getValue('default_value_helper') === '') {
            g_form.setValue('default_value_details', JSON.stringify({
                defaultValue: {
                    value: choices[0].value,
                    displayValue: choices[0].value,
                },
            }));
        }
    }
}
