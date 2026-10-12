function renderScheduler() {
	var mohdul = new GlideModal('schedule_index_action');
	mohdul.setTitle(getMessage("schedule_index_creation"));
	mohdul.setPreference('sysparm_index_action', 'create');
	mohdul.render();
}
