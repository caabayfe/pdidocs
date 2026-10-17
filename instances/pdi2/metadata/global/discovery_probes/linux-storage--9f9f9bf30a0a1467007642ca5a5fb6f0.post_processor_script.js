g_array_util = new ArrayUtil();

new ProbePostProcessor({
	
	SYS_BUS_SCSI_REGEX: /^(\d+):(\d+):(\d+):(\d+),(\w+)$/,
	
	// match beginning of substring of [[==PROBE:fdisk==]]
	// Example: Disk /dev/sda: 21.5 GB, 21474836480 bytes, 41943040 sectors\n
	FDISK_REGEX: /^Disk (.+?): .*?, (\d+) bytes/,
	
    /**
     * Runs the probe instance
     */    
    process : function() {
		current.results = this._parseResult(output);
			
		// findings from /sys/block probe, disks and partitions
		current.sysBlocks = this._createSysBlocks(current.results);
		delete current.sys_block;
		
		// used only if sysBlock doesn't exist host:bus:target:lun => device id (sda1, sda2, etc.)
		if (typeof current.scsi_path_map !== 'undefined') {
			current.sysBusMap = this._createSysBusMap(current.results);
			delete current.scsi_path_map;
		}
		
		// process /proc/mounts
		current.procMounts = 
			( typeof current.results.proc_mounts.procMount !== 'undefined' ? 
			 current.results.proc_mounts.procMount : [] );
		delete current.results.proc_mounts;
		
		current.df = this._createDf(current.results);
		delete current.results.df;
		
		// deviceId => size in bytes
		current.diskSizeMap = this._createDiskSizeMap(current.results);
		delete current.results.scsi_path_map;

		current.mappedDevices = this._createMappedDevices(current.results);
		delete current.results.dmsetup;
		
		current.multipathPools = this._createMultipathPools(current.results);
        delete current.results.multipath_ll;
		
		current.fcPorts = this._createFcPorts(current.results);

		this.createFcoeHbas(current.results);
		current.fcAdapters = ( typeof current.results.fc.fcHba !== 'undefined' ? current.results.fc.fcHba : [] );
		delete current.results.fc;

		if (current.results.warn)
			current.results.warn.forEach(function(warning) { warning = warning.trim(); if (warning) g_probe.appendWarning(warning); });
		delete current.results.warn;

		// Return raw output information from the probe
		var enableRawOutput = g_probe.getParameter('return_raw_output');
		if (JSUtil.notNil(enableRawOutput) && (enableRawOutput == 'true'))
		    current.return_raw_output = output;
	},
	
	_createSysBlocks: function(results) {
		var sysBlocks = ( typeof results.sys_block.sysBlock !== 'undefined' ? results.sys_block.sysBlock : [] );
		
		// normalize partitions as array
		for (var b = 0; b < sysBlocks.length; ++b)
			sysBlocks[b].partitions = g_array_util.ensureArray(sysBlocks[b].partitions);
		
		return sysBlocks;
	},
	
	/**
	 * Parses results from the 'df' command and formats each entry into an object.
	 * E.g.,
	 * /dev/mapper/glidevg-glidelv   585081728  185204 584896524       1% /glide
	 */
	_createDf: function(results) {
		var columns, data, mnts, mnt, line,
			foundMounts = { },
			df = [];

		processDf(results.df, 0);
		// PRB1332785: Sometimes we don't get the filesystem from proc_mounts.  Get it from
		// df if we can.
		processDf(results.dft, 1);

		// PRB1325702: 'df' sometimes doesn't return all filesystems.  Try again, using findmnt.
		// Note that findmnt doesn't return size or freespace.
		if (results.findmnt) {
			for (i = 0; i < results.findmnt.length; i++) {
				line = results.findmnt[i];
				if (!line.startsWith('/dev/') && !line.startsWith('//') && line.indexOf(':') === -1)
					continue;

				columns = line.split(/\s+/);

				if (columns.length == 1 && i >= results.findmnt.length)
					return df;

				if (columns.length == 1 && i < results.findmnt.length-1) {
					i++;
					columns[1] = results.findmnt[i].split(/\s+/)[1];
				}

				addMount(columns[0], columns[1]);
			}
		}

		return df;

		// This processes both 'df -kP' and 'df -kPT'.  When called with -T
		// df returns the file system as the 2nd column and columns to the right
		// get pushed over.  'offset' will be either 1 or 0, indicating whether
		// or not the extra column is present.
		function processDf(lines, offset) {
			for (var i = 0; i < lines.length; ++i) {
				line = lines[i];

				// if this line was split due to length, combine this line with the following
				if (line.indexOf(' ') < 0 && (i + 1) < lines.length && lines[(i + 1)].charAt(0) === ' ') {
					line = line + ' ' + lines[(i+1)].trim();
					++i;
				}

				// neither local nor remote (cifs/nfs)
				if (!line.startsWith('/dev/') && !line.startsWith('//') && line.indexOf(':') === -1)
					continue;

				columns = line.split(/\s+/);
				addMount(columns[0], columns[5 + offset], columns[1 + offset], columns[3 + offset], offset ? columns[1] : undefined);
			}
		}

		// Gather the information we get from df, df -T and findmnt
		function addMount(name, mountPoint, size, freeSpace, fs) {
			var mount;
			if (name.endsWith('/'))
				name = name.substr(0, name.length - 1);
			mount = foundMounts[name];
			if (!mount) {
				mount = foundMounts[name] = { name: name };
				df.push(mount);
			}
			mount.mountPoint = mount.mountPoint || mountPoint;
			mount.size = mount.size || size;
			mount.freeSpace = mount.freeSpace || freeSpace;
			mount.fs = mount.fs || fs;
		}
	},

	_createDiskSizeMap: function(results) {
		var diskSizeMap = {};
		for (var i = 0; i < results.fdisk.length; ++i) {
			var line = results.fdisk[i];
            var matches = line.match(this.FDISK_REGEX);
            if (matches === null)
				continue;
			
			var data = {
				deviceId: matches[1],
				size: matches[2]
			};
        
			diskSizeMap[data.deviceId] = data.size;
		}

		return diskSizeMap;
	},
	
	_createSysBusMap: function(results) {
		var sysBusMap = {};
		for (var i = 0; i < results.scsi_path_map.length; ++i) {
			var line = results.scsi_path_map[i];
            var matches = line.match(this.SYS_BUS_SCSI_REGEX);
            if (matches === null)
				continue;
			
			var data = {
				host: matches[1],
				bus: matches[2],
				target: matches[3],
				lun: matches[4],
				deviceId: matches[5],
				deviceMajorMinor: null,
			};
        
			var key = data.host + ':' + data.bus + ':' + data.target + ':' + data.lun;
			sysBusMap[key] = {
				deviceId: data.deviceId,
				majorMinor: data.deviceMajorMinor
			};
		}

		return sysBusMap;
	},
	
	_createMappedDevices: function(results) {
		var mappedDevices = [];
		var currentDevice = null;
		
		// parse dmsetup output lines
		for (var i = 0; i < results.dmsetup.length; ++i) {
			var line = results.dmsetup[i];
			
			// Example input: mappedDevice: root--vg-swap--lv 253:1
			var matches = line.match(/^mappedDevice: (\S+) (\d+:\d+)/);
			if (matches != null) {
				// this is the opening of a new device
				
				// save the current device
				if (currentDevice != null) // will be null on first run
					mappedDevices.push(currentDevice);
				
				// create a new current device
				currentDevice = {
					alias: matches[1],
					deviceMajorMinor: matches[2],
					extents: []
				};
			} else {
				// this is a 'dmsetup table' line pertaining to a previous mapper device header
				matches = line.match(/^(\d+) (\d+) (\w+)?/);
				if (matches === null || currentDevice === null)
					continue;
				
				var extent = {
					startSector: matches[1],
					endSector: matches[2],
					type: matches[3],
					deviceMajorMinor: null,
					sourceStartSector: null
				};
				
				if (extent.type === 'linear') {
					matches = line.match(/^\d+ \d+ linear (\d+:\d+) (\d+)$/);
					if (matches != null) {
						extent.deviceMajorMinor = matches[1];
						extent.sourceStartSector = matches[2];
					}
				}

				currentDevice.extents.push(extent);
			}
		}
		
		// push last device
		if (currentDevice != null)
			mappedDevices.push(currentDevice);
		
		return mappedDevices;
	},

	//
	// Create multipath pools 
	//
	// Sample pool with 2 groups and 4 paths each group
	// NOTE:  
	//   Everything to the left of the colon is annotation.
	//   Everything to the right of the colon is raw output from the
	//   script run on the Linux host.
	// Annotated example:
	//   POOL LINE  1:linsv253_rootvg (36005076801818092b00000000000152c) dm-1 IBM,2145
	//   POOL LINE  2:size=15G features='1 queue_if_no_path' hwhandler='0' wp=rw
	//        GROUP 1:|-+- policy='round-robin 0' prio=50 status=active
	//        PATH  1:| |- 4:0:0:0 sdb  8:16   active ready running
	//        PATH  2:| |- 3:0:6:0 sdad 65:208 active ready running
	//        PATH  3:| |- 4:0:1:0 sdd  8:48   active ready running
	//        PATH  4: | `- 3:0:7:0 sdaf 65:240 active ready running
	//        GROUP 2:`-+- policy='round-robin 0' prio=10 status=enabled
	//        PATH  1:|- 3:0:0:0 sdf  8:80   active ready running
	//        PATH  2:|- 4:0:2:0 sdj  8:144  active ready running
	//        PATH  3:|- 3:0:1:0 sdh  8:112  active ready running
	//        PATH  4:`- 4:0:3:0 sdl  8:176  active ready running
	//
	_createMultipathPools: function(results) {
		var multipathPools = [];
		var currentPool = null;
		var currentGroup = null;

		var regex_pool = /^([\w-]+) \((\w+)\) ([\w-]+)/;
		var regex_pool_alternate = /^()(\w+) ([\w-]+)/;   // Empty capture group so capture positions don't change
		var regex_pool_size = /size=(\d+\w+)/;
		var regex_group = /^.*?policy='(.*?)' prio=(\d+) status=(\w+)/;
		var regex_group_alt = /^.*?_\s+(.*?)\s+\[prio=(\d+)\]\[([^\]]*)/;
		var regex_path = /^.*? \d+:\d+:\d+:\d+\s+(\w+)\s+(\d+:\d+)/;

		for (var i = 0; i < results.multipath_ll.length; ++i) {
			var line = results.multipath_ll[i];

			//
			// Process Pools
			//

			//
			//   POOL LINE 1: linsv253_rootvg (36005076801818092b00000000000152c) dm-1 IBM,2145
			//   - or -
			//   POOL LINE 1: 36005076801818092b00000000000152c dm-1 3ParData,VV
			var matches = line.match(regex_pool);
			matches = matches || line.match(regex_pool_alternate);

			// Pool matched?
			if (matches != null) {

				// this is the opening line
				// save the previous pool's last group if this is the second mpath root device
				if (currentPool != null) {
					// save the last group to the previous pool
					if (currentGroup != null) {
						currentPool.groups.push(currentGroup);
						currentGroup = null;
					}
					multipathPools.push(currentPool);
				}

				// store current pool
				currentPool = {
					alias: matches[1] || matches[3],
					wwnn: matches[2],
					deviceName: matches[3],
					size: 0,
					groups: [],
				};


				//
				// extract the size of the pool
				//   POOL LINE 2: size=15G features='1 queue_if_no_path' hwhandler='0' wp=rw
				// Alternate form (seen on IBM BladeCenter HS22):
				//   POOL LINE 2: [size=50G][features=1 queue_if_no_path][hwhandler=1 emc][rw]
				//
				line = results.multipath_ll[i+1];
				matches = line.match(regex_pool_size);

				if (matches != null) {
					//advance to pool line 2 - since it matches
					++i;
					currentPool.size = matches[1];
				}

			} else {

				//
				// Process groups within the current pool
				// Annotated example:
				//   GROUP 1: |-+- policy='round-robin 0' prio=50 status=active
				//   GROUP 2: `-+- policy='round-robin 0' prio=10 status=enabled
				// Alternate form (seen on IBM BladeCenter HS22):
				//   GROUP 1: \\_ round-robin 0 [prio=1][active]
				//   GROUP 2: \\_ round-robin 0 [prio=0][enabled]

				// Candidate match strings (varying degrees of restriction on the prefix format)			
				//  var groupMostNarrowPrefixMatch = line.match(/^\s*[`|]-\+- policy='(.*?)' prio=(\d+) status=(\w+)/);
				//  var groupNarrowPrefixMatch     = line.match(/^[\s-+`|]*policy='(.*?)' prio=(\d+) status=(\w+)/);
				//  var groupLessNarrowPrefixMatch = line.match(/^\s*.-\+- policy='(.*?)' prio=(\d+) status=(\w+)/);		
				//  var groupLoosePrefixMatch      = line.match(/^.*?policy='(.*?)' prio=(\d+) status=(\w+)/);

				// match group prefix loosely
				matches = line.match(regex_group);				
				matches = matches || line.match(regex_group_alt);

				// Group matched?
				if (matches != null) {

					// store previous group
					// NOTE: if currentPool is null then a problem with regex parsing exists
					if (currentGroup != null && currentPool != null)
						currentPool.groups.push(currentGroup);

					currentGroup = {
						policy: matches[1],
						priority: matches[2],
						status: matches[3],
						paths: []
					};

				} else {

					//
					// Process paths within the current group
					// Annotated example:
					//   GROUP 1 - PATH  1: | |- 4:0:0:0 sdb  8:16   active ready running
					//   GROUP 1 - PATH  2: | |- 3:0:6:0 sdad 65:208 active ready running
					//   GROUP 1 - PATH  3: | |- 4:0:1:0 sdd  8:48   active ready running
					//   GROUP 1 - PATH  4: | `- 3:0:7:0 sdaf 65:240 active ready running
					//   GROUP 2 - PATH  1: |- 3:0:0:0 sdf  8:80   active ready running
					//   GROUP 2 - PATH  2: |- 4:0:2:0 sdj  8:144  active ready running
					//   GROUP 2 - PATH  3: |- 3:0:1:0 sdh  8:112  active ready running
					//   GROUP 2 - PATH  4: `- 4:0:3:0 sdl  8:176  active ready running
					// Alternate form (seen on IBM BladeCenter HS22):
					//   GROUP 1 - PATH  1: \\_ 1:0:1:4 sdaf 65:240 [active][ready]
					//   GROUP 1 - PATH  2: \\_ 2:0:0:4 sdbf 67:144 [active][ready]
					//   GROUP 2 - PATH  1: \\_ 2:0:1:4 sdcf 69:48 [active][ready]
					//   GROUP 2 - PATH  2: \\_ 1:0:0:4 sdf 8:80 [active][ready]

					// candidate match strings (varying degrees of restriction on the prefix format)	
					//  var pathLoosePrefixMatch = line.match(/^.*? \d+:\d+:\d+:\d+\s+(\w+)\s+(\d+:\d+)/);
					//  ** BAD - eats paths **
					//  var pathBadPrefixMatchX  = line.match(/^[\s-+`|]* \d+:\d+:\d+:\d+ (\w+) (\d+:\d+)/); 

					// match group prefix loosely
					matches = line.match(regex_path);

					// Pool matched?
					// NOTE: if currentGroup is null then a problem with regex parsing exists
					if (matches === null || currentGroup === null)
						continue;

					// store the current path
					var path = {
						deviceName: matches[1],
						deviceMajorMinor: matches[2],
					};

					currentGroup.paths.push(path);

				} // end if Group matched?
			} // end if (matches != null) {
		} // end for (var i = 0;

		// handle last pool processed
		if (currentPool != null) {

			// handle last group within the last pool processed
			if (currentGroup != null)
				currentPool.groups.push(currentGroup);

			multipathPools.push(currentPool);
		}

		return multipathPools;
	},

	/*
	 * Parse data from "fcoeadm -i"
	 * This has only been tested on RHEL 7.4 with a Broadcom NetXtreme II BCM57810.
	 * That system returned data like this:
	 *
		Description:      NetXtreme II BCM57810 10 Gigabit Ethernet
		Revision:         10
		Manufacturer:     Broadcom Limited
		Serial Number:    Unknown
		Driver:           bnx2x 1.712.30-0
		Number of Ports:  1

			Symbolic Name:     bnx2fc (QLogic BCM57810) v2.10.3 over ens1f0.803-fcoe
			OS Device Name:    host1
			Node Name:         0x1000e08f830ca7ca
			Port Name:         0x2000e08f830ca7c9
			Fabric Name:        0x8305000f830ca7c9
			Speed:             10 Gbit
			Supported Speed:   1 Gbit, 10 Gbit
			MaxFrameSize:      2048 bytes
			FC-ID (Port ID):   0x0f0010
			State:             Online
	 *
	 * On the test system we were able to discover ports normally so this parsing
	 * ignores port information from fcoeadm
	 */
	createFcoeHbas: function(results) {

		var hba, wwnn,
			hbas = (current.results.fc && current.results.fc.fcHba) || [];

		results.fcoe.forEach(function(line) {
			line = line.trim().split(':');

			if (line[0] == 'Description')
				hba = { model: line[1].trim() };

			if (line[0] == 'Manufacturer')
				hba.manufacturer = line[1].trim();

			if (hba && line[0] == 'Serial Number')
				hba.serialNumber = line[1].trim();

			if (hba && line[0] == 'Node Name') {
				wwnn = line[1].trim();
				wwnn = wwnn.substr(2);
				wwnn = wwnn.match(/([0-9a-f]{2})/g).join(':');
				hba.wwnn = wwnn;
				if (hba.serialNumber == 'Unknown')
					hba.serialNumber = wwnn;
				hbas.push(hba);
				hba = undefined;
			}
		});

		if (hbas.length)
			current.results.fc.fcHba = hbas;
	},

	/**
	 * Formats fcPort results.
	 * 
	 * @param {} results Data from current.results
	 *
	 *** Example input:
	 * fcPort:
	 *  wwpn: 0x10000090fa343e3f
 	*  wwnn: 0x20000090fa343e3f
 	*  speed: 8 Gbit
 	*  port_type: NPort (fabric via point-to-point)
 	*  hbaSerialNumber: FC31799473
 	*  targetPort:
 	*    wwpn: 0x2004002a6a7c8118
 	*    wwnn: 0x2001002a6a7c8119
 	*  targetPort:
 	*    wwpn: 0x500601693de02ca6
 	*    wwnn: 0x50060160bde02ca6
 	*    blockDeviceNames: sdd
	 */
	_createFcPorts: function(results) {
		var fcPorts = ( typeof results.fc.fcPort !== 'undefined' ? results.fc.fcPort : [] );

		for (var i = 0; i < fcPorts.length; ++i) {
			var fcPort = fcPorts[i];

			if (fcPort.port_type != null) {
				var matches = fcPort.port_type.trim().match(/^(\w+)Port/);
				if (matches != null)
					fcPort.port_type = matches[1];
			}

			if (typeof fcPort.targetPort !== 'undefined') {
				// more efficient than ArrayUtil.ensureArray ...
				if (Object.prototype.toString.call(fcPort.targetPort) !== '[object Array]')
					fcPort.targetPort = [fcPort.targetPort];

				for (var t = 0; t < fcPort.targetPort.length; ++t) {
					var targetPort = fcPort.targetPort[t];

					// parse as csv if block devices exist, create empty array otherwise
					if (typeof targetPort.blockDeviceNames !== 'undefined')
						targetPort.blockDeviceNames = targetPort.blockDeviceNames.split(',');
					else
						targetPort.blockDeviceNames = [];
				}
			}
		}

		return fcPorts;
	},

	_parseResult: function(output) {
		var sectionParser = new DiscoveryProbeOutputSectionParser({
			indentedMarkupSections: [ 'sys_block', 'proc_mounts', 'sys_iscsi' ],
			strictMarkupSections: [ 'fc' ]
		});
		
		var results = sectionParser.parse(output);

		var initiator = ''+results.sys_iscsi_initiator;
		if (initiator) {
			initiator = initiator.split('=')[1] || '';
			results.sys_iscsi_initiator = initiator.trim();
		}

		return results;
	},
		
	type: "ProbePostProcessor"
});
