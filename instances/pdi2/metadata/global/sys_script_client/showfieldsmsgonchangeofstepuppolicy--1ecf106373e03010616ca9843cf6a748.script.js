function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    if (g_form.getValue("default_policy") === "stepup_mfa_policy") {
        g_form.showFieldMsg("stepup_mfa_policy", getMessage("Please save the form to reflect the selected Policy related Input(s) and Condition(s) below."));
    }

}
