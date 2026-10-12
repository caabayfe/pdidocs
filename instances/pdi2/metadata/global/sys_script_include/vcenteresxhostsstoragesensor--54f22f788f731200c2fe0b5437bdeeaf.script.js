/* jshint -W030, -W083 */

ArrayPolyfill;
FunctionPolyfill;

var VCenterESXHostsStorageSensor;

// DiscoveryCMPUtils won't be available if cloud management isn't active.  Declaring
// this ensures that we won't get an exception when we check to see if it's active.
var DiscoveryCMPUtils;

(function() {

    var vCenterSysId, vCenterUuid, datacenterMorId, datacenterSysId,esxSysId,
        debug, _this, enableCmpApi,lookUpSysIds,
        df = new DiscoveryFunctions(),
        sr = new StorageReconciler(),
        vmMap = {},
        esxMap = {},
        schema = {
            cmdb_ci_network_adapter: {
                fixup: fixupNic,
                index: ['cmdb_ci', 'mac_address', 'name']
            },
            cmdb_ci_disk: {
                fixup: fixupDisk,
                index: ['device_id', 'computer'],
                childOf: {
                    cmdb_ci_vcenter_datastore_disk: 'Exports to::Imports from'
                }
            },
            cmdb_ci_storage_hba: {
                fixup: fixupHba,
                index: ['device_id', 'computer']
            },
            cmdb_ci_fc_port: {
                fixup: fixupFcPort,
                index: ['controller', 'wwpn']
            },
            cmdb_ci_iscsi_disk: {
                fixup: fixupDisk,
                index: ['computer', 'name', 'iqn'],
                childOf: {
                    cmdb_ci_vcenter_datastore_disk: 'Exports to::Imports from'
                }
            },
            cmdb_ci_fc_disk: {
                fixup: fixupDisk,
                index: ['device_id', 'computer'],
                childOf: {
                    cmdb_ci_vcenter_datastore_disk: 'Exports to::Imports from'
                },
            },
            cmdb_fc_initiator: {
                index: ['fc_disk']
            },
            cmdb_fc_target: {
                index: ['fc_disk'],
            },
            cmdb_ci_ip_address: {
                index: ['nic']
            }
        },
        args = {
            schema: schema
        };

    VCenterESXHostsStorageSensor = {
        process: process,
        type: "DiscoverySensor"
    };

    /*
    Sample data.  Truncated for brevity, so possibly inconsistent:
    	{
    	  "cmdb_ci_network_adapter": [
    		{
    		  "name": "vmnic0",
    		  "cmdb_ci": "host-1033"
    		},
    		{
    		  "name": "vmnic1",
    		  "cmdb_ci": "host-1033"
    		}
    	  ],
    	  "cmdb_ci_storage_hba": [

    	  ],
    	  "cmdb_ci_fc_port": [

    	  ],
    	  "cmdb_ci_disk": [
    		{
    		  "computer": "host-1033",
    		  "size_bytes": 587128266752,
    		  "device_id": "mpx.vmhba1:C0:T0:L0",
    		  "device_lun": "key-vim.host.ScsiDisk-0000000000766d686261313a303a30",
    		  "correlation_id": "0000000000766d686261313a303a30",
    		  "name": "Local VMware Disk (mpx.vmhba1:C0:T0:L0)",
    		  "vendor": "VMware",
    		  "model": "Block device",
    		  "datastores": [
    			"datastore-1183",
    			"datastore-184"
    		  ]
    		},
    		{
    		  "computer": "host-109",
    		  "size_bytes": 587128266752,
    		  "device_id": "mpx.vmhba1:C0:T0:L0",
    		  "device_lun": "key-vim.host.ScsiDisk-0000000000766d686261313a303a30",
    		  "correlation_id": "0000000000766d686261313a303a30",
    		  "name": "Local VMware Disk (mpx.vmhba1:C0:T0:L0)",
    		  "vendor": "VMware",
    		  "model": "Block device",
    		  "datastores": [
    			"datastore-184",
    			"datastore-103"
    		  ]
    		}
    	  ],
    	  "cmdb_ci_fc_disk": [

    	  ],
    	  "cmdb_ci_iscsi_disk": [

    	  ]
    	}
    */
    //////////////////////////////////////////////////////////////////////////
    function process(result) {

        var name;
        getProbeParms();
        _this = this;

		if (esxSysId)
			 lookUpSysIds = VMUtils.lookupSysIdsESX; 
		else
			lookUpSysIds = VMUtils.lookupSysIds;
		
        args.location = this.getLocationID();
        args.statusId = new DiscoveryStatus(g_probe.getParameter('agent_correlator') + '');
		args.mutexPrefix = datacenterMorId || esxSysId ;
        args.ignoreStaleness = true;

        // During normal discovery g_probe_parameters should always be defined.
        // It's only undefined during test execution.
        if (typeof g_probe_parameters != 'undefined') {
            g_probe_parameters.cidata = this.getParameter('cidata');
            g_probe_parameters.source = this.getParameter('source');
        }

        args.results = JSON.parse(output);
        args.results.cmdb_ci_ip_address = [];

        VMUtils.triggerNextPage(_this, args.results.leftOverMors);

        JsonCi.prepare(args);
        JsonCi.writeJsObject(args, this.getLocationID(), this.statusID);
        JsonCi.writeRelationships(args);
        enableCmpApi && DiscoveryCMPUtils.callCmpApi(args.results, vCenterUuid, datacenterMorId);

        createIScsiRels();
        createFcRels();

        //do L3 mapping for ESX servers
        if (gs.getProperty('glide.discovery.L3_mapping', 'false') == 'true') {

            //loop through each ESX to create L3 mapping
            for (name in esxMap) {
                var ciid = esxMap[name] + '';
                if (!ciid)
                    continue;

                var cigr = new GlideRecord("cmdb_ci");

                if (!cigr.get('sys_id', ciid))
                    continue;

                var gru = GlideScriptRecordUtil.get(cigr);
                cigr = gru.getRealRecord();

                var DL3M = new DeviceL3Mapping(cigr);
                DL3M.map();

            }
        }


    }

    //////////////////////////////////////////////////////////////////////////
    function createFcRels() {


        var diskArr = [];
        args.results.cmdb_ci_fc_disk.forEach(
            function(disk) {
                try {
                    var rawWwnn, wwnn, wwpn, vols,
                        initiators = [],
                        targets = [],
                        wwInfo = {};

                    if (disk.targets) {
                        for (rawWwnn in disk.targets) {
                            wwnn = StorageWWN.parse(rawWwnn);
                            wwInfo[wwnn] = wwInfo[wwnn] || {};

                            for (wwpn in disk.targets[rawWwnn]) {
                                wwpn = StorageWWN.parse(wwpn);
                                wwInfo[wwnn][wwpn] = 1;
                                targets.push(wwpn);
                            }
                        }
                    }

                    if (disk.initiators) {
                        for (rawWwnn in disk.initiators) {
                            wwnn = StorageWWN.parse(rawWwnn);
                            for (wwpn in disk.initiators[rawWwnn]) {
                                wwpn = StorageWWN.parse(wwpn);
                                initiators.push(wwpn);
                                reconcileInitiatorInfo(disk, wwnn, wwpn);
                            }
                        }
                    }

                    reconcileTargetInfo(disk, wwInfo);

                    vols = sr.createFCDiskToVolumeRel(disk.sys_id, disk.device_lun, targets, initiators);
                    removeIncorrectRels(disk.sys_id, vols);
                } catch (e) {
                    var error = e.msg || e.toString();
                    if (error.indexOf('Controller is empty for FC') != -1) {
                        if (disk.name != undefined && diskArr.indexOf(disk.name) == -1)
                            diskArr.push(disk.name);
                    } else {
                        DiscoveryLogger.warn(error, 'VCenterESXHostsStorageSensor', _this.getEccQueueId());
                    }

                }
            });
        if (diskArr.length > 0) {
            errorHandler({
                msg: "Controller is empty for FC Ports: ",
                disk_ids: diskArr,
                sys_class: 'cmdb_ci_fc_disk',
                code: 'SN-1701'
            });
        }


        function reconcileInitiatorInfo(disk, wwnn, wwpn) {
            var gr = new GlideRecord('cmdb_fc_initiator');
            gr.addQuery('fc_disk', disk.sys_id);
            gr.addQuery('wwpn', wwpn);
            gr.query();

            if (gr.next()) {
                gr.wwnn = wwnn;
                gr.wwpn = wwpn;
                gr.update(); // no op if nothing changes
            } else {
                gr.initialize();
                gr.fc_disk = disk.sys_id;
                gr.wwnn = wwnn;
                gr.wwpn = wwpn;
                gr.insert();
            }
        }

        // Populate wwnn and wwpn for the paths from this server to FC disks in cmdb_fc_target table
        function reconcileTargetInfo(disk, wwInfo) {
            var gr = new GlideRecord('cmdb_fc_target');
            gr.addQuery('fc_disk', disk.sys_id);
            gr.query();

            // Go through what's in the db and reconcile it with what we found
            while (gr.next()) {
                if (wwInfo[gr.wwnn] && wwInfo[gr.wwnn][gr.wwpn])
                    delete wwInfo[gr.wwnn][gr.wwpn];
                else
                    gr.deleteRecord();
            }

            // Insert whats left over
            for (var nName in wwInfo) {
                var curInfo = wwInfo[nName];
                for (var pName in curInfo) {
                    gr.initialize();
                    gr.fc_disk = disk.sys_id;
                    gr.wwnn = nName;
                    gr.wwpn = pName;
                    gr.insert();
                }
            }
        }
    }

    //////////////////////////////////////////////////////////////////////////
    function createIScsiRels() {

        var diskArr = [];
        args.results.cmdb_ci_iscsi_disk.forEach(
            function(disk) {
                try {
                    var vols = sr.createISCSIDiskToVolumeRel(disk.sys_id, disk.device_lun, disk.iqn, disk.initiator_iqn);
                    removeIncorrectRels(disk.sys_id, vols);
                } catch (e) {
                    var error = e.msg || e.toString();
                    if (error.indexOf('iSCSI Export not found for target IQN:') != -1) {
                        if (disk.iqn != undefined && diskArr.indexOf(disk.iqn) == -1)
                            diskArr.push(disk.iqn);
                    } else {
                        DiscoveryLogger.warn(error, 'VCenterESXHostsStorageSensor', _this.getEccQueueId());
                    }
                }
            });
        if (diskArr.length > 0) {
            errorHandler({
                msg: "iSCSI Export not found for, target IQNs:",
                disk_ids: diskArr,
                sys_class: 'cmdb_ci_iscsi_disk',
                code: 'SN-1700'
            });

        }

    }

    /////////////////////////////////////////////////////////////////////////
    function errorHandler(errors) {
        var idStr = '';
        var len = (errors.disk_ids.length < 5) ? errors.disk_ids.length : 5;
        for (var i = 0; i < len; i++)
            idStr += errors.disk_ids[i].toString() + ", ";
        if (len > 5)
            idStr += 'and many more';
        errors.msg += idStr;

		var errorParams = {
			code: errors.code,
			instance: args.statusId.sysID,
			key: vCenterSysId + '_' + errors.sys_class,
			contextMap: {
				ip_address: null,
				device_class: null
			},
			message: errors.msg
		};
        DiscoveryErrorsUtilities.addError(errorParams);
    }

    //////////////////////////////////////////////////////////////////////////
    function removeIncorrectRels(diskSysId, volumes) {

        // Geneva and Helsinki could create incorrect disk to volume relationships.
        // Remove the incorrect relationships here.
        var gr = new GlideRecord('cmdb_rel_ci');
        gr.addQuery('child', diskSysId);
        // This is the sys_id of Exports to::Imports from
        gr.addQuery('type', '0e8ffb1537303100dcd445cbbebe5d40');
        gr.addQuery('parent.sys_class_name', 'cmdb_ci_storage_volume');
        gr.query();
        while (gr.next()) {
            if (!volumes['' + gr.parent])
                gr.deleteRecord();
        }
    }

    //////////////////////////////////////////////////////////////////////////
    function fixupDisk(disk) {
        var datastores,
            mm = MakeAndModelJS.fromNames(disk.vendor || '', disk.model || '', 'hardware');

        disk.storage_type = disk.storage_type || 'disk';
        disk.device_interface = disk.device_interface || 'scsi';
        disk.manufacturer = disk.vendor = '' + mm.getManufacturerSysID();
        disk.model_id = '' + mm.getModelNameSysID();

		disk.computer = lookUpSysIds(disk.computer, 'cmdb_ci_esx_server', esxSysId || vCenterSysId , 'morid');
		datastores = lookUpSysIds(disk.datastores, 'cmdb_ci_vcenter_datastore', esxSysId || vCenterSysId);


        gr = new GlideRecord('cmdb_ci_vcenter_datastore_disk');
		if (!esxSysId)
			gr.addQuery('vcenter_uuid', vCenterUuid);
        gr.addQuery('name', disk.device_id);
        gr.addQuery('datastore', 'IN', datastores);
        gr.query();
        disk.cmdb_ci_vcenter_datastore_disk = [];
        while (gr.next())
            disk.cmdb_ci_vcenter_datastore_disk.push('' + gr.sys_id);
    }

    //////////////////////////////////////////////////////////////////////////
    function fixupHba(hba) {
        var mm = MakeAndModelJS.fromNames(null, hba.model_id, 'hardware');
        hba.model_id = '' + mm.getModelNameSysID();
        hba.wwnn = StorageWWN.parse(hba.wwnn);

		hba.computer = lookUpSysIds(hba.computerMorid, 'cmdb_ci_esx_server', esxSysId || vCenterSysId, 'morid');
    }

    //////////////////////////////////////////////////////////////////////////
    function fixupFcPort(port) {
        port.wwnn = StorageWWN.parse(port.wwnn);
        port.wwpn = StorageWWN.parse(port.wwpn);
        port.speed = new DiscoveryDataRate(port.speed, DiscoveryDataRate.Units.GBps).to(DiscoveryDataRate.Units.GFC) + ' GFC';
        port.name = 'FC Port ' + port.wwpn;

        port.controller = args.results.cmdb_ci_storage_hba[port.controller];
		port.computer = lookUpSysIds(port.controller.computerMorid, 'cmdb_ci_esx_server', esxSysId || vCenterSysId , 'morid');

    }

    //////////////////////////////////////////////////////////////////////////
    function fixupNic(nic) {

        nic.ip_address = nic.ip_address || '';
        nic.dhcp_enabled = nic.dhcp_enabled || 0;
        nic.virtual = nic.virtual || 0;

		nic.cmdb_ci = lookUpSysIds(nic.cmdb_ci, 'cmdb_ci_esx_server', esxSysId || vCenterSysId, 'morid');

        if (nic.ip_address) {
            var morid = (nic.cmdb_ci.morid || nic.cmdb_ci) + '';
            esxMap[morid] = nic.cmdb_ci;
            args.results.cmdb_ci_ip_address.push({
                name: nic.name,
                ip_address: nic.ip_address,
                ip_version: 4,
                nic: nic,
                netmask: nic.netmask
            });

        }

    }

    //////////////////////////////////////////////////////////////////////////
    function getProbeParms() {
		vCenterSysId = (g_probe.getParameter('vcenter_sys_id') || '') + '';
	    vCenterUuid  = (g_probe.getParameter('vcenter_uuid') || '') + '';
		datacenterSysId =  (g_probe.getParameter('datacenter_sys_id') || '') + ''; 
		datacenterMorId =  (g_probe.getParameter('datacenter_mor_id') || '') + '';
        debug = '' + g_probe.getParameter('debug');
        enableCmpApi = DiscoveryCMPUtils.isCmpActive() && (('' + g_probe.getParameter('enable_cmp_qa')) == 'true');
		esxSysId = (g_probe.getParameter('esx_sys_id') || '') + '';
    }

})();
