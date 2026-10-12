function onChange(control, oldValue, newValue, isLoading) {
    if (isLoading || newValue === oldValue)
        return;

    // Only trigger when changing to 'manual' from 'live'
    if (!g_form.isNewRecord() && newValue === 'manual' && oldValue === 'live') {
        var clientId = g_form.getValue('client_id');

        if (!clientId) {
            g_form.addErrorMessage(new GwtMessage().getMessage('Client ID (CIMD URL) is required to convert to manual configuration'));
            g_form.setValue('status', oldValue);
            return;
        }

        // Clear the dirty flag for status field - update will be done via API in the modal
        g_form.setValue('status', oldValue);

        // Open the CIMD import metadata dialog in update mode
        var gDialog = new GlideModal('cimd_import_metadata', false, 600, 400);
		gDialog.setBackdropStatic(true);
        gDialog.setPreference('focusTrap', 'enable');
        gDialog.setPreference('sysparm_client_id', clientId);
        gDialog.setPreference('sysparm_sys_id', g_form.getUniqueValue());
        gDialog.setPreference('sysparm_update_mode', 'true');
        gDialog.setTitle(new GwtMessage().getMessage('Update CIMD Client Configuration'));
        gDialog.render();
    }
}
