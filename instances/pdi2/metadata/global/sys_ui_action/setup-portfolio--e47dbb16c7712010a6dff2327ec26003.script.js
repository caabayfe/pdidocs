function openModal() {
var gDialog = new GlideModal("service_portfolio_automations");
	gDialog.setTitle(getMessage("Setup Portfolio"));
	gDialog.setPreference("sysparm_sys_id", g_form.getUniqueValue());
	gDialog.render();
}
