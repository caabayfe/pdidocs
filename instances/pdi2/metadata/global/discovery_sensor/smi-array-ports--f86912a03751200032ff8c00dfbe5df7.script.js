new CimSensor({
	BPS_TO_GFC: {
		0: 0,
		1062500000: 1,
		2125000000: 2,
		4250000000: 4,
		8500000000: 8,
		10518750000: 10,
		14025000000: 16,
		21037500000: 20,
		28500000000: 32
	},
   
	convertBPSToGFC: function(bps) {
		return ( this.BPS_TO_GFC[bps] !== undefined ? this.BPS_TO_GFC[bps] : bps );
	},
   
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
		this.defineInstanceRelation('controller.port', 'Provides::Provided by', 'cmdb_ci_fc_port', ['wwpn', 'controller']);
		
		var correlationId = this.sha1(deviceId);
		this._wwpns = [];
		
		for (var i = 0, n = results.ports.length; i < n; ++i) {
			var port = results.ports[i];
			var portci = new CIData({
				sys_class_name: 'cmdb_ci_fc_port',
				correlation_id: correlationId,
				name: port.ElementName,
				wwpn: port.PermanentAddress,
				speed: this.convertBPSToGFC(port.Speed),
				short_description: port.ElementName,
				computer: deviceId,
				controller: instanceId
			});
			
			var locationId = this.getLocationID();
			if (!gs.nil(locationId))
				portci.data.location = locationId;
			
			this.addRelated('controller.port', portci);
			this._wwpns.push(portci.data.wwpn);
		}
	},
	
	afterReconcile: function() {
		CimSensor.prototype.afterReconcile.apply(this, arguments);
		
		var volumeGr = new GlideRecord('cmdb_ci_storage_volume');
		var volumeSysId = this.getParameter('volume_sysid');
		if (!volumeGr.get(volumeSysId))
			return;
		
		new DiscoveryStorageAllocationReconciler().relateSanTargetVolumeToInitiatorDisks(volumeGr, this._wwpns);
	},
	
	versionEra: 'berlin',
	type: 'SmiArrayPortSensor'
});
