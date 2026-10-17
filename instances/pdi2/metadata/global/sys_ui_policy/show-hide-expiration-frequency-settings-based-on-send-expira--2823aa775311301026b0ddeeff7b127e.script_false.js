function onCondition() {
    g_form.setMandatory("pwd_validity_days", false);
    g_form.setMandatory("expiration_warn_days", false);
    g_form.setDisplay("pwd_validity_days", false);
    g_form.setDisplay("expiration_warn_days", false);
    g_form.setDisplay("expiration_schedule_frequency", false);
    g_form.setDisplay("expiration_run_start", false);
    g_form.setDisplay("expiration_run_time_zone", false);
    g_form.setMandatory("expiration_run_period", false);
    g_form.setDisplay("expiration_run_period", false);
    g_form.setDisplay("expiration_run_time", false);
}
