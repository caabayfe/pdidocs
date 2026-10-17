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
		var ips = [];
		var masks = [];
		for (var i = 0, n = results.protocolEndpoints.length; i < n; ++i) {
			var protocolEndpoint = results.protocolEndpoints[i];
			if (protocolEndpoint.ProtocolIFType == 4096) { // only interested in IPs
				var ip = protocolEndpoint.IPv4Address;
				if (this.validIp(ip, ips)) {
					ips.push(ip);
					masks.push(protocolEndpoint.SubnetMask);
				}
			}
		}
		
		if (ips.length === 0)
			return;

		// trigger the CIM - DNS probe with the IPs list
		this.triggerDnsProbe('CIM - DNS', ips);

		var nic = {
			name: 'File Server Adapter',
			ip_address: ips[0],
			ip_addresses: ips,
			netmask: masks[0]
		};
	
		var mutexMetricName = 'SMI - NAS Head - File Server IPs';
		var mutexKey = this.sha1(deviceId + '::cmdb_ci_network_adapter');
		var mutex = new SelfCleaningMutex(mutexKey, mutexMetricName);
		if (mutex.get()) {
			try {
				var nicsGr = new GlideRecord('cmdb_ci_network_adapter');
				nicsGr.addQuery('cmdb_ci', this.getCmdbCi());
				nicsGr.addQuery('name', nic.name); // nfs, cifs
				nicsGr.query();
				var nicId = null;
				if (nicsGr.next()) {
					var nicGr = new GlideRecord('cmdb_ci_network_adapter');
					nicGr.get(nicsGr.sys_id);
					nicGr.ip_address = nic.ip_address;
					nicGr.netmask = nic.netmask;
					nicGr.update();
					nicGr.active = true;
					nicId = ''+nicGr.sys_id;
				} else {
					var nicGr = new GlideRecord('cmdb_ci_network_adapter');
					nicGr.name = nic.name;
					nicGr.ip_address = nic.ip_address;
					nicGr.netmask = nic.netmask;
					nicGr.cmdb_ci = this.getCmdbCi();
					nicGr.active = true;
					nicId = ''+nicGr.insert();
				}	
				
				// find all existing IPs
				var ipsGr = new GlideRecord('cmdb_ci_ip_address');
				ipsGr.addQuery('nic', nicId);
				ipsGr.query();
				var existingIps = [];
				while (ipsGr.next())
					existingIps.push(''+ipsGr.ip_address);
		
				// insert any IPs that do not already exist
				for (var i = 0; i < ips.length; ++i) {
					var found = false;
					for (var j = 0; !found && j < existingIps.length; ++j) {
						if (existingIps[j] == ips[i])
							found = true;
					}
		
					if (!found) {
						var gr = new GlideRecord('cmdb_ci_ip_address');
						gr.ip_address = ips[i];
						gr.netmask = masks[i];
						gr.nic = nicId;
						gr.insert();	
					}
				}
			} finally {
				mutex.release();
			}
		}
    },

	validIp: function(ip, addresses) {
		if (ip.match(/^(?:0|127)/)) // ignore invalid and local IPs
			return false;
		
		// check for dupes
		for (var i = 0, n = addresses.length; i < n; ++i) {
			if (addresses[i].ip_address == ip)
				return false;
		}

		return true;
	},
	
	versionEra: 'berlin',
	type: 'SmiNasHeadFileServerIpSensor'
});
