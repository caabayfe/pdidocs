var DiscoverySolarisStorageSensor = Class.create();

DiscoverySolarisStorageSensor._PROBE_DELIMITER_REGEX = /\[\[==PROBE:(\w+)==\]\]/;

DiscoverySolarisStorageSensor.prototype = Object.extendsObject(DiscoverySensor, {
	init: function() {
		DiscoverySensor.prototype.init.apply(this, arguments);
	},

	process: function(result) {
		var results = this._parseResult(result.output);

		if (this.isDebugging())
			Debug.logObject('Solaris Storage Results', results);

		var deviceCi = this.getDeviceCi();
		this._descriptiveDiskNames = true;

		// pre-process linux <-> solaris device id mapping from the diff_iostat sub-probe for use by the disk processor
		this._deviceIdMap = this._parseIostatDiff(results);

		// process disks from the 'iostat' command
		this._processDisks(results, deviceCi);
		// process partitions from the 'prtvtoc' command
		this._processPartitions(results, deviceCi);
		// process zfs pools data from the 'zpool list' command
		this._processZfsPools(results, deviceCi);
		// process zfs pool member data from the 'zfs status' command
		this._processZfsPoolMembers(results, deviceCi);
		// process the df probe
		this._processFileSystems(results, deviceCi);
		// process the hba info
		this._processHbaInfo(results, deviceCi);

		// aggregate all attached disk space and update device capacity as an integer
		var totalBytes = DiscoveryStorageUtilities.getAggregateDataSize(deviceCi);
		deviceCi.data.disk_space = new StorageDataSize(totalBytes).to(StorageDataSize.Units.GB) | 0;
	},

	after: function() {
		DiscoverySensor.prototype.after.apply(this, arguments);
		this._reconcileNas();
	},

	/**
	 * Processes disks based on the results returned from the 'iostat' command.
	 * Associates the new disk Ci to the device Ci via reference.
	 */
	_processDisks: function(results, deviceCi) {
		if (typeof results.iostat === 'undefined') {
			this.warn('No disk results were returned.');
			return;
		}

		var ciSchema = this.getCiSchema();
		var storageReconciler = new DiscoveryStorageAllocationReconciler({ ciSchema: ciSchema });
		var iostatData = this._parseIostat(results.iostat);

		for (var i = 0; i < iostatData.length; ++i) {
			var data = iostatData[i];

			// use the first word as the vendor
			var makeModel = MakeAndModelJS.fromNames(data.Vendor, data.Product, 'hardware');
			// size
			var matches = data.Size.match(/<(\d+) bytes>/);
			var size = new StorageDataSize( matches ? matches[1] : 0 );
			// defaults
			var table = 'cmdb_ci_disk';
			var storageType = 'disk';
			var deviceInterface = 'scsi';

			// determine whether it's an iscsi disk and reset defaults if it is
			var iscsiDevice = this._findIscsiDevice(results, data.deviceId);
			if (iscsiDevice !== null) {
				table = 'cmdb_ci_iscsi_disk';
				storageType = 'network';
				deviceInterface = 'iscsi';
			}

			// create the disk Ci
			var diskCi = ciSchema.createCi(table, {
				name: data.deviceId,
				device_id: data.deviceId,
				storage_type: storageType,
				device_interface: deviceInterface,
				serial_number: ( data['Serial No'] || null ),
				manufacturer: ''+makeModel.getManufacturerSysID(),
				model_id: ''+makeModel.getModelNameSysID(),
				computer: deviceCi,
				'interface': deviceInterface, // deprecated
				drive_type: storageType // deprecated
			});
			size.applyToStorageDeviceSize(diskCi);

			// associate the disk ci with the device ci.
			deviceCi.addReferral(diskCi);

			// append data for specific tables
			switch (table) {
			case 'cmdb_ci_iscsi_disk':
				diskCi.data.iqn = iscsiDevice.targetIqn;
				diskCi.data.device_lun = iscsiDevice.lun;
				diskCi.data.initiator_iqn = results.sys_iscsi_initiator;

				// attempt to relate to upstream volume on array
				try {
					storageReconciler.createISCSIDiskCiToVolumeRel(diskCi);
				} catch (e) {
					if (this.isDebugging())
						this.warn(e);
				}

				break;
			}

			if (this.isDebugging())
				Debug.logObject('Disk CI', diskCi.toShallowObj());
		}
	},

	/**
	 * Processes partitions based on results returned from the 'prtvtoc' command.
	 * Associates the new partition Ci to its corresponding disk Ci as well as the device Ci, both by reference.
	 */
	_processPartitions: function(results, deviceCi) {
		if (typeof results.prtvtoc === 'undefined') {
			this.warn('No partition results were returned.');
			return;
		}

		var ciSchema = this.getCiSchema();
		var diskCis = deviceCi.getReferrals('cmdb_ci_storage_device');
		var tocsData = this._parsePrtvtoc(results.prtvtoc);

		for (var i = 0; i < tocsData.length; ++i) {
			var tocData = tocsData[i];
			var diskCi = this._findDiskCi(tocData.deviceId, diskCis);
			if (diskCi === null) {
				this.warn('Unable to find disk Ci for partition result: ' + tocData.deviceId);
				continue;
			}

			for (var j = 0; j < tocData.partitions.length; ++j) {
				var data = tocData.partitions[j];
				var size = new StorageDataSize(data.sectorCount * tocData.bytesPerSector);
				var partitionCi = ciSchema.createCi('cmdb_ci_disk_partition', {
					name: diskCi.data.device_id + 's' + data.partition,
					partition_number: data.partition,
					start_offset: (data.firstSector * tocData.bytesPerSector),
					end_offset: (data.lastSector * tocData.bytesPerSector),
					computer: deviceCi,
					disk: diskCi
				});
				size.applyToDiskPartitionSize(partitionCi);

				deviceCi.addReferral(partitionCi);
				diskCi.addReferral(partitionCi);

				if (this.isDebugging())
					Debug.logObject('Partition CI', partitionCi.toShallowObj());
			}
		}
	},

	_toBytes: function(sizeStr) {
		var matches = sizeStr.match(/(\d+(?:\.\d+))(\w+)/);
		if (!matches )
			return 0;

		var num = matches[1];
		var unit = matches[2];

		var multipliers = {
			G: 1024 * 1024 * 1024,
			GB: 1024 * 1024 * 1024,
			M: 1024 * 1024,
			MB: 1024 * 1024,
			K: 1024,
			KB: 1024,
			b: 1
		};

		var size = parseFloat(num);
		var multiplier = multipliers[unit];

		if (isNaN(size) || typeof multiplier === 'undefined')
			return 0;

		return Math.round(size * multiplier);
	},

	_processZfsPools: function(results, deviceCi) {
		if (typeof results.zpool_list === 'undefined') {
			this.warn('No ZFS pool results were returned.');
			return;
		}

		var ciSchema = this.getCiSchema();
		var diskCis = deviceCi.getReferrals('cmdb_ci_storage_device');
		var zfsPoolsData = this._parseZpoolList(results.zpool_list);

		for (var i = 0; i < zfsPoolsData.length; ++i) {
			var data = zfsPoolsData[i];

			var size = new StorageDataSize(this._toBytes(data.size));
			var rawFree = ('free' in data) ? data.free : data.avail; // data.avail for Solaris older than "10 9/10 release"
			var free_space = new StorageDataSize(this._toBytes(rawFree));
			var zfsPoolCi = ciSchema.createCi('cmdb_ci_storage_pool', {
				name: data.name,
				pool_id: data.name,
				hosted_by: deviceCi
			});
			size.applyToStoragePoolSize(zfsPoolCi);
			free_space.applyToStoragePoolFreeSpace(zfsPoolCi);

			deviceCi.addReferral(zfsPoolCi);

			if (this.isDebugging())
				Debug.logObject('ZFS Pool CI', zfsPoolCi.toShallowObj());

		}
	},

	_processZfsPoolMembers: function(results, deviceCi) {
		if (typeof results.zpool_status === 'undefined') {
			this.warn('No ZFS pool member results were returned.');
			return;
		}

		var ciSchema = this.getCiSchema();
		var diskCis = deviceCi.getReferrals('cmdb_ci_storage_device');
		var partitionCis = deviceCi.getReferrals('cmdb_ci_disk_partition');
		var poolCis = deviceCi.getReferrals('cmdb_ci_storage_pool');
		var zfsPoolMembersData = this._parseZpoolStatus(results.zpool_status);

		for (var poolName in zfsPoolMembersData) {
			var data = zfsPoolMembersData[poolName];

			var poolCi = this._findPool(poolName, poolCis);
			if (poolCi === null) {
				this.warn('ZFS Member pool Ci not found: ' + poolName);
				continue;
			}

			var storageCi = this._findPoolMemberStorage(data.name, diskCis, partitionCis);
			if (storageCi === null) {
				if (this._descriptiveDiskNames)
					this.warn('ZFS Member storage Ci not found: ' + data.name);
				continue;
			}

			var zfsPoolMemberCi = ciSchema.createCi('cmdb_ci_storage_pool_member', {
				pool: poolCi,
				storage: storageCi
			});

			poolCi.addReferral(zfsPoolMemberCi);
			storageCi.addReferral(zfsPoolMemberCi);

			if (this.isDebugging())
				Debug.logObject('ZFS Pool Member CI', zfsPoolMemberCi.toShallowObj());

		}
	},

	/**
	 * Processes file systems based on the results returned from the 'df' command.
	 * Associates each new file system Ci with the deviceCi as well as with the providing partition Ci or pool Ci, both by reference.
	 */
	_processFileSystems: function(results, deviceCi) {
		if (typeof results.df === 'undefined') {
			this.warn('No file system results were returned.');
			return;
		}

		var ciSchema = this.getCiSchema();
		var volumeToDiskMapper = new DiscoveryVolumeToDiskMapper({ debug: this.isDebugging() });
		var storageReconciler = new DiscoveryStorageAllocationReconciler({ ciSchema: ciSchema });
		var poolCis = deviceCi.getReferrals('cmdb_ci_storage_pool');
		var partitionCis = deviceCi.getReferrals('cmdb_ci_disk_partition');
		var fileSystemsData = this._parseDf(results.df);

		for (var i = 0; i < fileSystemsData.length; ++i) {
			var data = fileSystemsData[i];

			var nasInfo = storageReconciler.getNASInfo(data.name);
			var table, mediaType;
			if (nasInfo) {
			   table = "cmdb_ci_nas_file_system";   
			   mediaType = "network";
			}
			else {
			   table = "cmdb_ci_file_system";
			   mediaType = "fixed";
			}   

			var providedByCi = this._findFileSystemProvider(data.name, partitionCis, poolCis);
			var size = new StorageDataSize(( data.size || 0 ) * 1024);
			var free_space = new StorageDataSize(( data.freeSpace || 0 ) * 1024);

			var fileSystemCi = ciSchema.createCi(table, {
				name: data.name,
				mount_point: data.mountPoint,
				media_type: mediaType,
				provided_by: providedByCi,
				computer: deviceCi,
				nas_path: nasInfo ? nasInfo.path : null,
				nas_hostname : nasInfo ? nasInfo.hostname : null,
				nas_ip_address : nasInfo && nasInfo.ip ? nasInfo.ip : null
				// TODO: Where to get nas_protocol?
			});
			size.applyToStorageVolumeSize(fileSystemCi);
			free_space.applyToStorageVolumeFreeSpace(fileSystemCi);

			deviceCi.addReferral(fileSystemCi);

			if (providedByCi !== null) {
				providedByCi.addReferral(fileSystemCi);
				volumeToDiskMapper.relateStorageDevice(fileSystemCi);
			}

			if (this.isDebugging())
				Debug.logObject('File System CI', fileSystemCi.toShallowObj());
		}
	},

	/**
	 * Reconciles any NAS file systems with its remote provider.
	 * Called after() updating.
	 */
	_reconcileNas: function(deviceCi) {
		var deviceId = ''+this.getCmdbCi();

		var reconciler = new DiscoveryStorageAllocationReconciler();
		reconciler.reconcileFileSystemByServer(deviceId);	
	},

	/**
	 * Transforms probe results into a hashmap of lines per sub-probe.
	 * Sub-probes are defined by the marker: [[==PROBE:<subProbe>==]] where subProbe is the key of the results returned.
	 * @param {} result The probe's result.output.
	 * @return {string subProbe:string[] outputLines}
	 */
	_parseResult: function(result) {
		var splits = result.split(DiscoverySolarisStorageSensor._PROBE_DELIMITER_REGEX);
		var results = {};

		for (var i = 1; i < splits.length; i += 2) {
			var key = splits[i];
			if (key === 'iscsi_session') {
				var parsed = new DiscoveryIndentedMarkup({ pluralRoot: true }).parse(splits[i+1].trim());
				results[key] = ( gs.nil(parsed.iscsiSession) ? [] : parsed.iscsiSession );
				break;
			}

			var lines = splits[i+1].trim().split('\n');

			results[key] = [];
			for (var j = 0; j < lines.length; ++j) {
				var line = lines[j].trim();
				line && results[key].push(line);
			}
		}

		var initiator = ''+results.sys_iscsi_initiator[0];
		if (initiator) {
			initiator = initiator.split(':');
			if (initiator) {
				initiator.shift();
				results.sys_iscsi_initiator = initiator.join(':').trim();
			}
		}

		return results;
	},

	/**
	 * @param string[] lines
	 * @return {string solarisId:string linuxId}
	 */
	_parseIostatDiff: function(lines) {
		var map = {};

		for (var i = 0; i < lines.length; i+=2)
			map[lines[i+1].trim()] = lines[i].trim();

		return map;
	},

	/**
	 * Parses the 'iostat' command output and returns an hashmap representing
	 *  each field/value for each device.
	 * 
	 *  Each device is represented by multiple lines.
	 *  We combine each device's lines into one, then match regex against it
	 *
	 *  Typical input record:
	 *  
	 *  c4t0d0           ,Soft Errors: 0 ,Hard Errors: 0 ,Transport Errors: 0 
	 *  Vendor: VMware   ,Product: Virtual disk     ,Revision: 1.0  ,Serial No:  
	 *  Size: 21.47GB &lt;21474836480 bytes&gt;
	 *  ,Media Error: 0 ,Device Not Ready: 0 ,No Device: 0 ,Recoverable: 0 
	 *  Illegal Request: 0 ,Predictive Failure Analysis: 0
	 *
 	 *  Field format - "Field Name: Field Value ," or "Field Name: Field Value\n"
	 *
	 * @param string[] lines
	 * @return {string fieldName:string value}[]
	 */
	_parseIostat: function(lines) {
		var ioStatRecordHdrRegex = /^((c|s)\w+)\s+,/;
		var records = [];
		var curRecord = {};

		// Walk backward, parsing lines into fields until next record boundary
		while (lines.length) {
			var curLine = lines.pop();
			var fields = curLine.split(',');
			for (var i = 0; i < fields.length; i++) {
				var field = fields[i].split(':');
				if (field && field.length == 2)
					curRecord[field[0].trim()] = field[1].trim();
			}

			// When we find a record boundary, output and clear collected fields
			var hdrMatches = curLine.match(ioStatRecordHdrRegex);
			if (hdrMatches) {
				curRecord.deviceId = hdrMatches[1];
				records.push(curRecord);
				// PRB716750: On some virtualized server "iostat -n" does not return the descriptive
				// names and therefore will not be found when processing pool members.  In that case
				// there's not much we can do, so just disable the warnings.
				// The regex probably can be simplified, requires more test though.
				var descriptiveRegex = /(([cdts][0-9|A-F|a-f]+)*([cdts][0-9|A-F|a-f])+)/;
				var matches = curRecord.deviceId.match(descriptiveRegex);
				if (!matches[0].equals(curRecord.deviceId)) {
					this._descriptiveDiskNames = false;
				}
				curRecord = {};
			}
		}

		if (this.isDebugging())
			Debug.logObject('iostat Data', records);

		return records;
	},

	/**
	 * Parses the 'prtvoc' command output and returns an hashmap representing each field/value for each partition.
	 *
	 ** Example results:
	 *   [0]: Object
	 *     deviceId: string = c5t6d0
	 *     bytesPerSector: string = 512
	 *     partitions: Array of 2 elements
	 *     [0]: Object
	 *       lastSector: string = 4186111
	 *       mountDirectory: null = /mnt/foobar
	 *       firstSector: string = 0
	 *       sectorCount: string = 4186112
	 *       partition: string = 2
	 *       flags: string = 01
	 *       tag: string = 5
	 *     [1]: Object
	 *       lastSector: string = 4095
	 *       mountDirectory: null = null
	 *       firstSector: string = 0
	 *       sectorCount: string = 4096
	 *       partition: string = 8
	 *       flags: string = 01
	 *       tag: string = 1
	 **
	 * @param string[] lines
	 * @return {string fieldName:string value}[]
	 */
	_parsePrtvtoc: function(lines) {
		var results = [];
		// { string deviceId:string[] lines }
		var deviceLineMap = {};

		// build deviceLineMap. each value will be an array of lines corresponding to that deviceId
		var currentDeviceId = null;
		var currentDeviceLines = [];
		for (var i = 0; i < lines.length; ++i) {
			var line = lines[i];

			// attempt to find the opening "* /dev/rdsk/<deviceId> partition map" line
			var matches = line.match(/^\*\s+\/dev\/rdsk\/(\w+)/);
			if (matches !== null) {
				// store the previous set of lines if this isn't the first iteration
				if (currentDeviceId !== null)
					deviceLineMap[currentDeviceId] = currentDeviceLines;

				currentDeviceId = matches[1].trim();
				currentDeviceId = currentDeviceId.substring(0, currentDeviceId.length - 2); // remove the trailing slice number 's2'
				currentDeviceLines = []; // skip the opening line, not needed
			} else {
				currentDeviceLines.push(line);
			}
		}

		// push the last set
		if (currentDeviceId !== null)
			deviceLineMap[currentDeviceId] = currentDeviceLines;

		for (var deviceId in deviceLineMap) {
			var deviceLines = deviceLineMap[deviceId];
			var data = { deviceId: deviceId };

			for (var i = 0; i < deviceLines.length; ++i) {
				var line = deviceLines[i];

				// find the bytes per sector from the Dimensions: table
				if (typeof data.bytesPerSector === 'undefined') {
					var matches = line.match(/^\*\s+(\d+) bytes\/sector/);
					if (matches !== null)
						data.bytesPerSector = ( parseInt(matches[1].trim()) || 0 );

					continue;
				// next, find the partition table
				} else if (typeof data.partitions === 'undefined') {
					var matches = line.match(/^\*\s+Partition/);
					if (matches !== null)
						data.partitions = [];

					continue;
				// process the partition table
				} else {
					// find a data line. line has already been trimmed, so no leading \s+
					if (!line.match(/^\d+\s+/))
						continue;

					// columns are separated by whitespace
					var columns = line.split(/\s+/);
					var partitionData = {
						partition: columns[0],
						tag: columns[1],
						flags: columns[2],
						firstSector: (parseInt(columns[3]) || 0),
						sectorCount: (parseInt(columns[4]) || 0),
						lastSector: (parseInt(columns[5]) || 0),
						mountDirectory: columns[6] || null
					};

					data.partitions.push(partitionData);
				}
			}

			results.push(data);
		}

		if (this.isDebugging())
			Debug.logObject('prtvtoc Results', results);

		return results;
	},

	/**
	 * Parses the 'zpool list' command output and returns an hashmap representing each field/value for each zpool.
	 *
	 ** Example results
	 * [0]: Object
	 *   free: string = 14.2G  (prop named "avail" in Solaris older than "10 9/10 release"
	 *         per per http://docs.oracle.com/cd/E19253-01/819-5461/gjygg/index.html)
	 *   dedup: string = 1.00x
	 *   health: string = ONLINE
	 *   altroot: string = -
	 *   size: string = 19.9G
	 *   alloc: string = 5.69G  (prop name "used" in Solaris older than "10 9/10 release"
	 *          per http://docs.oracle.com/cd/E19253-01/819-5461/gjygg/index.html)
	 *   name: string = rpool
	 *   cap: string = 28%
	 **
	 * @param string[] lines
	 * @return {string fieldName:string value}[]
	 */
	_parseZpoolList: function(lines) {
		if (lines.length < 2)
			return [];

		var results = [];

		// parse column headers on first line
		var headerLine = lines[0];
		var headers = headerLine.split(/\s+/);
		if (headers === null)
			return [];

		// convert to lower case
		for (var i = 0; i < headers.length; ++i)
			headers[i] = headers[i].toLowerCase();

		for (var i = 1; i < lines.length; ++i) {
			var columns = lines[i].split(/\s+/);
			var data = {};
			for (var h = 0; h < headers.length; ++h)
				data[headers[h]] = columns[h];

			results.push(data);
		}

		if (this.isDebugging())
			Debug.logObject('zpool list Results', results);

		return results;
	},

	/**
	 * Parses the 'zpool status' command output and returns an hashmap representing each field/value for each zpool member.
	 *
	 ** Example result
	 * Object:
	 *   rpool: Object
	 *     read: string = 0
	 *     state: string = ONLINE
	 *     write: string = 0
	 *     name: string = c4t0d0s0
	 *     cksum: string = 0
	 **
	 * @param string[] lines
	 * @return {string poolId:{string fieldName:string value}}
	 */
	_parseZpoolStatus: function(lines) {
		if (lines.length < 2)
			return {};

		var results = {};

		// parse column headers on first line
		var headerLine = lines[0];
		var headers = headerLine.split(/\s+/);
		if (headers === null)
			return [];

		// convert to lower case
		for (var i = 0; i < headers.length; ++i)
			headers[i] = headers[i].toLowerCase();

		var currentPoolId = null;

		for (var i = 1; i < lines.length; ++i) {
			var columns = lines[i].split(/\s+/);

			// if it's a pool name, update the current id and continue;
			var matches = columns[0].match(/^c\w+/);
			if (matches === null) {
				currentPoolId = columns[0];
				continue;
			}

			var data = {};
			for (var h = 0; h < headers.length; ++h)
				data[headers[h]] = columns[h];

			results[currentPoolId] = data;
		}

		if (this.isDebugging())
			Debug.logObject('zpool status Results', results);

		return results;
	},

	_parseDf: function(lines) {
		var results = [];

		for (var i = 0; i < lines.length; ++i) {
			var line = lines[i];

			// if this line was split due to length, combine this line with the following
			if (line.indexOf(' ') === -1 && (i + 1) < lines.length && lines[(i + 1)].match(/^\d+/)) {
				line = line + ' ' + lines[(i+1)].trim();
				++i;
			}

			// neither local nor remote (cifs/nfs)
			if (!line.startsWith('/dev/') && !line.startsWith('//') && !line.match(/^\w+\/\w+/) && line.indexOf(':') === -1)
				continue;

			var columns = line.split(/\s+/);
			var data = {
				name: columns[0],
				size: columns[1],
				freeSpace: columns[3],
				mountPoint: columns[5]
			};

			results.push(data);
		}

		if (this.isDebugging())
			Debug.logObject('df Results', results);

		return results;
	},

	/**
	 * @param string solarisDeviceId
	 * @return string|null The legacy "linux" device id (sd0, sr1, etc.) for the given "Solaris" device id (c0t1d0s2, c1t0d0s5, etc.) or null if not found.
	 */
	_findLinuxDeviceId: function(solarisDeviceId) {
		return ( this._deviceIdMap[solarisDeviceId] || null );
	},

	/**
	 * @param partitionName The solaris partition/slice id
	 * @param Ci[] An array of disk Cis to search against
	 * @return Ci|null A disk Ci or NULL if not found.
	 */
	_findDiskCi: function(deviceId, diskCis) {
		for (var i = 0; i < diskCis.length; ++i) {
			var diskCi = diskCis[i];
			if (diskCi.data.device_id === deviceId)
				return diskCi;
		}

		return null;
	},

	_findPool: function(poolId, poolCis) {
		for (var i = 0; i < poolCis.length; ++i) {
			var poolCi = poolCis[i];
			if (poolCi.data.pool_id === poolId)
				return poolCi;
		}

		return null;
	},

	_findPartition: function(diskId, partitionNumber, partitionCis) {
		for (var i = 0; i < partitionCis.length; ++i) {
			var partitionCi = partitionCis[i];
			var diskCi = partitionCi.data.disk;

			if (diskCi.data.device_id === diskId && partitionCi.data.partition_number === partitionNumber)
				return partitionCi;
		}

		return null;
	},

	_findPartitionByName: function(name, partitionCis) {
		for (var i = 0; i < partitionCis.length; ++i) {
			var partitionCi = partitionCis[i];
			if (partitionCi.data.name == name)
				return partitionCi;
		}

		return null;
	},

	_findFileSystemProvider: function(fileSystemName, partitionCis, poolCis) {
		// match against ZFS pools
		var matches = fileSystemName.match(/^(\w+)\/\w+/);
		if (matches !== null) {
			var poolName = matches[1];
			var poolCi = this._findPool(poolName, poolCis);
			if (poolCi !== null)
				return poolCi;
		}

		// match against partitions
		var matches = fileSystemName.match(/^\/dev\/(?:dsk\/)?(.+)$/);
		if (matches != null) {
			var partitionCi = this._findPartitionByName(matches[1], partitionCis);
			if (partitionCi !== null)
				return partitionCi;
		}

		return null;
	},

	_findPoolMemberStorage: function(storageDeviceId, diskCis, partitionCis) {
		// match against partition
		var matches = storageDeviceId.match(/(\w+)s(\d+)$/);
		if (matches !== null) {
			var deviceId = matches[1];
			var partitionNumber = matches[2];
			var partitionCi = this._findPartition(deviceId, partitionNumber, partitionCis);
			if (partitionCi !== null)
				return partitionCi;
		}

		// match against disk
		var matches = storageDeviceId.match(/(\w+)$/);
		if (matches !== null) {
			var deviceId = matches[1];
			var diskCi = this._findDiskCi(deviceId, diskCis);
			if (diskCi !== null)
				return diskCi;
		}

		return null;
	},

	/**
	 * @param {} results The parsed probe results
	 * @param string deviceId
	 * @return {}|null Returns an iscsi session hashmap parsed from the probe results
	 */
	_findIscsiDevice: function(results, deviceId) {
		for (var i = 0; i < results.iscsi_session.length; ++i) {
			var iscsiSession = results.iscsi_session[i];

			var devices = g_array_util.ensureArray(iscsiSession.device);
			for (var j = 0; j < devices.length; j++) {
				var device = devices[j];
				var sessionDeviceId = device.id;
				// remove the slice number
				sessionDeviceId = sessionDeviceId.substring(0, sessionDeviceId.length - 2);
				if (sessionDeviceId === deviceId) {
					device.targetIqn = iscsiSession.targetIqn;
					return device;
				}
			}
		}

		return null;
	},
	
	
	/**
	 * Parses the 'fcinfo hba-port' command output  
	 **/
	_processHbaInfo: function(results, deviceCi) {
		
		if (typeof results.fcinfo_hba === 'undefined') {
			this.warn ('No HBA results were returned.');
			return;
		}

		if (results.fcinfo_hba.length == 1 && results.fcinfo_hba[0].indexOf ("No Adapters Found") !== -1){
			this.warn ('No Adapters Found.');
			return;
		}

		// Create a list of ports on the hba. For every port we create an object containing all discovered information. 
		var portInfo = results.fcinfo_hba; 
		var portList = {};
		var curPwwn = null; 
		for (var i = 0 ; i < portInfo.length ; i++){
			// Expected output looks like:
			//   HBA Port WWN: 230008008493850
			//       OS Device Name: /dev/cfg/c5
			//       Manufacturer: Emulex
			//       Model: LP10000DC-S
			//       Firmware Version: 1.92a1 (T2D1.92A1)
			//  ...etc...
			var info = portInfo[i].split(":");
			// Ignore unexpected output
			if (info.length < 2)
				continue;
			var name = info[0];
			var value = info [1].trim();  
			if (name.indexOf("HBA") === 0){
				portList[value] = {}; 
				curPwwn = value;
			} else if (curPwwn) {
				// for consistancy we convert the name to lowercase and replace " " to "_" 
				name = name.toLowerCase();
				name = name.replace(/ /g,"_"); 
				portList[curPwwn][name] = value;
			}
		}
		
		// Process HBA information
		this._processFCAdapters (portList, deviceCi); 
		this._processFCPorts (portList, deviceCi); 
		this._processFCDisks (results, deviceCi); 	
	},
	
	/**
	 * Process 'fcinfo hba-port' command output and create a Ci for every discovered HBA.
	 **/
	_processFCAdapters: function(portList, deviceCi) {
		var ciSchema = this.getCiSchema();
		var adapterCis = []; 
		
		for (var port in portList) {
			var portInfo = portList[port]; 
			
			// Create HBA card based on the serial_number. Different WWNNs are possible on a dual channel HBA
			// Search if we already have the hba
			var found = false; 
			for (var j = 0; j < adapterCis.length; ++j) {
				if (portInfo.serial_number && adapterCis[j].data.serial_number === portInfo.serial_number ) {
					found = true;
					break;
				}
			}
			
			if (found)
				continue;
			
			
			var makeModel = MakeAndModelJS.fromNames(portInfo.manufacturer, portInfo.model, 'hardware');
			var theSerialNumber = portInfo.serial_number || "";
			
			// Create new Ci for the hba
			var adapterCi = ciSchema.createCi('cmdb_ci_storage_hba', {
				computer: deviceCi,
				device_id: theSerialNumber,
				manufacturer: ''+ makeModel.getManufacturerSysID(),
				model_id: ''+ makeModel.getModelNameSysID(),
				serial_number: theSerialNumber,
				name: portInfo.manufacturer.split(/ /)[0] + ' ' + theSerialNumber
			});

			deviceCi.addReferral(adapterCi);
			adapterCis.push(adapterCi); 
		}
		
	},
	
	/**
	 * Process 'fcinfo hba-port' command output and populate port information for every HBA.
	 **/
	_processFCPorts: function(portList, deviceCi) {
		var ciSchema = this.getCiSchema();
		var adapterCis = deviceCi.getReferrals('cmdb_ci_storage_hba');
		
		for (var pKey in portList) {
			var port = portList[pKey];
			var wwnn = new StorageWWN(port.node_wwn).toString();
			var wwpn = new StorageWWN(pKey).toString();
			
			// find the corresponding HBA using serial_number 
			var adapterCi = null;
			for (var j = 0; j < adapterCis.length; j++) 
				if (port.serial_number  === adapterCis[j].data.serial_number){
					adapterCi = adapterCis[j];
					break; 
				}
			

			// skip this port if we unexpectedly cannot find the hba
			if (adapterCi === null) {
				this.warn('Unable to find FC HBA for FC Port: ' + wwpn);
				continue;
			}

			
			var portType = new DiscoveryFcPortType(port.type.split(/_/)[0]).toString(); // "N_Port" --> "N"
			
			var speed = null;
			try {
				if (port.current_speed.length !== 0)
					speed = new DiscoveryDataRate(port.current_speed, 'GFC');
			} catch (e) { 
				if (this.isDebugging())
						this.warn(e);
			}
			
			// Create a new Ci for the port
			var portCi = ciSchema.createCi('cmdb_ci_fc_port', {
				computer: deviceCi,
				controller: adapterCi,
				wwpn: wwpn,
				wwnn: wwnn,
				port_type: portType,
				speed: ( speed ? speed.to(DiscoveryDataRate.Units.GFC) + ' GFC' : null ),
				operational_status: ( port.state === 'online' ? 1 : 0 ),
				name: 'FC Port ' + wwpn
			});

			deviceCi.addReferral(portCi);
			adapterCi.addReferral(portCi);

		}
		
	},
	/**
	 * 
	 * Process 'fcinfo remote-port -slp $port' command output for every existing port on the hbas.
	 * For every port we collect some  information like 
	 *
	 *  **Remote ports for: 2100001b329b2649
	 *
	 *	Remote Port WWN: 500601683de02ca6
	 *	Active FC4 Types: SCSI
	 * 	SCSI Target: yes
	 *	Node WWN: 50060160bde02ca6
	 *	LUN: 0
     *		Vendor: DGC
	 *		Product: LUNZ
	 *		OS Device Name: /dev/rdsk/c6t500601683DE02CA6d0s2
     *
     *  
	 **/
	_processFCDisks: function(results, deviceCi) {
		
		if (typeof results.fcinfo_target === 'undefined') {
			this.warn ('No remote ports were returned for HBA.');
			return;
		}
		
		var hostPort = null; 
		var remotePort = {}; 
		
		for (var i = 0 ; i < results.fcinfo_target.length; i++){
			
			var targetInfo = results.fcinfo_target[i].split(":"); 
			// for consistancy we convert the key to lowercase and replace " " to "_" 
			var key = targetInfo[0].toLowerCase();
			key = key.replace(/ /g, "_");
			var value = targetInfo[1].trim();
			 
			// Port on the host for that we run "fcinfo remote-port" 
			if (key.indexOf("**remote_ports_for") !== -1){
				hostPort = new StorageWWN(value).toString();
				continue;
			}
			
			// Collect all necessary information for every remote_port 
			switch (key){
				case "remote_port_wwn": 
					// begining of the new remote-port, and time to process information for the previous remote-port if it was target. 
					if (JSUtil.notNil(remotePort.isTarget) && remotePort.isTarget)
						this._processRemotePorts(remotePort, hostPort, deviceCi);
	
					remotePort = {};
					remotePort.luns = []; 
					remotePort.wwpn = new StorageWWN(value).toString(); 
					break;
				case "scsi_target" :
					remotePort.isTarget = ( value === 'yes' ? true : false);
					break;
				case "node_wwn":
					remotePort.wwnn = new StorageWWN(value).toString();
					break;
				case "lun":
					var lunInfo = {};
					lunInfo.number = value;
					remotePort.luns.push(lunInfo);
					break;
				case "os_device_name":
					remotePort.luns[remotePort.luns.length-1].devName = value; 
					break; 
			}
			
			
		}
	},
	
	
	/**
	 * Process the information for a remote_port and create corresponding Cis.
	 * @param {} rmPort An object containing all information for aremote-port
	 * @param hPort  The host port connected to the rmPort
	 * @param deviceCi
	 **/
	_processRemotePorts: function(rmPort, hPort, deviceCi) {
		
		var ciSchema = this.getCiSchema();
		var storageReconciler = new DiscoveryStorageAllocationReconciler({ ciSchema: ciSchema });
		var diskCis = deviceCi.getReferrals('cmdb_ci_storage_device');
		var portCis = deviceCi.getReferrals('cmdb_ci_fc_port');
		 
		var portCi = null;
		var diskCi = null;
		for (var i = 0; i < portCis.length; i++) 
			if (portCis[i].data.wwpn === hPort){
				portCi = portCis[i];
				continue;
			}
		
		if (portCi === null){
			this.warn ( "No port defined on HBA for " + hPort); 
			return;
		} 
		
		for ( i = 0; i < rmPort.luns.length; i++){
			diskCi = null; 
			// For every lun, the last part of os_device_name includes the disk name. 
			// for example /dev/rdsk/c6t500601683DE02CA6d0s2 is realted to disk_id 
			// "c6t500601683DE02CA6d0" (s2 at the end of the diskname means the entire disk). 
			var diskName = rmPort.luns[i].devName.split("/").pop();
			for (var j = 0 ; j < diskCis.length; j++) 
				if (diskName.indexOf(diskCis[j].data.device_id) === 0){
					diskCi = diskCis[j];
					continue;
				}
			
			if (diskCi === null){
				this.warn("Unable to match FC port to device_id: " + diskName); 
				continue;
			}
			
			diskCi.table = 'cmdb_ci_fc_disk';
			diskCi.data.storage_type = 'network';
			diskCi.data.device_interface = 'fc';
			diskCi.data.device_lun = rmPort.luns[i].number;
			diskCi.data.provided_by = portCi;
			
			portCi.addReferral(diskCi);
			// populate wwnn and wwpn for the target path in cmdb_fc_target
			var targetWWPN = StorageWWN.parse(rmPort.wwpn);
			var targetWWNN = StorageWWN.parse(rmPort.wwnn);
			var targetCi = this.createTargetCi(targetWWPN, targetWWNN); 
			
			diskCi.addReferral(targetCi);
			
			var initiatorCi = ciSchema.createCi('cmdb_fc_initiator', { 
						wwnn: portCi.data.wwnn,
						wwpn: portCi.data.wwpn
					});
			diskCi.addReferral(initiatorCi);
			
			// attempt to relate to upstream volume on array
			try {
				storageReconciler.createFCDiskCiToVolumeRel(diskCi, new Array(targetWWPN), portCi.data.wwpn);
			} catch (e) {
				if (this.isDebugging())
						this.warn(e);
			}
			
		}
		
	},
	
	// Create a Ci including wwnn, wwpn information for a path to the fc disk from this solaris server
	createTargetCi: function(wwnn, wwpn){
		var ciSchema = this.getCiSchema();
		var wwCi = ciSchema.createCi('cmdb_fc_target', { 
				wwnn: wwnn,
				wwpn: wwpn
		});
		 
		return wwCi;  
	},
	type: 'DiscoverySolarisStorageSensor'
});
