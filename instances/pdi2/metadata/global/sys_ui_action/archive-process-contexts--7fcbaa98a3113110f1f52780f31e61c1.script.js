function showConfirmationModal() {
    var gm = new GlideModal('archive_process_context_confirmation');
    gm.setTitle(getMessage("Archive Process Contexts?"));
    gm.setPreference('sysparm_selectedProcesses', g_list.getChecked());
    gm.render();
}
