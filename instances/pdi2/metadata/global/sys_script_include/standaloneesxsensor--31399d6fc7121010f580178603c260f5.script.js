/* jshint -W030 */

var StandaloneESXSensor;

var g_device;

(function() {

var _this, locationID, statusID,
	allVms = [ ],
	allDatastores = [ ],
	allNetworks = [ ],
	allHosts = [ ],
	allPools = [ ];

StandaloneESXSensor = {
	process: process,
	handleError: handleError,
	after: function() { this.updateObjectSource(current); },
	type: "DiscoverySensor"
};

/*
Sample data:
{
    "esx": {
        "type": "ServiceInstance",
        "morid": "ServiceInstance",
        "name": "VMware ESXi",
        "version": "6.5.0",
        "fullname": "VMware ESXi 6.5.0 build-4564106",
        "api_version": "6.5",
        "url": "https://10.198.9.12/sdk"
    },
    "cmdb_ci_esx_server": [
        {
            "type": "Datacenter",
            "morid": "ha-datacenter",
            "name": "ha-datacenter",
            "folder_morid": "ha-folder-vm",
            "host_morid": "ha-folder-host",
            "folders": {
                "type": "Datacenter",
                "morid": "ha-datacenter",
                "name": "ha-datacenter",
                "datastoreFolder": {
                    "type": "Folder",
                    "morid": "ha-folder-datastore",
                    "name": "datastore",
                    "childEntity": [
                        {
                            "type": "Datastore",
                            "morid": "59b7831f-ea7ffb48-2868-246e964df440",
                            "name": "ds912"
                        },
                        {
                            "type": "Datastore",
                            "morid": "589aa3d7-f4012253-ccf7-246e9625da7c",
                            "name": "vmstore"
                        },
                        {
                            "type": "Datastore",
                            "morid": "59827b29-61f860f7-d6cf-246e9625e19c",
                            "name": "ds1"
                        },
                        {
                            "type": "Datastore",
                            "morid": "59827b48-835f778a-212d-246e9625e19c",
                            "name": "ds2"
                        },
                        {
                            "type": "Datastore",
                            "morid": "59827b60-2812624c-8781-246e9625e19c",
                            "name": "ds3"
                        },
                        {
                            "type": "Datastore",
                            "morid": "5d5ce1b6-6daf82e6-6014-246e964df620",
                            "name": "qastore"
                        }
                    ]
                },
                "hostFolder": {
                    "type": "Folder",
                    "morid": "ha-folder-host",
                    "name": "host",
                    "childEntity": [
                        {
                            "type": "ComputeResource",
                            "morid": "ha-compute-res",
                            "name": "mut."
                        }
                    ]
                },
                "networkFolder": {
                    "type": "Folder",
                    "morid": "ha-folder-network",
                    "name": "network",
                    "childEntity": [
                        {
                            "type": "Network",
                            "morid": "HaNetwork-VM Network",
                            "name": "VM Network"
                        },
                        {
                            "type": "VmwareDistributedVirtualSwitch",
                            "morid": "50 17 8b df 0d c3 35 34-85 ab 61 e3 74 2a 15 d3",
                            "name": "DSwitch_qa"
                        },
                        {
                            "type": "DistributedVirtualPortgroup",
                            "morid": "DVPG-50 17 8b df 0d c3 35 34-85 ab 61 e3 74 2a 15 d3-dvportgroup-361",
                            "name": "DSwitch_qa-DVUplinks-360"
                        },
                        {
                            "type": "DistributedVirtualPortgroup",
                            "morid": "DVPG-50 17 8b df 0d c3 35 34-85 ab 61 e3 74 2a 15 d3-dvportgroup-362",
                            "name": "portGroup-1008"
                        }
                    ]
                },
                "vmFolder": {
                    "type": "Folder",
                    "morid": "ha-folder-vm",
                    "name": "vm",
                    "childEntity": [
                        {
                            "type": "VirtualMachine",
                            "morid": "420",
                            "name": "phaniVm2"
                        }
                    ]
                }
            }
        }
    ],
    "hosts": [
        "ha-host"
    ],
    "pools": [
        "ha-root-pool"
    ]
}

*/
//////////////////////////////////////////////////////////////////////////
function process(result) {

	var esx;

	if (!g_device)
		g_device = DeviceHistory.createDeviceHistory(source, null, this.getEccQueueId());

	// This disables the triggering of the associated probes.  Triggering
	// of probes will be handled dynamically below in processESX
	this.setTriggerProbes(false);

	_this = this;
	locationID = this.getLocationID();
	statusID = new DiscoveryStatus(g_probe.getParameter('agent_correlator')+'');

	// During normal discovery g_probe_parameters should always be defined.
	// It's only undefined during test execution.
	if (typeof g_probe_parameters != 'undefined') {
		g_probe_parameters.cidata = this.getParameter('cidata');
		g_probe_parameters.source = this.getParameter('source');
	}

	output = JSON.parse(output);

	esx = output.esx;

 	if (current) {
		current.url = esx.url;
		current.fullname = esx.fullname;
		current.api_version = esx.api_version;
	}

	var esxServer = {};
	if(output.esxdc && output.esxdc.length>0){
		esxServer.folders = output.esxdc[0].folders;
	}
	esxServer.hosts = output.hosts;
	esxServer.pools = output.pools;

	processESX(esxServer);
}

function handleError(errors) {
	// Only do this if we were triggered by port probe NOT process classifier
	if (!this.getCmdbRecord()) {
		DiscoverySensor.prototype.handleError.call(this, errors, {
			sourceName: 'VMWare - standalone ESX server',
			lastState: DiscoverySensor.HistoryStates.ACTIVE_COULDNT_CLASSIFY,
			deviceState: DiscoverySensor.DeviceStates.REJECTED,
			fireClassifiers: true
		});
	} else {
		DiscoverySensor.prototype.handleError.call(this, errors);
	}
}


//////////////////////////////////////////////////////////////////////////
function processESX(esxServer) {
	var datastores, clusters, networks, vms,
		folders = [ ],
		esxFolders = esxServer.folders;

	allHosts = allHosts.concat(esxServer.hosts);
	allPools = allPools.concat(esxServer.pools);

	datastores = extractFoldersAndChildren(esxFolders.datastoreFolder, folders, esxServer);
	clusters = extractFoldersAndChildren(esxFolders.hostFolder, folders, esxServer);
	networks = extractFoldersAndChildren(esxFolders.networkFolder, folders, esxServer);
	vms = extractFoldersAndChildren(esxFolders.vmFolder, folders, esxServer);



	allVms = allVms.concat(vms);
	allDatastores = allDatastores.concat(datastores);
	allNetworks = allNetworks.concat(networks);

	// Trigger probes configured to run after the datacenters sensor.
	triggerProbes(esxServer, datastores, clusters, networks, vms);
}

//////////////////////////////////////////////////////////////////////////
function triggerProbes(esxServer, stores, clusters, networks, vms) {

	var downstreamMors = {
		datastore: stores,
		network: networks,
		vm: vms,
		cluster: clusters
	},
	// Pass the downstream mors which will be used to trigger other probes
	parms = { downstream_mors:JSON.stringify(downstreamMors)};
	VMUtils.triggerProbes(_this, {host: esxServer.hosts}, parms);
}

//////////////////////////////////////////////////////////////////////////
function extractFoldersAndChildren(root, folders, esxServer) {
	var children = [ ];

	extractChildrenFromFolder(root, esxServer.name);

	return children;

	function extractChildrenFromFolder(parent, fullpath) {
		parent.cmdb_ci_vcenter_folder = [ ];
		parent.childEntity.forEach(
			function(child) {
				if (child.type == 'Folder') {
					child.fullpath = fullpath + ' | ' + child.name;
					folders.push(child);
					extractChildrenFromFolder(child, child.fullpath);
				} else if (child.type == 'VirtualApp')
					extractChildrenFromFolder(child, child.fullpath);
				else if (child.type == 'StoragePod') {
					children.push(child);
					extractChildrenFromFolder(child, child.fullpath);
				}
				else
					children.push(child);
			});
		delete parent.childEntity;
	}
}
})();
