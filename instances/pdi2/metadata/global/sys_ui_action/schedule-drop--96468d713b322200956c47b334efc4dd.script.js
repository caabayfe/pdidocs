function renderScheduler() {
	var modal = new GlideModal('schedule_index_action');
	modal.setTitle(getMessage("schedule_index_drop"));
	modal.setPreference('sysparm_index_action', 'drop');
	modal.render();
}
