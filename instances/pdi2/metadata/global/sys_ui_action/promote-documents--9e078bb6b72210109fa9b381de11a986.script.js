function openPromoteModal() {
	var modal = new GlideModal("ais_select");
	modal.setTitle("Select Documents To Promote");
	modal.setSize(2000);
	modal.setPreference("sysparm_action_type", "PROMOTE");
	modal.render();
}
