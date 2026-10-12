function openBlockModal() {
	var modal = new GlideModal("ais_select");
	modal.setTitle("Select Documents To Block");
	modal.setSize(2000);
	modal.setPreference("sysparm_action_type", "BLOCK");
	modal.render();
}
