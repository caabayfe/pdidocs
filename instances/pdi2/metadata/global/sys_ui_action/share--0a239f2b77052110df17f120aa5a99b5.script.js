function documentLink() {
    var gdw = new GlideModal("ds_generate_link");
    gdw.setTitle(getMessage("Share Document Link"));
	gdw.setPreference("sysparm_document_id", g_form.getUniqueValue());
	gdw.render();
}
