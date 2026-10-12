function generateProfiles() {

    if (g_form.modified || (g_form.getValue("condition") != g_scratchpad.condition)) {
        getMessage("You have unsaved changes. Please save them to continue.", function(msg) {
            g_form.addErrorMessage(msg);
        });
        return false;
    } else {
        var dialogClass = GlideModal ? GlideModal : GlideDialogWindow;
        var dialog = new dialogClass("sn_employee_generate_employee_profiles");
        dialog.setPreference("sysparm_table_name", g_form.getValue("table"));
        dialog.setPreference("sysparm_condition", g_form.getValue("condition"));
        dialog.setPreference("sysparm_sysid", g_form.getUniqueValue());
        dialog.setTitle(new GwtMessage().getMessage('Generate Employee Profiles'));
        dialog.setSize(400);
        dialog.setPreference("focusTrap", true);
        dialog.render();
    }
}
