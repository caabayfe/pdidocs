(function executeRule(current, previous /*null when async*/) {
	try {
		var handler = new SNC.ImpactManager();
		handler.sendToQueue(current.table, false);
    } catch (ex) {
        gs.log("Filter Services for Impact: Failed to send message to NowMQ em_impact_queue: " + ex.message);
    }
})(current, previous);
