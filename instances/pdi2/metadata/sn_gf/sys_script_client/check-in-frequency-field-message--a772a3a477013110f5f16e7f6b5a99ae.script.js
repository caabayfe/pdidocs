function onChange(control, oldValue, newValue, isLoading, isTemplate) {

    if (newValue == "fortnightly")
        g_form.showFieldMsg('check_in_frequency', g_scratchpad.checkInFrequencyFieldMessage);

}
