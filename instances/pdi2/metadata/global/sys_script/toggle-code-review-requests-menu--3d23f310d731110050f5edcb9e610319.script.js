toggleCodeReviewRequestsMenuItem();

function toggleCodeReviewRequestsMenuItem() {
	//retrieve Code Review Requests menu item across all domains
	var module = new GlideRecord("sys_app_module");
	module.addQuery("filter","stage=codereview^type=push_commit^EQ");
	module.addQuery("name","sys_sync_history");
	module.queryNoDomain();
	while(module.next()) {
		module.setValue("active", current.value);
		new SNC.ScriptableMetadataWriter(module).updateNoDomainWithoutTrackingChangeOrDisplayingConflictNotifications();
	}
}
