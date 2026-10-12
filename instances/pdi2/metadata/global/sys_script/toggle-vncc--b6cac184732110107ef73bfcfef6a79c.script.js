(function executeRule(current, previous /*null when async*/) {

    var cs = new GlideRecord("sys_cluster_state");
    cs.query();
	
    //Offset the messages on each node by a random time up to 1 minute
    var offset;
    while (cs.next()){
        offset = getRandomTime();
        GlideClusterMessage.postDirectedDelayed("script", "GlideSysSemaphore.get().reload();", cs.getValue("system_id"), offset);
        GlideClusterMessage.postDirectedDelayed("script", "GlideScheduler.restart();", cs.getValue("system_id"), offset);
    }

    //Get a random time from 0 to 5 minutes
    function getRandomTime() {
        var min = 0;
        var max = 60000;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

})(current, previous);
