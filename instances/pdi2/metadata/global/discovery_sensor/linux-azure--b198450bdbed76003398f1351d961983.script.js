new DiscoverySensor({
	process: function(result) {
		this.prepareJSON(result);
		
		if (related_data.isAzure) {
			current.virtual = 'true';
			var p = SncProbe.get('Linux - Azure Relationship');
			
			if(!p){
				DiscoveryLogger.error('Failed to find \"Linux - Azure Relationship\" probe', 'Discovery Sensor', this.getEccQueueId(), null);
				return;
			}
			
			p.setSource(this.getSource());
			p.setEccPriority(g_probe.getParameter('priority'));
			probe.setMidSelectDetails(this.getParameter('mid_selector_details'));
			p.create(this.getAgent(), this.getEccQueueId());	
		}
			
	}
});
