/* jshint -W030 */
ObjectPolyfill;
ArrayPolyfill;
 
var VMWarevCenterNetworksProbe = Class.create();

(function() {

var _this,
	output = { },
	networks = [ ],
	dvpgs = [ ],
	dvss = [ ];

//////////////////////////////////////////////////////////////////////////
VMWarevCenterNetworksProbe.prototype = Object.extendsObject(AVMWareProbe, {

    process : function() {
		var name, output,
			debug = ('' + probe.getParameter('debug')) == 'true',
			leftOverMors = JSON.parse('' + probe.getParameter('mor_ids')),
			// Average measured size of a network is 1000 bytes.  Default page size
			// of 500 leaves us well below the 5 MB limit.
			pageSize = parseInt(probe.getParameter('page_size')) || 500,
			networkMorIds = leftOverMors.splice(0, pageSize),
			originalData = [ ],
			datamap = {
				Network: {
					'summary.accessible': 'accessible',
					name: 'name',
					host: [ { } ],
					vm: [ { } ]
				},
				DistributedVirtualPortgroup: {
					config: {
						distributedVirtualSwitch: { }
					},
					'summary.accessible': 'accessible',
					name: 'name',
					host: [ { } ],
					vm: [ { } ]
				},
				DistributedVirtualSwitch: {
					name: 'name',
					portgroup: [ { } ],
					summary: {
						hostMember: [ { } ],
						host: [ { } ],
						vm: [ { } ]
					}
				}
			},
			fixers = {
				Network: fixNetwork,
				DistributedVirtualPortgroup: fixDvpg,
				VmwareDistributedVirtualSwitch: fixDvs,
				DistributedVirtualSwitch: fixDvs
			};

		if (!this.serviceInstance)
			return;

		_this = this;

		/*
		Sample data.  Truncated for brevity, so possibly inconsistent:
			[
			  {
				"type": "DistributedVirtualPortgroup",
				"morid": "dvportgroup-28",
				"accessible": true,
				"name": "DC1_DVPG0",
				"host": [
				  {
					"type": "HostSystem",
					"morid": "host-5624"
				  },
				  {
					"type": "HostSystem",
					"morid": "host-7452"
				  }
				],
				"vm": [
				  {
					"type": "VirtualMachine",
					"morid": "vm-1612"
				  },
				  {
					"type": "VirtualMachine",
					"morid": "vm-9068"
				  }
				]
			  },
			  {
				"type": "VmwareDistributedVirtualSwitch",
				"morid": "dvs-23",
				"name": "DC1_DVS"
			  }
			]
		*/
		// Iterate over the MOR IDs of networks we're going to explore
		networkMorIds.forEach(
			function(network) {
				try {
					// Create a managed object for the current network, fetch data for it
					// See http://pubs.vmware.com/vsphere-60/index.jsp#com.vmware.wssdk.apiref.doc/vim.Network.html
					var networkConnectionObj,
						networkType = network.type,
						mor = new vim25.ManagedObjectReference();

					mor.setType(networkType);
					mor.setVal(network.morid);
					networkConnectionObj = vim25.mo.util.MorUtil.createExactManagedEntity(_this.serverConnection, mor);
					network = _this.getPropsForUnknownType(networkConnectionObj, datamap);

					// If we're debugging, save the data we fetched
					if (debug)
						originalData.push(JSON.stringify(network));

					// Fixup the data.
					fixers[networkType] && fixers[networkType](network, networkConnectionObj);
				} catch (e) {
					this.probe.appendWarning('Caught exception when processing ' + network.type + ' ' + network.morid + ': ' + e.toString());
				}
			});

		output = {
			cmdb_ci_vcenter_network: networks,
			cmdb_ci_vcenter_dv_port_group: dvpgs,
			cmdb_ci_vcenter_dvs: dvss
		};
	
		// We fetched at most pageSize networks.  Send back the IDs of remaining networks so the
		// sensor can fire another probe.
		if (leftOverMors.length)
			output.leftOverMors = leftOverMors;

		if (debug)
			output.originalData = originalData.map(JSON.parse);

		this.output = JSON.stringify(output, function(key, value) { if (key != "mo") return value; });
	},

	type : 'VMWarevCenterNetworksProbe'
});

//////////////////////////////////////////////////////////////////////////
function fixNetwork(network) {
	extractMORs(network.host);
	extractMORs(network.vm);

	network.cmdb_ci_esx_server = network.host;
	delete network.host;

	networks.push(network);
}

//////////////////////////////////////////////////////////////////////////
function fixDvpg(dvpg, networkConnectionObj) {
	extractMORs(dvpg.host);
	extractMORs(dvpg.vm);

	dvpg.cmdb_ci_esx_server = dvpg.host;
	delete dvpg.host;

	dvpg.dvs_ref = dvpg.config.distributedVirtualSwitch.morid;
	delete dvpg.config;

	var vlanInfo = getVLANInformation(dvpg, networkConnectionObj);	
	if (vlanInfo.hasOwnProperty('pvlanId')) {
		// Prive VLAN information
		dvpg.vlan_type = 'private_vlan';
		dvpg.private_vlan_id = vlanInfo.pvlanId;
	} else if (vlanInfo.hasOwnProperty('vlanId')) {
		if (typeof vlanInfo.vlanId == 'number') {
			// VLAN information
			dvpg.vlan_type = 'vlan';
			dvpg.vlan_id = vlanInfo.vlanId;
		} else if ((vlanInfo.vlanId instanceof Array) && (vlanInfo.vlanId.length > 0)) {
			// VLAN trunking information
			dvpg.vlan_type = 'vlan_trunking';
			dvpg.vlan_trunk_start_range = vlanInfo.vlanId[0].startRange;
			dvpg.vlan_trunk_end_range = vlanInfo.vlanId[0].endRange;
		}
	}

	dvpgs.push(dvpg);
}

//////////////////////////////////////////////////////////////////////////
function fixDvs(dvs) {
	extractMORs(dvs.summary.host);
	extractMORs(dvs.summary.hostMember);
	extractMORs(dvs.summary.vm);
	extractMORs(dvs.portgroup);

	dvs.cmdb_ci_esx_server = dvs.summary.host.concat(dvs.summary.hostMember);
	dvs.vm = dvs.summary.vm;

	dvs.host_count = dvs.cmdb_ci_esx_server.length;
	dvs.vm_count = dvs.vm.length;

	delete dvs.summary;

	dvss.push(dvs);
}

//////////////////////////////////////////////////////////////////////////
function extractMORs(a) {
	a.forEach(function(o, idx) { a[idx] = o.morid; });
}

/*
* The VLAN information for the "DistributedVirtualPortgroup". There are 3 different VLAN types
* 1. Private VLAN
* 2. VLAN trunking
* 3. VLAN
* 
* Below we try to use different datamap for getting individual VLAN detail as their response
* varies with VLAN type
*
* INPUT: 
*       dvpg - A distributed virtual port group's data object
*       dvpgConnection - vCenter Connection object that we trying to reuse
*
* OUTPUT:
*       A map containing output according to the VLAN type i.e., and nothing if no VLAN ID is used
*
* If it's a Private VLAN	:	{ "pvlanId":15 }
* If it's a VLAN trunking	:	{ "vlanId":[ {"endRange":4094,"startRange":0} ] }
* If it's a VLAN			:	{ "vlanId":10 }
**/	
//////////////////////////////////////////////////////////////////////////
function getVLANInformation(dvpg, dvpgConnectionObj) {
	var vlan, dvpgVLANInfo,
		dvpgDatamap = {
				DistributedVirtualPortgroup: {
					config: {
						defaultPortConfig: {
							vlan: { vlanId: 'vlanId', pvlanId: 'pvlanId' }
						}
					}
				}
			};

	// Resets the previous vlan configuration if exists in CMDB for the current CI
	dvpg.vlan_type = dvpg.vlan_id = dvpg.vlan_trunk_start_range = dvpg.vlan_trunk_end_range = dvpg.private_vlan_id = '',
	
	dvpgVLANInfo = _this.getPropsForUnknownType(dvpgConnectionObj, dvpgDatamap);
	vlan = dvpgVLANInfo.config.defaultPortConfig.vlan;

	if (vlan.hasOwnProperty('vlanId') && typeof vlan.vlanId != 'number') {
		dvpgDatamap.DistributedVirtualPortgroup.config.defaultPortConfig.vlan.vlanId = [ { start: 'startRange', end: 'endRange' } ];
		dvpgVLANInfo = _this.getPropsForUnknownType(dvpgConnectionObj, dvpgDatamap);
	}
	
	return dvpgVLANInfo.config.defaultPortConfig.vlan;
}

})();
