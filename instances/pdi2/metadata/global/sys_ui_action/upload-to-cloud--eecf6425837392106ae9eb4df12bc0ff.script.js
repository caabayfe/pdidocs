function updateVersionToProvider() {
    var gdw = new GlideModal("ds_upload_to_provider");
    gdw.setTitle(getMessage("Upload to external cloud"));
    gdw.setPreference("sysparm_document_id", g_form.getUniqueValue());
    gdw.render();
}
