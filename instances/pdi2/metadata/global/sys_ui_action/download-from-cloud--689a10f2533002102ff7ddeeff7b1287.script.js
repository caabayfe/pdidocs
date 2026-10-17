function sync() {
    var gdw = new GlideModal("ds_sync_from_provider");
    gdw.setTitle(getMessage("Download from external cloud"));
    gdw.setPreference("sysparm_document_id", g_form.getUniqueValue());
    gdw.setWidth(350);
    gdw.render();
}
