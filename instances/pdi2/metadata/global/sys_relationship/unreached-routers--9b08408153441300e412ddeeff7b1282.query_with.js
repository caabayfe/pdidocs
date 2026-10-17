(function refineQuery(current, parent) {
	// Get the list of pending OR successful router IPs to filter them out from the failure queues
	// A router is only unreached if there are no pending or successful queue records for that IP
	var routersToFilter = [];
	var seenRouters = {};
	var subnetDiscoveryQueueGr = new GlideRecord("subnet_discovery_queue");
	subnetDiscoveryQueueGr.addQuery('status', parent.subnet_discovery_status +'');
	subnetDiscoveryQueueGr.addQuery('result', 'IN', 'pending,success');
	subnetDiscoveryQueueGr.query();

	var routerIp;
	while (subnetDiscoveryQueueGr.next()) {
		routerIp = subnetDiscoveryQueueGr.router_ip_address +'';
		if (!seenRouters[routerIp]) {
			seenRouters[routerIp] = true;
			routersToFilter.push(subnetDiscoveryQueueGr.router_ip_address +'');
		}
	}

	current.addQuery('status', parent.subnet_discovery_status);
	current.addQuery('result', 'IN', 'failed,canceled');
	if (routersToFilter.length > 0)
		current.addQuery('router_ip_address', 'NOT IN', routersToFilter.join(","));

})(current, parent);
