MIDClusterManagementUtil = {
    checkPrecondition: function(current) {
		var filteredTopics = ['HeartbeatProbe', 'SystemCommand', 'Command', 'MonitoringProbe', 'config.file'];
		var passBaseConditions = current.agent.startsWith('mid.server.') && current.queue == 'output' && !current.topic.startsWith('queue.') 
				&& !current.topic.startsWith('MIDExtension:') && filteredTopics.indexOf(current.topic + '') == -1;

		var discoveryNotAvailable = (typeof DiscoveryStatus == 'undefined');

		if (discoveryNotAvailable)
			return passBaseConditions;
		var discoveryType = DiscoveryStatus.getDiscoveryType(current.agent_correlator + '');

		return passBaseConditions && 
			DiscoveryStatus.shouldRunClusterManagementForDiscoveryType(discoveryType);
	}
};
