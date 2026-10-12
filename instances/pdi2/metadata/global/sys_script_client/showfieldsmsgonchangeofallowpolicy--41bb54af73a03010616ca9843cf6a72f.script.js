function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    if (g_form.getValue("default_policy") === "allow_policy") {
        g_form.showFieldMsg("allow_policy", getMessage("Please save the form to reflect the selected Policy related Input(s) and Condition(s) below."));
    }


}
