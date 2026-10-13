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
		this.defineInstanceRelation('computer.fileshare', 'Provided By::Provides', 'cmdb_ci_storage_fileshare', ['name', 'path', 'correlation_id']);

		var correlationId = this.sha1(deviceId);
		var discoveryCorrelationId = this.sha1(this.getAgentCorrelator());
		
		for (var i = 0, n = results.fileshares.length; i < n; ++i) {
			var fileshare = results.fileshares[i];
			var path = ( fileshare.ElementName || fileshare.Name );
			if (path.charAt(0) !== '/') {
				if (!gs.nil(fileshare.Name) && fileshare.Name.charAt(0) === '/' && fileshare.Name.length > 1)
					path = fileshare.Name;
				else
					path = '/' + path;
			}
			
			var fileshareci = new CIData({
				sys_class_name: 'cmdb_ci_storage_fileshare',
				correlation_id: correlationId,
				name: fileshare.ElementName,
				fileshare_id: discoveryCorrelationId,
				path: path
			});
			
			var locationId = this.getLocationID();
			if (!gs.nil(locationId))
				fileshareci.data.location = locationId;

			this.addRelated('computer.fileshare', fileshareci);
			this.addFileshareToReconcile(fileshareci);
		}
	},
	
	/**
	 * Add the fileshare to the list to be reconciled in afterReconcile.
	 */
	addFileshareToReconcile: function(fileshareci) {
		if (this._fileshares === undefined)
			this._fileshares = [];
		
		this._fileshares.push(fileshareci);
	},
	
	/**
	 * Called during CimSensor.after(), after relationships are saved, before probes are triggered.
	 * @override
	 */
	afterReconcile: function() {
		var reconciler = new DiscoveryStorageAllocationReconciler();
		for (var i=0; i < this._fileshares.length; i++)
			reconciler.reconcileExport(this._deviceId, this._fileshares[i]);	
	},
	
	versionEra: 'berlin',
	type: 'SmiArrayFileShareSensor'
});
