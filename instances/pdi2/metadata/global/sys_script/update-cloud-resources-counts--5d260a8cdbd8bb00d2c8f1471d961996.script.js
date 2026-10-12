(function executeRule(current, previous /*null when async*/) {
	var statusSysID = current.getUniqueValue();
	var cloudResourceDiscoveryCountHandler = new global.CloudResourceDiscoveryCountHandler();

	/*
	*	When a cloud discovery is completed or cancelled, the resource count have to be
	*	updated to the "discovery_cloud_results" table by iterating through the results,
	*	for current discovery run, in the "discovery_cloud_temp_results" table.
	*
	*	"discovery_cloud_temp_results" is used as a cache table for persisting the discovery
	*	results of a cloud discovery run. This script updates the resource counts and wipes
	*	out the cached results of current discovery run.
	*
	*/

	cloudResourceDiscoveryCountHandler.persistCachedDiscoveryResultsToCountTable(statusSysID);
	
        /*  Wrapping clean up in if condition so that it won't get triggered every time an input record
	 *  gets processed after cancelling discovery.Table Cleaner over discovery_cloud_temp_results
 	 *  table cleans up records older than 5 Days.
	 */
	
    if (previous.state != current.state) {
        gs.info("Cleaning up the table discovery_cloud_temp_results for status sys_id " + statusSysID);
        cloudResourceDiscoveryCountHandler.cleanUpCachedDiscoveryResults(statusSysID);
    }

})(current, previous);
