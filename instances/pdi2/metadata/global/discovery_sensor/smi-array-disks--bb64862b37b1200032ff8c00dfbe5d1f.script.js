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
		this.defineInstanceRelation('pool.disk', 'Allocated from::Allocated to', 'cmdb_ci_storage_disk', ['device_id', 'correlation_id'], { direction: 'downstream' });

		var correlationId = this.sha1(deviceId);
		for (var i = 0, n = results.disks.length; i < n; ++i) {
			var disk = results.disks[i];

			var dataSize = new StorageDataSize(disk.NumberOfBlocks * disk.BlockSize);

			var diskci = new CIData({
				sys_class_name: 'cmdb_ci_storage_disk',
				correlation_id: correlationId,
				name: ( disk.ElementName || disk.Name || disk.DeviceID ),
				device_id: disk.DeviceID
			});
			dataSize.applyToStorageDeviceSize(diskci);

			var locationId = this.getLocationID();
			if (!gs.nil(locationId))
				diskci.data.location = locationId;

			this.addRelated('pool.disk', diskci);
		}
	},

	versionEra: 'berlin',
	type: 'SmiArrayDiskSensor'
});
