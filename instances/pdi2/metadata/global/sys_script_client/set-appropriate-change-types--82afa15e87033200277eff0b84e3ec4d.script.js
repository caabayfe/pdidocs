function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (!g_scratchpad.change_model)
        return;

    var model = g_scratchpad.change_model;
    var chgModel = g_form.getValue('chg_model');

    // If it's the initial state and a model is not selected, make sure the correct choices are shown in the Type field
    if (chgModel === '' && g_form.getValue('state') === model.initial_state) {
        if (g_form.getValue('type').toLowerCase() !== 'standard')
            g_form.removeOption('type', 'standard');
        else if (g_form.getValue('type').toLowerCase() === 'standard' && model.type_compatibility)
            g_form.setReadOnly('chg_model', true);

        g_form.removeOption('type', '');
    }
}
