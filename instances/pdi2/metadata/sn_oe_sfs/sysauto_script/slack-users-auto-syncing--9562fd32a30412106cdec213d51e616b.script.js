var job = new sn_oe_sfs.CollabSlackUserSync();
var users = job.sync();

// Update setup status of "Slack Application" to "complete"
var currentDomain = gs.getSession().getCurrentDomainID() ?? 'global';
var collabProviderAppGr = new GlideRecord('sys_cs_collab_provider_application');
collabProviderAppGr.addActiveQuery();
collabProviderAppGr.addQuery('sys_domain', currentDomain);
collabProviderAppGr.addQuery('provider', '1f2e35d1a3f382106cdec213d51e61ae'); // Slack Provider
collabProviderAppGr.query();
if (collabProviderAppGr.next()) {
	collabProviderAppGr.setValue("setup_status", "complete");
	collabProviderAppGr.update();
} else {
	throw "Missing sys_cs_collab_provider_application record";
}
