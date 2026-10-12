function confirmRollback() {
	var dlg = new GlideDialogWindow('dm_rollback_update');
	dlg.setTitle("Are you sure you want to execute this rollback?");    
	dlg.setWidth(450);
	dlg.setPreference('sysparm_upd_sys_id', g_form.getUniqueValue());
	dlg.setPreference('sysparm_upd_number', g_form.getDisplayValue('number'));
	dlg.setPreference('sysparm_upd_roll_context', g_scratchpad.rollback_context);
    dlg.render();
}
