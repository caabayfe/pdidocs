new DiscoverySensor({
	process: function(result) {
		this.prepareJSON(result);

		// Note: There is ~1/2000 chance that a random, non-AWS machine UUID will be marked as "isLikelyEc2".
		// The AWS - Relationship probe collects data which verifies if it truly is an Amazon EC2 machine
		// and any extra probes should be launched as a result of that sensor.
		if (related_data.isLikelyEc2) {
			var p = SncProbe.get('Windows - AWS relationship');

			if(!p){
				DiscoveryLogger.error('Failed to find \"Windows - AWS relationship\" probe', 'Discovery Sensor', this.getEccQueueId(), null);
				return;
			}

			p.setSource(this.getSource());
			p.setEccPriority(g_probe.getParameter('priority'));
			probe.setMidSelectDetails(this.getParameter('mid_selector_details'));
			var ssmObject = this.getParameter('ssm_object');
			if (ssmObject)
				probe.addParameter('ssm_object', ssmObject);
			p.create(this.getAgent(), this.getEccQueueId());
		}

	}
});
