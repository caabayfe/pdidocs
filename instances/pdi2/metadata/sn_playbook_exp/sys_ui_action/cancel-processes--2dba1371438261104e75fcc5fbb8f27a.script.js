function showReasonModal() {
    var gm = new GlideModal('sn_playbook_exp_cancel_processes');
    gm.setTitle(getMessage("Cancel processes"));
	gm.setPreference('sysparm_selectedProcesses', g_list.getChecked());
    gm.render();
}
