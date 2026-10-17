var DiscoveryStorageAllocationReconciler = Class.create();

DiscoveryStorageAllocationReconciler._relationshipTypeId = null;

DiscoveryStorageAllocationReconciler._getRelationshipTypeId = function() {
	if (DiscoveryStorageAllocationReconciler._relationshipTypeId === null) {
		// legacy types
		DiscoveryStorageAllocationReconciler._relationshipTypeId = g_disco_functions.findCIRelationshipTypeByDesc(
			'cmdb_rel_type',
			'Allocated from',
			'Allocated to');
		
		if (DiscoveryStorageAllocationReconciler._relationshipTypeId === null)
			throw 'DiscoveryStorageAllocationReconciler could not find relationship type';
	}
	
	return DiscoveryStorageAllocationReconciler._relationshipTypeId;
};

DiscoveryStorageAllocationReconciler.prototype = {
    initialize: function(options) {
		if (typeof options === 'undefined')
			options = {};
		
		this._storageReconciler = new StorageReconciler();
		
		this._ciSchema = ( typeof options.ciSchema === 'undefined' ? new CiSchema() : options.ciSchema );
    },
	
	reconcileExport: function(deviceId, exportCiData) {
          // gather all possible IPs that the export's device CI may be associated with
          var hostnames = this._getHostNames(deviceId);

          // create an array of all possible hostname+path formats (nfs, cifs)
          var names = [];
          for (var i = 0; i < hostnames.length; ++i) {
               var hostname = hostnames[i];
               var path = exportCiData.data.path;
 			  var cifsPath = path.replace(/\//g, '\\');
			  
			   // fqdn
               names.push(hostname + ':' + path); // nfs
               names.push('\\\\' + hostname + cifsPath); // cifs

			   // host alias (skip numeric IPs)
			  if (!hostname.match(/^\d+\./)) {
				  var host = hostname.substr(0, hostname.indexOf('.'));
			      names.push(host + ':' + path); // nfs
                  names.push('\\\\' + host + cifsPath); // cifs
			  }
          }
		
		  var shareId = ''+exportCiData.data.sys_id;
		
  		// map disks (windows) to this share
          var diskGr = new GlideRecord('cmdb_ci_disk');
          diskGr.addQuery('volume_name', 'IN', names);
          diskGr.query();
		
          while (diskGr.next())
			  this._relate(shareId, ''+diskGr.sys_id);
		
          // map filesystems (unix) to this share
		  var fsGr = new GlideRecord('cmdb_ci_file_system');
		  fsGr.addQuery('name', 'IN', names);
		  fsGr.query();
		
		  while (fsGr.next())
			  this._relate(shareId, ''+fsGr.sys_id);
	
	},
	
	/**
	 * Get NAS File System Info from the name (fullPath)
	 * the specified device.
	 * @param name Full Path of the 
	 * @param string mountTable Either cmdb_ci_file_system or cmdb_ci_disk
	 */
    getNASInfo: function(fullPath) {
		if (!fullPath)
			return null;
		
		var nas = {};
    	var ip;
		var ipAddress = SncIPAddressV4;
		
		// determine hostname and path
		if (fullPath.startsWith('//')) { // cifs
			var pathStartPos = fullPath.indexOf('/', 2);
			nas.hostname = fullPath.substr(2, pathStartPos - 2);
			nas.path = fullPath.substr(pathStartPos);
		} else if (fullPath.startsWith('\\\\')) { // cifs
			var pathStartPos = fullPath.indexOf('\\', 2);
			nas.hostname = fullPath.substr(2, pathStartPos - 2);
			path = fullPath.substr(pathStartPos);
			nas.path = path.replace(/\\/g, '/');
		} else if (fullPath.indexOf(':') !== -1) { // nfs
			var parts = fullPath.split(':');
			nas.hostname = parts[0];
			nas.path = parts[1];
		} else { // ignore local filesystems
			return null;
		}
		
		// Let's check if it's a ip address
		ip = ipAddress.getIPAddressV4FromDDecimal(nas.hostname);
		if (JSUtil.nil(ip)) {
			var ci = this._findCiByDns(nas.hostname);
			if (ci) 
			    nas.ip = ci.ip;			
		}
		else 
		    nas.ip = ip;
		
		return nas;
	},

	reconcileFileSystemByServer: function(serverId) {

		// PRB1353490: We occasionally can't get the CI when the system is under heavy load.  We
		// can't do anything in this case, so just warn and exit.
		if (!serverId || (typeof serverId == 'string' && serverId.toLowerCase() == 'null')) {
			DiscoveryLogger.error('Unable to find server for file system reconciliation', sensorName, g_probe.getEccQueueId());
			return;
		}

		// this.filesystems doesn't store sys_ids after save(), so query for the list
		var fsGr = new GlideRecord('cmdb_ci_nas_file_system');
		fsGr.addQuery('computer', serverId);
		fsGr.addQuery('install_status', 1);
		fsGr.query();

		// reconcile each remote filesystem
		while(fsGr.next()) {
			this.reconcileFileSystem(fsGr);
		}

		this.pruneAbsentMounts(serverId, 'cmdb_ci_nas_file_system');
	},
	
	/**
	 * Reconcile and create a relationship with file share from the nas file system
	 * @param fsCi NAS file system 
	 */	
	reconcileFileSystem: function(fsCi) {
    	// We should have the ip address otherwise we werent able to reconcile        
    	if (JSUtil.nil(fsCi.nas_ip_address) || JSUtil.nil(fsCi.nas_path))
    		return;

		// If the shareName on the storage is mapped to the host (not the actual path on the storage), 
		// on the host side the shareName has "/" at the begining. 
		var shareName = ((fsCi.nas_path.indexOf("/") === 0) ? fsCi.nas_path.substring(1) : fsCi.nas_path); 

		// try matching by IP, then by DNS
		var exportDeviceId = this._findCiByIp(fsCi.nas_ip_address);
		
		// find the export related to the storage server that matches the same path
		var relGr = new GlideRecord('cmdb_rel_ci');
		relGr.addQuery('child', exportDeviceId);
		relGr.addQuery('parent.sys_class_name', 'cmdb_ci_storage_fileshare');
		// file share name can be the shareName OR the path on the storage side.
		relGr.addQuery('parent.name', shareName).addOrCondition('parent.name', fsCi.nas_path);
		relGr.query();
		if (!relGr.next())
			return;		

		this._relate(''+relGr.parent.sys_id, ''+fsCi.sys_id);
	},
		
	/**
	 * Prunes all allocation relationships from all absent mounts of the specified type found on
	 * the specified device.
	 * @param string deviceCiId
	 * @param string mountTable Either cmdb_ci_file_system or cmdb_ci_disk
	 */
	pruneAbsentMounts: function(deviceCiId, mountTable) {
		if (!deviceCiId) {
			DiscoveryLogger.error('Unable to find device to prune mounts', sensorName, g_probe.getEccQueueId());
			return;
		}

		var fsRefField = null;
		switch(mountTable) {
			case 'cmdb_ci_nas_file_system':
				fsRefField = 'provided_by';
				break;
			case 'cmdb_ci_disk':
			case 'cmdb_ci_storage_device':
				fsRefField = 'computer';
				break;
			default:
				throw 'Unsupported storage mount table: ' + mountTable;
		}
		
		var natureId = this._getRelationshipTypeId();
		
		// find all absent filesystems for the specified device
		var fsGr = new GlideRecord(mountTable);
		fsGr.addQuery(fsRefField, deviceCiId);
		fsGr.addQuery('install_status', 100);
		fsGr.query();

		// delete all allocated from/to relationships for each absent filesystem
		while (fsGr.next()) {
			// find all relationships where this filesystem is a allocated child
			var relGr = new GlideRecord('cmdb_rel_ci');
			relGr.addQuery('parent', ''+fsGr.sys_id);
			relGr.addQuery('type', natureId);
			relGr.query();  
	
			// delete all allocated child relationships found
			if (relGr.hasNext())
				relGr.deleteMultiple();
		}
	},
	
	/**
	 * Searches the CMDB for the Storage Volume (LU - Logical Unit) that is exporting the specified
	 * network disk via Fibre Channel (SAN). The SAN target exports a volume to the host client. The host client
	 * (Windows, Linux) imports the volume as a SAN Disk (cmdb_ci_san_disk). Creates a relationship if match found.
	 *
	 * 
	 * @param Ci(cmdb_ci_fc_disk) fcDiskCi The disk on the Host machine that is importing the volume.
	 * @param array targetWWPNs The target world-wide-port-names to search for.
	 */	
	createFCDiskCiToVolumeRel: function(fcDiskCi, targetWWPNs, initiatorWWPN) {
		// Find the fc export so we can find the volume
		var lun = fcDiskCi.data.device_lun;
		var exportsGr = this._storageReconciler.findFCExports(lun, targetWWPNs, initiatorWWPN);
		
		// Finally create the relationship
		this._createDiskCiToVolumeRel(fcDiskCi, exportsGr);
	}, 
	
	/**
	 * Searches the CMDB for the Storage Volume (LU - Logical Unit) that is exporting the specified
	 * network disk via ISCSI (SAN). The ISCSI target exports a volume to the host client. The host client
	 * (Windows, Linux) imports the volume as a SAN Disk (cmdb_ci_iscsi_disk). Creates a relationship if match found.
	 *
	 * 
	 * @param Ci(cmdb_ci_iscsi_disk) iscsiDiskCi The disk on the Host machine that is importing the volume.
	 */		
	createISCSIDiskCiToVolumeRel: function(iscsiDiskCi) {
		var targetIQN = iscsiDiskCi.data.iqn;
		var lun = iscsiDiskCi.data.device_lun;
		var initiator = iscsiDiskCi.data.initiator_iqn;
		
		// Find the iscsi export so we can find the volume
		var exportsGr = this._storageReconciler.findISCSIExports(targetIQN, lun, initiator);

		// Finally create the relationship			
		this._createDiskCiToVolumeRel(iscsiDiskCi, exportsGr);
	},

	
	relateSanTargetVolumeToInitiatorDisks: function(targetVolumeGr, targetWwpns) {		
		// query for fibre channel Ports that match wwpns
		var fcPortsGr = this._storageReconciler.queryFcPorts(targetWwpns);
		while (fcPortsGr.next()) {
			// map disks directly attached to this port
			this._relateDisks(targetVolumeGr, fcPortsGr);
			// if a switch port, traverse connections and map disks
			this._relateConnections(targetVolumeGr, fcPortsGr.wwpn, null);
		}
	},
	
	_relateConnections: function(targetVolumeGr, wwpn, excludeWwpn) {
		// find any connections found in the fabric
		var connectionsGr = this._querySanConnections(wwpn, excludeWwpn);
		while (connectionsGr.next()) {
			var isUpstream = ( connectionsGr.upstream_endpoint.endpoint_id == wwpn );
			var distantEndpointGr =  ( isUpstream ? connectionsGr.downstream_endpoint : connectionsGr.upstream_endpoint );
			// attempt to map any disks directly attached
			this._relateDisks(targetVolumeGr, distantEndpointGr.fc_port);
			// traverse any further nested connections, excluding this wwpn to prevent infinite loops
			this._relateConnections(targetVolumeGr, distantEndpointGr.endpoint_id, wwpn);
		}
	},
	
	_relateDisks: function(targetVolumeGr, fcPortGr) {
		// find any initiator disks connected directly to this target port
		var disksGr = this._queryDisksForProvider(fcPortGr);
		while (disksGr.next())
			g_disco_functions.createRelationshipIfNotExists(targetVolumeGr, disksGr, 'Provides::Provided by');
	},
	
	_querySanConnections: function(wwpn, excludeWwpn) {
		var gr = new GlideRecord('cmdb_ci_san_connection');
		
		if (excludeWwpn !== null) {
			gr.addQuery('upstream_endpoint.endpoint_id', '!=', excludeWwpn);
			gr.addQuery('downstream_endpoint.endpoint_id', '!=', excludeWwpn);
		}
		
		// include
		gr.addQuery('upstream_endpoint.endpoint_id', wwpn).addOrCondition('downstream_endpoint.endpoint_id', wwpn);
		gr.query();
		return gr;
	},
	
	_queryDisksForProvider: function(providerGr) {
		var gr = new GlideRecord('cmdb_ci_storage_device');
		gr.addQuery('provided_by', providerGr);
		gr.query();
		return gr;
	},
	
	/**
	 * Create a cmdb_rel_ci relationship between disk ci and volume with all values in exportsGr.
	 */
	_createDiskCiToVolumeRel: function(diskCi, exportsGr) {
		// Get volumes and create relationship
		var seenVolumes = this._storageReconciler.getVolumesFromExports(exportsGr);
		for (volumeSysId in seenVolumes) {
			var exportedVolumeGr = new GlideRecord('cmdb_ci_storage_volume');
			if (exportedVolumeGr.get(volumeSysId)) {
				var exportedVolumeCi = this._ciSchema.createCi(exportedVolumeGr);
				exportedVolumeCi.addRelation(diskCi, 'cmdb_ci_storage_device', 'Exports to::Imports from');
			}
		}
	},
		
	_findCiByIp: function(ip) {
		var ipGr = new GlideRecord('cmdb_ci_ip_address');
		ipGr.addQuery('ip_address', ip);
        ipGr.addQuery('nic.install_status', "!=", 100);
	    ipGr.addQuery('install_status', '<>', 100);
	    ipGr.addQuery('nic.install_status', '<>', 100);
		ipGr.addQuery('nic.cmdb_ci.sys_class_name', 'cmdb_ci_storage_server');
		ipGr.query();
		return ( ipGr.next() ? ''+ipGr.nic.cmdb_ci.sys_id : null );
	},
	
	_findCiByDns: function(hostname) {
		var ci;
        var dnsGr = new GlideRecord('cmdb_ip_address_dns_name');

		// handle for either fqdn (foo.bar.com) or host alias (foo)
		if (hostname.indexOf('.') === -1)
			dnsGr.addQuery('dns_name.name', 'STARTSWITH', hostname + '.'); // host alias, match as a prefix
		else
			dnsGr.addQuery('dns_name.name', hostname); // fqdn, match fully

		dnsGr.addQuery('ip_address.nic.cmdb_ci.sys_class_name', 'cmdb_ci_storage_server');
		dnsGr.addQuery('ip_address.nic.install_status', '!=', 100);
		dnsGr.addQuery('ip_address.install_status', '!=', 100);
		dnsGr.query();

    	if (dnsGr.next()) {
			ci = {};
            ci.sys_id = dnsGr.ip_address.nic.cmdb_ci.sys_id;
			ci.ip = dnsGr.ip_address.ip_address;
		}
		   
		return ci;
	},
	
	_getDnsNames: function(deviceId) {
		// query for all active dns entries for this device
		var dnsGr = new GlideRecord('cmdb_ip_address_dns_name');
		dnsGr.addQuery('ip_address.nic.cmdb_ci', deviceId);
		dnsGr.addQuery('ip_address.nic.install_status', '!=', 100);
		dnsGr.addQuery('ip_address.install_status', '!=', 100);
		dnsGr.query();

		// prepare results into an array
		var dnsNames = [];
		while (dnsGr.next())
			dnsNames.push(''+dnsGr.dns_name.name);
		
		return dnsNames;
	},
	
	_getHostNames: function(deviceId) {
		var ips = new Discovery().getIPsInCI(deviceId); // get all ips
		if (ips === null)
			ips = [];
		
		var dnsNames = this._getDnsNames(deviceId);
		var hostnames = ips.concat(dnsNames);
		return hostnames;
	},
	
	_relate: function(exportId, filesystemId) {
		new DiscoveryFunctions().createRelationshipIfNotExists(filesystemId, exportId, 'Allocated from::Allocated to');
	},
	
	_getRelationshipTypeId: function() {
		return DiscoveryStorageAllocationReconciler._getRelationshipTypeId();
	},

    type: 'DiscoveryStorageAllocationReconciler'
};
