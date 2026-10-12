(function executeRule(current, previous /*null when async*/) {

	if (current.getValue("node_type") != previous.getValue("node_type")) {
		GlideClusterMessage.postDirected("script", "GlideSysSemaphore.setSemaphoreSetId();", current.getValue("system_id"));
		//Run these a bit after because they depend on having a correctly set semaphore set ID
		GlideClusterMessage.postDirectedDelayed("script", "GlideSysSemaphore.get().reload();", current.getValue("system_id"), 3000);
		// if schedulers has been explicitly set to none, don't restart scheduler threads
		if (current.schedulers != 'none')
			GlideClusterMessage.postDirectedDelayed("script", "GlideScheduler.restart();", current.getValue("system_id"), 3000);
	}

})(current, previous);
