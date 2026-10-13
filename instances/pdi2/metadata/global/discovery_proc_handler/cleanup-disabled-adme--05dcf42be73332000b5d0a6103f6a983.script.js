(function(){
	var instanceName = gs.getProperty('instance_name', 'unregistered');
	var keyParams = current.key_parameters + "";

	if ((gs.getProperty('glide.discovery.enable_adme','false') == 'false') && keyParams.indexOf(instanceName) > -1) {
		DiscoveryLogger.info("ADME is disabled.  Uninstalling detected ADME collector.", "Discovery", this.getEccQueueId());

		var osType = g_probe.getParameter('os_type');

		if (JSUtil.nil(osType)) {
			DiscoveryLogger.warn("Unable to clean up the ADME collector because the OS cannot be determined.", "Discovery", this.getEccQueueId());
			return;
		}

		var isWindows = 'WINDOWS'.equals(osType.toUpperCase());
		var admeProbeName = isWindows ? 'Windows - ADM Enhanced' : 'Unix - ADM Enhanced';
		var admeModeParm = isWindows ? 'powershell_param_mode' : 'mode';

		// Create the ADME probe with parameters.
		var admeProbe = SncProbe.get(admeProbeName);
		admeProbe.setSource(g_probe.getSource());
		admeProbe.setEccPriority(g_probe.getParameter('priority'));
		admeProbe.addParameter(admeModeParm, 'UNINSTALL');
		admeProbe.addParameter('os_type', osType);
		admeProbe.addParameter('protocol', g_probe.getParameter('protocol'));
		admeProbe.addParameter('port', g_probe.getParameter('port'));
		admeProbe.addParameter('mid_selector_details', g_probe.getParameter('mid_selector_details'));
		admeProbe.create(g_probe.getAgent(), g_probe.getEccQueueId());
	}
})();
