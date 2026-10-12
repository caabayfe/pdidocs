(function executeRule(current, previous /*null when async*/) {
	
	var cs = new GlideRecord("sys_cluster_state");
    cs.addQuery("node_type", current.sys_id);
    cs.query();
	
	//Offset the messages on each node by a random time up to 1 minute
	var offset;
	while (cs.next()){
	    offset = getRandomTime();
		GlideClusterMessage.postDirected("script", "GlideSysSemaphore.setSemaphoreSetId();", cs.getValue("system_id"));
		//Run these a bit after because they depend on having a correctly set semaphore set ID
		GlideClusterMessage.postDirectedDelayed("script", "GlideSysSemaphore.get().reload();", cs.getValue("system_id"), 3000 + offset);
		GlideClusterMessage.postDirectedDelayed("script", "GlideScheduler.restart();", cs.getValue("system_id"), 3000 + offset);
	}

	//Get a random time from 0 to 1 minute
	function getRandomTime() {
        var min = 0;
        var max = 60000;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

})(current, previous);
