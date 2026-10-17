function showConfirmationModal() {
    var gm = new GlideModal('archive_process_context_confirmation');
    gm.setTitle(getMessage("Archive Process Context?"));
	gm.setPreference('sysparm_selectedProcesses', g_form.getUniqueValue());
    gm.render();
}
