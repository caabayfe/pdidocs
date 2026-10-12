function confirmUpdate() {
    if (g_form.getValue('set_value') == '') {
        alert("Please provide inputs for \"Fields &amp; values\".");
    } else if (g_form.modified) {
        alert("Values on the form have changed. Please update the form first.");
    } else {
        var dlg = new GlideDialogWindow('dm_update_all');
        dlg.setTitle("Update records?");
        dlg.setWidth(450);
        dlg.setPreference('sysparm_upd_sys_id', g_form.getUniqueValue());
        dlg.setPreference('sysparm_upd_schedule', g_form.getValue('schedule'));
        dlg.setPreference('sysparm_upd_run_at', g_form.getValue('run_at'));
        dlg.setPreference('sysparm_upd_number', g_form.getValue('number'));
		dlg.setPreference('sysparm_upd_table', g_form.getValue('table'));
		dlg.setPreference('sysparm_upd_fieldvalues', g_form.getValue('set_value'));
        dlg.render();
    }
}
