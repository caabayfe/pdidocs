function onCondition() {
    g_form.setDisplay("pwd_validity_days", true);
    g_form.setDisplay("expiration_warn_days", true);
    g_form.setMandatory("pwd_validity_days", true);
    g_form.setMandatory("expiration_warn_days", true);
    g_form.setDisplay("expiration_schedule_frequency", true);
    if (g_form.getValue("expiration_schedule_frequency") == "daily") {
        g_form.setDisplay("expiration_run_start", false);
        g_form.setDisplay("expiration_run_time_zone", true);
        g_form.setDisplay("expiration_run_period", false);
        g_form.setDisplay("expiration_run_time", true);
    } else {
        g_form.setMandatory("expiration_run_period", true);
        g_form.setDisplay("expiration_run_start", true);
        g_form.setDisplay("expiration_run_time_zone", false);
        g_form.setDisplay("expiration_run_period", true);
        g_form.setDisplay("expiration_run_time", false);
    }
}
