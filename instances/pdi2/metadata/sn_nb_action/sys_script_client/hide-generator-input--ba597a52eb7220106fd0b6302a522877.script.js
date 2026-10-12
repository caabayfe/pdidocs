function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (g_form.getValue('input_generator_flow') == '')
        g_form.setSectionDisplay("generator_input", false);
    else
        g_form.setSectionDisplay("generator_input", true);

}
