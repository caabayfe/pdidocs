var retentionDays = gs.getProperty("com.glide.metadata_delete.retention_days", "90");
var retainScopes = gs.getProperty("com.glide.metadata_delete.retain_always_scopes");

var grScopes = GlideRecord("sys_scope");
grScopes.addQuery("scope", "NOT IN", retainScopes);
grScopes.query();

var companyScopes = [];
var companyScopeIds = [];
while (grScopes.next()) {
    var scope = grScopes.getValue("scope");
	if ((scope != "global") && sn_app_api.AppStoreAPI.isOwnedStoreApp(scope)) {
		companyScopes.push(scope);
		companyScopeIds.push(grScopes.getValue("sys_id"));
	}
}

gs.info("Removing records from sys_metadata_delete table older than " + retentionDays
		+ " days with the following company scopes: " + companyScopes.join(", "));

if (companyScopeIds.length > 0) {
	var grMetadata = GlideRecord("sys_metadata_delete");
	grMetadata.addEncodedQuery("sys_created_on<=javascript:gs.daysAgoStart(" + retentionDays + ")");
	grMetadata.addQuery("sys_scope", "IN", companyScopeIds.join(","));
	grMetadata.setWorkflow(false);
	grMetadata.deleteMultiple();
}
