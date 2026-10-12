function confirmSchedule() {
    if (g_form.getValue('set_value') == '') {
        alert("Please provide inputs for \"Fields & values\".");
    } else {
        if (g_form.getValue('run_at') == '') {
            g_form.save();
        } else {
            var jsRunDate = new Date(getDateFromFormat(g_form.getValue("run_at"), g_user_date_time_format));
            var jsToday = getUserDateTime();
            if (jsRunDate > jsToday) {
                var dlg = new GlideDialogWindow('dm_schedule_update');
                dlg.setTitle("Update records?");
                dlg.setWidth(450);
                dlg.setPreference('sysparm_upd_number', g_form.getValue('number'));
                dlg.setPreference('sysparm_upd_sys_id', g_form.getUniqueValue());
                dlg.setPreference('sysparm_upd_table', g_form.getValue('table'));
                dlg.setPreference('sysparm_upd_condition', g_form.getValue('condition'));
                dlg.setPreference('sysparm_upd_set_workflow', g_form.getValue('set_workflow'));
                dlg.setPreference('sysparm_upd_set_system_fields', g_form.getValue('set_system_fields'));
                dlg.setPreference('sysparm_upd_set_value', g_form.getValue('set_value'));
                dlg.setPreference('sysparm_upd_run_at', g_form.getValue('run_at'));
                dlg.render();
            }
        }
    }
}
