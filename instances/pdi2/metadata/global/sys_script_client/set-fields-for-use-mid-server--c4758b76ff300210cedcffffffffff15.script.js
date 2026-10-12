function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '' || g_form.getValue("url_builder") == "false") {
        return;
    }

    if (g_form.getValue("mutual_auth") == "true" && g_form.getValue("use_mid") == "true") {
        g_form.setMandatory("protocol_profile", false);
        g_form.setDisplay("protocol_profile", false);

        g_form.setMandatory("mid_protocol_profile", true);
        g_form.setDisplay("mid_protocol_profile", true);

        g_form.setMandatory("protocol", false);
        g_form.setDisplay("protocol", false);
    } else if (g_form.getValue("mutual_auth") == "true" && g_form.getValue("use_mid") == "false") {
        g_form.setMandatory("protocol_profile", true);
        g_form.setDisplay("protocol_profile", true);

        g_form.setMandatory("mid_protocol_profile", false);
        g_form.setDisplay("mid_protocol_profile", false);

        g_form.setMandatory("protocol", false);
        g_form.setDisplay("protocol", false);
    } else {
        g_form.setMandatory("protocol_profile", false);
        g_form.setDisplay("protocol_profile", false);

        g_form.setMandatory("mid_protocol_profile", false);
        g_form.setDisplay("mid_protocol_profile", false);

        g_form.setMandatory("protocol", true);
        g_form.setDisplay("protocol", true);
    }

    //Type appropriate comment here, and begin script below

}
