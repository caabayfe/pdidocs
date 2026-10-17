//The ID sensor is an implementation of the multi sensor. In the related list "Responds to Probes", the script will be processed first.

new DiscoveryJSONIDSensor({
    //
    // this sensor uses the common script include class "DiscoveryJSONIDSensor"
    //
	after: function() {
		this.ci_data = this.ciData.getData();
		var shouldTriggerPackages = this.ci_data['solaris11'] == 'true';
		var probe;
		
		if (shouldTriggerPackages) {
			probe = SncProbe.get('Solaris - OS Packages');
			probe.addParameter("probe_name", "Solaris - OS Packages");
		} else {
			probe = SncProbe.get('Solaris - OS Patches');
			probe.addParameter("probe_name", "Solaris - OS Patches");
		}

		probe.addParameter("ci_sys_id", this.getCmdbRecord().sys_id);
		probe.addParameter("port", this.getParameter("port"));
		probe.addParameter("os_type", "SOLARIS");
		probe.addParameter("protocol", "SSH");
		probe.setTopic("SSHCommand");
		probe.setSource(g_probe.getSource());
		probe.setCorrelator(g_probe.getCorrelator());
		probe.setMidSelectDetails(this.getParameter("mid_selector_details"));
		probe.create(g_probe.getAgent(), g_probe.getEccQueueId());
	},
    type: "Solaris Identity"
});
