function confirmSchedule() {
    if (g_form.getValue('run_at') == '') {
        g_form.save();
    } else {
        var jsRunDate = new Date(getDateFromFormat(g_form.getValue("run_at"), g_user_date_time_format));
        var jsToday = getUserDateTime();
        if (jsRunDate > jsToday) {
            var dlg = new GlideDialogWindow('dm_schedule_deletion');
            dlg.setTitle("Delete records?");
            dlg.setWidth(480);
            var sys_id = g_form.getUniqueValue();
            var tablename = g_form.getValue('table');
            var excludedTables = getRollbackExcludedTables(sys_id, tablename);
            if (excludedTables)
                dlg.setPreference('sysparm_del_rollback_excluded_tables', excludedTables);

            dlg.setPreference('sysparm_del_number', g_form.getValue('number'));
            dlg.setPreference('sysparm_del_sys_id', sys_id);
            dlg.setPreference('sysparm_del_table', tablename);
            dlg.setPreference('sysparm_del_condition', g_form.getValue('condition'));
            dlg.setPreference('sysparm_del_set_workflow', g_form.getValue('set_workflow'));
            dlg.setPreference('sysparm_del_run_at', g_form.getValue('run_at'));
            dlg.render();
        }
    }

    function getRollbackExcludedTables(sys_id, tablename) {
        var ga = new GlideAjax('global.DMDeleteUtil');
        ga.addParam('sysparm_name', 'hasRollbackExcludedTables');
        ga.addParam('sysparm_tablename', tablename);
        ga.addParam('sysparm_sysId', sys_id);
        ga.getXMLWait();
        return ga.getAnswer();
    }
}
