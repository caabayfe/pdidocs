function Generate_copy_password() {
    var gDialog = new GlideModal("generate_copy_password", false, 450, 250);
    gDialog.setTitle(new GwtMessage().getMessage("Set Password"));
	gDialog.setPreference("sysparm_user", g_form.getUniqueValue());
	gDialog.setPreference('focusTrap', true);
    gDialog.render();
}
