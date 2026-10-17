function openRolePickerForUIPage() {
    if (g_scratchpad.enable_acl_create_ux == "false") {
        gsftSubmit(null, g_form.getFormElement(), "sysverb_insert");
        return;
    }

    // A new UI Page record is being created. Pick a role for ACL
    var qbDialog = new GlideModal('acl_role_picker');
    qbDialog.setTitle(getMessage('Select a user role'));
    qbDialog.setPreference('sysparm_role_picker_label', getMessage('Select a user role for Access Control on this UI Page'));
    qbDialog.setPreference('sysparm_action_name', 'sysverb_insert');
    qbDialog.render();
}
