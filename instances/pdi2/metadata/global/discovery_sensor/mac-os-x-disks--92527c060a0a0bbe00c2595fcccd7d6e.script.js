new DiscoverySensor({
	disks: [],
	diskSizeBytes: 0,
	process: function(result) {
		if (gs.nil(result.output))
			return;

		this.parseOutput(result.output);
	},

	parseOutput: function(output) {
		var DMPU = new DiscoveryMacProfileUtils();
		var baseElements = DMPU.getBaseElement(output);
		var section = baseElements;

		if (!section.length)
			return;

		this.processDisks(section);
	},

	processDisks: function(section) {
		for (var i = 0; i < section.length; i++) {
			if (section[i]._dataType == "SPSerialATADataType") {
				if (!section[i]._items.length)
					continue;

				this.processSerialATADisks(section[i]._items[0]._items);
			} else if (section[i]._dataType == "SPSASDataType") {
				if (!section[i]._items.length)
					continue;

				this.processSASDisks(section[i]._items[0]._items);
			} else if (section[i]._dataType == "SPFireWireDataType") {
				if (!section[i]._items.length)
					continue;

				this.processFireWireDisks(section[i]._items[0]._items);
			} else
				continue;
		}

		var diskSize = new StorageDataSize(this.diskSizeBytes);
		current.disk_space = Math.round(diskSize.to(StorageDataSize.Units.GB)) || 0;
		this.addToRelatedList('cmdb_ci_disk', this.disks, 'computer', 'name');
	},

	processSerialATADisks: function(items) {
		for (var i = 0; i < items.length; i++) {
			var diskDef = items[i];
			var vols = diskDef.volumes;

			for (var n = 0; n < vols.length; n++) {
				var vol = vols[n];
				var disk = {};
				disk.name = vol._name;
				disk.drive_type = 'disk';
				disk.volume_name = diskDef._name.trim();
				disk.volume_serial_number = diskDef.device_serial.trim();
				disk.device_id = vol.mount_point;
				disk.file_system = vol.file_system;
				var diskSize = this.getStorageDiskSize(vol.size);
				if (!gs.nil(diskSize)) {
					diskSize.applyToStorageDeviceSize(disk);
					this.diskSizeBytes += diskSize.getBytes();
				}
				this.disks.push(disk);
			}
		}
	},

	processSASDisks: function(items) {
		for (var i = 0; i < items.length; i++) {
			var diskDef = items[i];
			var disksInfo = diskDef._items;

			var dInfo = disksInfo[0];
			var disk = {};
			if (gs.nil(dInfo.bsd_name) || gs.nil(dInfo.bay_name.split))
				continue;
			disk.name = dInfo.bsd_name;
			disk.drive_type = 'disk';
			disk.volume_name = dInfo.bay_name.split("\"")[1];
			disk.volume_serial_number = dInfo.device_serial.trim();
			var diskSize = this.getStorageDiskSize(dInfo.size);
			if (!gs.nil(diskSize)) {
				diskSize.applyToStorageDeviceSize(disk);
				this.diskSizeBytes += diskSize.getBytes();
			}
			this.disks.push(disk);
		}
	},

	processFireWireDisks: function(items) {
		for (var i = 0; i < items.length; i++) {
			if (items[i].units === undefined)
				continue;

			for (var j = 0; j < items[i].units.length; j++) {
				if (items[i].units[j].units === undefined)
					continue;

				for (var k = 0; k < items[i].units[j].units.length; k++) {
					var diskDef = items[i].units[j].units[k];

					if (diskDef.volumes === undefined)
						continue;

					var vols = diskDef.volumes;

					for (var v = 0; v < vols.length; v++) {
						var vol = vols[v];
						var disk = {};
						disk.name = vol._name;
						disk.drive_type = 'disk';
						disk.volume_name = diskDef._name.trim();
						disk.device_id = vol.mount_point;
						disk.file_system = vol.file_system;
						var diskSize = this.getStorageDiskSize(vol.size);
						if (!gs.nil(diskSize)) {
							diskSize.applyToStorageDeviceSize(disk);
							this.diskSizeBytes += diskSize.getBytes();
						}
						this.disks.push(disk);
					}
				}
			}
		}
	},

	getStorageDiskSize: function(size) {
		if (size === "" || size === undefined)
			return null;

		var parts = ('' + size).split(" ", 2);
		var num = parseFloat(parts[0]);
		var factor = parts[1].toLowerCase();

		switch (factor) {
			case 'tb':  return new StorageDataSize(num, 'TB');
			case 'gb':  return new StorageDataSize(num, 'GB');
			case 'mb':  return new StorageDataSize(num, 'MB');
			case 'kb':  return new StorageDataSize(num, 'KB');
			default:	return new StorageDataSize(num, 'GB');
		}
	},

	type: "DiscoverySensor"
});
