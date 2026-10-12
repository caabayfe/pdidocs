function onLoad() {
    if (g_form.isNewRecord()) {
        g_form.setValue('public_client', true);
        g_form.setReadOnly('client_id', false);
        g_form.setMandatory('client_id', true);
        g_form.clearValue('client_id');

        var gDialog = new GlideModal("cimd_import_metadata", false, 600, 700);
        gDialog.setTitle(new GwtMessage().getMessage("Add a CIMD OAuth Client"));
		gDialog.setBackdropStatic(true);
        gDialog.render();
    }
    g_form.setReadOnly('public_client', true);
}
