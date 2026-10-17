(function executeRule(current, previous /*null when async*/) {
	try {
        var handler = new SNC.ImpactManager();
        if (previous && previous.service && previous.service != current.service) {
			handler.sendToQueueDeleteCase(previous.service);
		}
        handler.sendToQueue(current.service, current.calculate_impact);
    } catch (ex) {
        gs.log("Filter Services for Impact: Failed to send message to NowMQ em_impact_queue: " + ex.message);
    }
})(current, previous);
