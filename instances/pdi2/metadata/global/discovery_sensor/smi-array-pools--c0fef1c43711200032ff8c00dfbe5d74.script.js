new CimSensor({
	BYTES_IN_GIGABYTE: 1073741824,

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
		this.defineTriggeredProbe('volumes', 'SMI - Array - Volumes');
		this.defineTriggeredProbe('disks', 'SMI - Array - Disks');
		this.defineInstanceRelation('computer.pool', 'Provided by::Provides', 'cmdb_ci_storage_pool', ['pool_id', 'correlation_id']);

		var correlationId = this.sha1(deviceId);
		for (var i = 0, n = results.pools.length; i < n; ++i) {
			var pool = results.pools[i];
			var size = new StorageDataSize(pool.TotalManagedSpace);
			var poolci = new CIData({
				sys_class_name: 'cmdb_ci_storage_pool',
				correlation_id: correlationId,
				name: ( pool.ElementName || pool.PoolID ),
				pool_id: pool.PoolID
			});
			size.applyToStoragePoolSize(poolci);

			var locationId = this.getLocationID();
			if (!gs.nil(locationId))
				poolci.data.location = locationId;

			this.addRelated('computer.pool', poolci);
			this.triggerBatch('volumes', pool, poolci);
			this.triggerBatch('disks', pool, poolci);
		}
	},

	versionEra: 'berlin',
	type: 'SmiArrayPoolSensor'
});
