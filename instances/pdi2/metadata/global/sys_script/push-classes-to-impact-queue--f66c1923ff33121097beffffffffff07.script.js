(function executeRule(current, previous /*null when async*/) {
	try {
        var handler = new SNC.ImpactManager();
		if (previous && previous.table) {
			handler.sendToQueue(previous.table, false);
		}
		handler.sendToQueue(current.table, true);
    } catch (ex) {
        gs.log("Filter Services for Impact: Failed to send message to NowMQ em_impact_queue: " + ex.message);
    }
})(current, previous);
