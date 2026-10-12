function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    if (g_form.getValue("default_policy") === "stepdown_mfa_policy") {
        g_form.showFieldMsg("stepdown_mfa_policy", getMessage("Please save the form to reflect the selected Policy related Input(s) and Condition(s) below."));
    }

}
