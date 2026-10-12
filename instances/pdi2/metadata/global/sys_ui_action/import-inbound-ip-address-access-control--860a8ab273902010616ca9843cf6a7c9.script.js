function importIPAddress() {
    g_list.action('860a8ab273902010616ca9843cf6a7c9', 'sysverb_import_ip_address');

}
if (typeof window == 'undefined') {
    processServerSide();
}

function processServerSide() {
    try {
        // Trigger the Migrate/import schedule Job
        var job = new GlideRecord("sysauto_script");
        job.get("83b38a3273902010616ca9843cf6a765");
        if (job.isValidRecord()) {
            SncTriggerSynchronizer.executeNow(job);

            // Set the 'glide.ip_address_controls.migrated' Proprety to true
            GlidePropertiesDB.set('glide.ip_address_controls.migrated', true);

            gs.addInfoMessage(gs.getMessage("Import process has been triggered. Please refresh this list to check the progress."));
        } else {
			gs.error("ImportIPAddress - Scheduled Job Script record not found.");
		}
    } catch (e) {
        gs.error("Error while importing the IP addresses to IP Filter: " + e.getMessage());
        gs.addErrorMessage(gs.getMessage('Some Error occurred while importing the IP Addresses, please check Logs for more details.'));
    }
}
