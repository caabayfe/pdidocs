(function() {
	var gr, eccPayload, parms, name,
		topic = (current.topic + '').toLowerCase(),
		usesPowershellSession = '"{mid.windows.management_protocol}".toLowerCase() == "winrm" ? 1 : 0';

	// Topic powershell uses session pool when management protocol is WinRM
	if (topic == 'powershell')
		return usesPowershellSession;

	eccPayload = EccPayload(current);
	parms = eccPayload.getProbeParameters(0);

	if (topic == 'wmirunner') {
		// WMIRunner uses a powershell session when any of its parameters
		// is a powershell script
		gr = new GlideRecord('discovery_probe_parameter');
		gr.addQuery('probe', parms.probe);
		gr.addQuery('name', 'ENDSWITH', '.ps1');
		gr.setLimit(1);
		gr.addActiveQuery();
		gr.query();
		if (gr.next())
			return usesPowershellSession;
	} else if (parms.os_type.toLowerCase().startsWith('windows')) {
		// Patterns use the session pool any time the target is Windows
		return 1;
	}

	return 0;
})();
