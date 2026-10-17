(function executeRule(current, previous) {
	var i;
	var finalCIsList;
	var datacenterCount;
	var statusSysID = current.getUniqueValue();
	var scheduleSysID = current.getValue('dscheduler');
	var cloudResourceDiscoveryUtil = new CloudResourceDiscoveryUtil();
	var cloudResourceDiscoHandler = new CloudResourceDiscoveryCountHandler();
	
	/*
	*	When a discovery is triggered for a schedule and if it's not a vCenter one's i.e., Schedule
	*	associated to a Cloud Service Account whose datacenter type is not "cmdb_ci_vcenter_datacenter",
	*	then for such kind of discovery run, we cache the discovered data into a cache table
	*	("discoveyr_cloud_temp_results" table) and resource counts are updated by another business
	*	rule ("Update Cloud Resources Counts") that is triggered when current Cloud Resource Discovery
	*	run completes or get cancelled.
	*	
	*	If at all discovery triggered for vCenter Schedules then we don't cache result but just update
	*	the resource counts at respective sensor(s) so in order to update, first we need have an entry for
	*	that CI (e.g., "cmdb_ci_vm_instance") and its count set to 0 so that the count is updated
	*	by respective hooks added at both CAPI and Pattern levels.
	*/
	
	if (cloudResourceDiscoveryUtil.fetchDatacenterTypeFromSchedule(scheduleSysID) == 'cmdb_ci_vcenter_datacenter') {
		finalCIsList = cloudResourceDiscoHandler.fetchAllChildCIsForParentCI('cmdb_ci');
		
		// Initialize the CI counts to 0 for each CI in "Discovery Cloud Results" table
		for (i in finalCIsList)
			cloudResourceDiscoHandler.setCloudResourceCount(scheduleSysID, statusSysID, finalCIsList[i]+'', 0);
	}
	
	if (scheduleSysID) {
		datacenterCount = new DiscoveryScheduleManager().getDatacenterCountForSchedule(scheduleSysID);
		cloudResourceDiscoHandler.setCloudResourceCount(scheduleSysID, statusSysID, 'cmdb_ci_logical_datacenter', datacenterCount);
	}
})(current, previous);
