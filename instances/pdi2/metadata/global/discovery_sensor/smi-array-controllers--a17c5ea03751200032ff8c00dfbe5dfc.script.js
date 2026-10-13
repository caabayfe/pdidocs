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
		this.defineTriggeredProbe('ports', 'SMI - Array - Ports');
		this.defineInstanceRelation('volume.controller', 'Uses::Used by', 'cmdb_ci_storage_controller', ['device_id', 'correlation_id'], { direction: 'downstream' });
		
		var correlationId = this.sha1(deviceId);
		for (var i = 0, n = results.controllers.length; i < n; ++i) {
			var controller = results.controllers[i];
			var controllerCi = new CIData({
				sys_class_name: 'cmdb_ci_storage_controller',
				correlation_id: correlationId,
				name: controller.ElementName || controller.DeviceID,
				device_id: controller.DeviceID,
				short_description: controller.ElementName
			});
			
			var locationId = this.getLocationID();
			if (!gs.nil(locationId))
				controllerCi.data.location = locationId;
			
			this.addRelated('volume.controller', controllerCi);
			this.triggerBatch('ports', controller, controllerCi);
		}
	},
	
	versionEra: 'berlin',
	type: 'SmiArrayControllerSensor'
});
