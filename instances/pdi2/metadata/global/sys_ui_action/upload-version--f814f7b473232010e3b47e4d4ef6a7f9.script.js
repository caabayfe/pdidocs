function uploadVersion() {
	var gdw = new GlideDialogWindow("ds_upload_version", false, 400, 200);
	gdw.setTitle(getMessage("Upload Version"));
	gdw.setPreference("sysparm_document_id", g_sysId);	
	gdw.render();
}
