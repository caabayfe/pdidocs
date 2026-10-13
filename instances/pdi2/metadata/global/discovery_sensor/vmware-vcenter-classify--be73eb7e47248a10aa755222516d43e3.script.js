new DiscoverySensor({
	process: function(result) {
		var output = result.output;

		output = JSON.parse(output);
		if (output.status == 200) {
			var probe = SncProbe.get("VMWare - vCenter Datacenters");
			probe.setSource(g_probe.getParameter('source'));
			probe.addParameter("probe_name", "VMWare - vCenter Datacenters");
			probe.addParameter("ip_address", g_probe.getParameter('source'));
			probe.addParameter("timestamp", new GlideDateTime());
			probe.addParameter("cidata", g_probe.getParameter('cidata'));
			probe.create(g_probe.getParameter('agent'), this.getEccQueueId());
			return;
		}
		if (g_device) {
			var status = new DiscoveryStatus(g_device.getStatus());
			g_device.state(DiscoverySensor.HistoryStates.ACTIVE_COULDNT_CLASSIFY, '', status.logStateChanges, 'Discovery', this.getEccQueueId());
		}
	},
	
	type: "DiscoverySensor"
});
