function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    //Fix for DEF0311646
    if (g_form.getValue('type') == 'integer' && (isNaN(newValue) || !(newValue % 1 === 0) || /\s/g.test(newValue) || (newValue.match(/\./g) != null && newValue.match(/\./g).length > 0)) && newValue != oldValue) {
        g_form.setValue('value', g_scratchpad.current_value);
        g_form.showFieldMsg('value', getMessage("New value must be a valid Integer"), 'info');
    }
}
