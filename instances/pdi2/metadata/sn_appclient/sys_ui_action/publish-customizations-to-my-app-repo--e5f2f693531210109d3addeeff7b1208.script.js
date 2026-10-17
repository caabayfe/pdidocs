function uploadToInstance() {
    var dd = new GlideModal("sn_appauthor_app_upload_to_repo");
    dd.setTitle("Publish Customizations To My Application Repository");
    dd.setPreference('sysparm_sys_id', g_form.getUniqueValue());
	dd.setPreference('sysparm_publish_to_app_store', 'false');
	dd.setPreference('sysparm_is_store_app', 'true');
    dd.setWidth(500);
    dd.render();
}
