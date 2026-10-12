/*
Data snapshots should work only from Yokohama release,
pa_cdc_transfer_changes_performance table is introduced in Yokohama release, and hence disabling the feature when table doesn't exists.
*/
if (!gs.tableExists("pa_cdc_transfer_changes_performance")) {
	gs.log("Disabling data snapshots for the instance.");
	disableDSJobs();
	disableAnalyticsSources();
	disableGlobalDSProperty();
	disableReplication();
	disableIndicators();
	gs.log("Disabled data snapshots.");
}

function disableDSJobs() {
	//Disabling mining jobs.
    var gr = new GlideRecord("sysauto_dm_cdc_collector");
    gr.addQuery("active", "true");
    gr.setValue("active", "false");
    gr.updateMultiple();

	//Disabling conversion job.
	var conversionGr = new GlideRecord("sysauto");
	conversionGr.addQuery("sys_id", "82dd33c943dd71508060c4d05fb8f2df");
	conversionGr.query();
	if (conversionGr.next()) {
		conversionGr.setValue("active", "false");
		conversionGr.update();
	}
}

function disableReplication() {
    GlidePropertiesDB.set("com.snc.pa.replication.status", "true");
}

function disableGlobalDSProperty() {
    GlidePropertiesDB.set("com.snc.pa.dm.mlb.enable", "false");
}

function disableAnalyticsSources() {
    var gr = new GlideRecord("pa_dm_analytics_source");
    gr.addQuery("is_data_collection_enabled", "true");
    gr.setValue("is_data_collection_enabled", "false");
    gr.updateMultiple();
}

function disableIndicators() {
    var gr = new GlideRecord("pa_indicators");
	gr.addQuery("is_mlb_enabled", "true");
    gr.setValue("is_mlb_enabled", "false");
    gr.setValue("is_mlb_supported", "false");
    gr.updateMultiple();
}
