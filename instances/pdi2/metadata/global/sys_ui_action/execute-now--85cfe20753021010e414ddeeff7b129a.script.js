function confirmDelete() {
    if (g_form.modified) {
        alert("Values on the form have changed. Please update the form first.");
    } else {
        var sys_id = g_form.getUniqueValue();
        var tablename = g_form.getValue('table');

        if (isColumnarTable(tablename) == 'true') {
            alert(getMessage("Data Management Delete cannot be executed for columnar table [{0}]").replace('{0}', tablename));
            return;
        }

        var dlg = new GlideDialogWindow('dm_delete_all');
        dlg.setTitle("Delete records?");
        dlg.setWidth(480);

        var excludedTables = getRollbackExcludedTables(sys_id, tablename);
        if (excludedTables)
            dlg.setPreference('sysparm_del_rollback_excluded_tables', excludedTables);

        dlg.setPreference('sysparm_del_sys_id', sys_id);
        dlg.setPreference('sysparm_del_schedule', g_form.getValue('schedule'));
        dlg.setPreference('sysparm_del_run_at', g_form.getValue('run_at'));
        dlg.setPreference('sysparm_del_number', g_form.getValue('number'));
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

function isColumnarTable(tablename) {
    var ga = new GlideAjax('global.DMPolicyUtil');
    ga.addParam('sysparm_name', 'isColumnarTable');
    ga.addParam('sysparm_tablename', tablename);
    ga.getXMLWait();
    return ga.getAnswer();
}
