function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        g_form.setDisplay('action_input_generator', false);
    }
    if (newValue == "true" || newValue == true) {
        g_form.setDisplay('action_input_generator', true);
    } else {
        var actionInputGeneratorValue = g_form.getValue("action_input_generator");
        if (actionInputGeneratorValue != '') {
            g_form.hideFieldMsg("action_input_generator");
            g_form.setValue("set_action_inputs_dynamically", "true");
            g_form.showFieldMsg("action_input_generator", getMessage("Please remove the reference to the input generator to continue"), "error");
        } else
            g_form.setDisplay('action_input_generator', false);
    }
}
