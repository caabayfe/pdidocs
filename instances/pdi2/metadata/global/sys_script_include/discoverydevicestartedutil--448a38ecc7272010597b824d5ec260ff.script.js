var DiscoveryDeviceStartedUtil = {
    updateDeviceStartedCount: function(current) {
		return current.agent.startsWith('mid.server.') && current.agent_correlator.hasValue() && current.source.hasValue() && current.payload.hasValue() && current.queue == 'output' && current.topic != 'Ping' && current.topic != 'Shazzam' && current.topic != 'SystemCommand' && current.topic != 'MonitoringProbe';
	},
};
