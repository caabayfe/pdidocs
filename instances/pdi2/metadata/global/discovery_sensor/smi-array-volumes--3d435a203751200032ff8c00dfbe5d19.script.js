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
		this.defineTriggeredProbe('controllers', 'SMI - Array - Controllers');
		this.defineInstanceRelation('pool.volume', 'Allocated from::Allocated to', 'cmdb_ci_storage_volume', ['lun', 'correlation_id'], { retireMissing: false });

		var correlationId = this.sha1(deviceId);
		for (var i = 0, n = results.volumes.length; i < n; ++i) {
			var volume = results.volumes[i];

			var dataSize = new StorageDataSize((parseInt(volume.NumberOfBlocks) || 0) * (parseInt(volume.BlockSize) || 0));

			var volumeci = new CIData({
				sys_class_name: 'cmdb_ci_storage_volume',
				correlation_id: correlationId,
				name: volume.ElementName,
				lun: volume.DeviceID,
				short_description: volume.ElementName
			});
			dataSize.applyToStorageVolumeSize(volumeci);

			var locationId = this.getLocationID();
			if (!gs.nil(locationId))
				volumeci.data.location = locationId;

			this.addRelated('pool.volume', volumeci);
			this.triggerBatch('controllers', volume, volumeci);
		}
	},

	versionEra: 'berlin',
	type: 'SmiArrayVolumeSensor'
});
