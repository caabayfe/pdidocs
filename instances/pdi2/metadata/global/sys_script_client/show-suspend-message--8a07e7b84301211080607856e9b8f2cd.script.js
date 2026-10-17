function onLoad() {
    if (g_scratchpad.kill_job && g_scratchpad.job_type == "historical") {
        g_form.addWarningMessage(g_scratchpad.warning_msg);
    }
}
