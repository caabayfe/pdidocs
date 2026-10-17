function onCondition() {
    g_form.setDisplay("allowed_codes", true);
    g_form.setDisplay("default_code", true);
    g_form.setMandatory("allowed_codes", true);
    g_form.setMandatory("default_code", true);
    g_form.addInfoMessage(getMessage("Wrap-up codes are defined in the interaction_wrap_up_code table. Create wrap-up codes before creating a configuration with enable_codes enabled."));
}
