(function refineQuery(current, parent) {
	// Get count of mids used
	if (JSUtil.nil(parent.mid_server_list)) {
		current.addQuery('sys_id', 'IN', '');
		return;
	}

	var midCount = parent.mid_server_list.split(",").length;

	// Grab the associated auto-configuration discovery status from the automation_status_set
	var rangeAssignStatusGr = new GlideRecord("discovery_status");
	// GlideRecord.get 1 arg form falls back to 'name' if not found by sys_id, 2 arg form throws exception if arg2 is null.
	if (!parent.range_assign_status || !rangeAssignStatusGr.get('sys_id', parent.range_assign_status)) {
		current.addQuery('sys_id', 'IN', '');
		return;
	}

	// Grab the associated auto-configuration queue from the auto-configuration discovery status
	var midServerAutoConfigQueueGr = new GlideRecord("mid_server_auto_config_queue");
	midServerAutoConfigQueueGr.addQuery('status', rangeAssignStatusGr.getUniqueValue());
	midServerAutoConfigQueueGr.addQuery('result', 'failed');
	midServerAutoConfigQueueGr.query();

	var inaccessibleSubnets = []; // list of all subnets that cannot be accessed by any mid
	var seenSubnetsMap = {}; // map of ipCollection to number of times we've seen it failed

	while (midServerAutoConfigQueueGr.next()) {
		var ipCollection = midServerAutoConfigQueueGr.ip_collection +'';

		if (seenSubnetsMap[ipCollection])
			seenSubnetsMap[ipCollection] += 1;
		else
			seenSubnetsMap[ipCollection] = 1;

		if (seenSubnetsMap[ipCollection] === midCount)
			inaccessibleSubnets.push(ipCollection);
	}

	current.addQuery('sys_id', 'IN', inaccessibleSubnets.join(","));
})(current, parent);
