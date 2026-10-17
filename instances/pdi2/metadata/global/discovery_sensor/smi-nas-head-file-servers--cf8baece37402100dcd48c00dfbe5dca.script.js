new CimSensor({
	/**
	 * Processes CIM Probe query results and updates ci/gr data where needed.
	 * @override
	 * @param { name: XMLObj(//cimquery/result/instance)[],.. } results
	 * @param string instanceId The ID of the probed CIM instance.
	 * @param string deviceId The ID of the classified device.
	 * @param string instanceToken The probed instance's CIM query token.
	 * @param string deviceToken The classified device's CIM query token.
	 * @param {} current Updates the g_device with injected fields at end of probe cycle.
	 * @throws DiscoveryException On error
	 */
	processCim: function(results, instanceId, deviceId, instanceToken, deviceToken, current) {
		this.defineTriggeredProbe('fileServerIPs', 'SMI - NAS Head - File Server IPs');
		this.defineTriggeredProbe('fileShares', 'SMI - NAS Head - File Shares');

		var correlationId = this.sha1(deviceId);
		for (var i = 0, n = results.fileServers.length; i < n; ++i) {
			var fileServer = results.fileServers[i];
			var fileServerCi = new CIData({});
			this.triggerBatch('fileShares', fileServer, fileServerCi);
			this.triggerBatch('fileServerIPs', fileServer, fileServerCi);
		}
	},
	
	versionEra: 'berlin',
	type: 'SmiNasHeadFileServerSensor'
});
