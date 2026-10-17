syncCIRecord();

function syncCIRecord() {
	if (current.skip_sync != true) {
    	var ca = new AssetAndCISynchronizer();
    	ca.syncRecords(current, 'cmdb_ci', '', previous);
	} else {
	    // skip_sync is used only to prevent recursion within the same cycle of BRs --> reset for next cycle
   	 current.skip_sync = false;
	}
}
