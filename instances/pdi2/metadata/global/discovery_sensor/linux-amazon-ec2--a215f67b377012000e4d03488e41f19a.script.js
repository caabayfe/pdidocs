new DiscoverySensor({
	process: function(result) {
		this.prepareJSON(result);

		if (related_data.isEc2) {
			var p = SncProbe.get('Linux - AWS relationship');

			if(!p){
				DiscoveryLogger.error('Failed to find \"Linux - AWS relationship\" probe', 'Discovery Sensor', this.getEccQueueId(), null);
				return;
			}

			p.setSource(this.getSource());
			p.setEccPriority(this.getParameter('priority'));
			p.setMidSelectDetails(this.getParameter('mid_selector_details'));
			var ssmObject = this.getParameter('ssm_object');
			if (ssmObject)
				p.addParameter('ssm_object', ssmObject);
			p.create(this.getAgent(), this.getEccQueueId());
		}

	}
});
