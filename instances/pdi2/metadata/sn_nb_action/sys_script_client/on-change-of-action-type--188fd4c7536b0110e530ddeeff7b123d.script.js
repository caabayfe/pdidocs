function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    g_form.clearValue('action');
    //If action type has changed to Guided Decision Trees
    if (newValue == 'a06a95bbeb2310106fd0b6302a522851') {
        g_form.setSectionDisplay('action_inputs', false);
    }
}
