function migrateIPAddress() {
    g_list.action('09eee705db1ce010d515a5f74b9619e6', 'sysverb_migrate_ip_address');

}
if (typeof window == 'undefined') {
    processServerSide();
}

function processServerSide() {
    try {
        // Trigger the Migrate schedule Job
        var job = new GlideRecord("sysauto_script");
        job.get("83b38a3273902010616ca9843cf6a765");
        if (job.isValidRecord()) {
            SncTriggerSynchronizer.executeNow(job);

            // Set the 'glide.ip_address_controls.migrated' Proprety to true
            GlidePropertiesDB.set('glide.ip_address_controls.migrated', true);

            var ipFilterListLink = "/sys_ip_filter_criteria_list.do";
            gs.addInfoMessage(gs.getMessage("Migration process has been triggered. Please navigate to <a target='_blank' href='{0}'>IP Filter Criteria list</a> to check the progress.", ipFilterListLink));
        } else {
			gs.error("MigrateIPAddress - Scheduled Job Script record not found.");
		}
    } catch (e) {
        gs.error("Error while migrating the IP addresses to IP Filter: " + e.getMessage());
        gs.addErrorMessage(gs.getMessage('Some Error occurred while migrating the IP Addresses, please check Logs for more details.'));
    }
}
