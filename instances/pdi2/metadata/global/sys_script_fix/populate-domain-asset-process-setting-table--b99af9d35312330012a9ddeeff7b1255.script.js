populateDomainsAssetProcessSettingTable();
function populateDomainsAssetProcessSettingTable() {
	var reset_domains_script = "new AlmDomainAssetProcessSettingWrapper().reset();";
	GlideRunScriptJob.scheduleScript(reset_domains_script);
}
