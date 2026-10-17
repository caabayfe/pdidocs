new DiscoveryJSONSensor({

	processJSON: function() {
		this.fileSystems = related_data.fileSystems;
		if (JSUtil.nil(this.fileSystems))
			return;

		this.updateFileSystems();
		this.save();
		this.setDefaultSave(false);
	},

	updateFileSystems : function() {
		var device = this.getCmdbRecord();
		// Apparently device.sys_id only looks like a string.  Convert it to a real string.
		var deviceSysId = device && ('' + device.sys_id);

		var fsList = [];
		for ( var fs in this.fileSystems) {
			var fileSystem = { computer: deviceSysId };
			fileSystem.name = this.fileSystems[fs].name;
			var size = new StorageDataSize(this.fileSystems[fs].capacity, 'MB');
			size.applyToStorageVolumeSize(fileSystem);
			var free_space = new StorageDataSize(this.fileSystems[fs].available_space, 'MB');
			free_space.applyToStorageVolumeFreeSpace(fileSystem);
			fileSystem.mount_point = fs;

			fsList.push(fileSystem);
		}

		this.addToRelatedList('cmdb_ci_file_system', fsList, 'provided_by', 'name, mount_point');
	},

	type: "DiscoveryJSONSensor"
});
