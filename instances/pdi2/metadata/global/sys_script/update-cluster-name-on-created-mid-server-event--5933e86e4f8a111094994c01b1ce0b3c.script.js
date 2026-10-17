(function executeRule(current, previous /*null when async*/ ) {
    // get 'created' event record
    var eventgr = new GlideRecord('mid_server_event');
    eventgr.addQuery('agent', current.agent.name);
    eventgr.addQuery('event', 'created');
	eventgr.addNullQuery('cluster');
	eventgr.setLimit(1);
	eventgr.orderByDesc('sys_created_on');
    eventgr.query();
    // add cluster name if this is the first ever cluster assigned to that Mid Server
    if (eventgr.next()) {
		var clusterId = '' + current.cluster;
        var clusterCache = new SNC.ECCAgentClusterCache();
        var cluster = clusterCache.getBySysId(clusterId);
        if (cluster) {
			eventgr.cluster ='' + cluster.name;
			eventgr.update();
			MIDServerUtil.logInfo("Cluster name added to the most recent 'created' event of MID Server: " + current.agent.name, "Lifecycle Event");
		}
    }
})(current, previous);
