/* jshint -W030 */
ObjectPolyfill;
ArrayPolyfill;
 
var VMWarevCenterVMNICsProbe = Class.create();

(function() {

var _this, includeNics, includeDisks,
	output = { },
	vmNics = [ ],
	vmWithoutDisks = [ ],
	vmDisks = [ ],
	v4 = /[0-9]{1,3}(\.[0-9]{1,3}){3}/,
	masks = [
		'0.0.0.0',
		'128.0.0.0',       '192.0.0.0',       '224.0.0.0',       '240.0.0.0',
		'248.0.0.0',       '252.0.0.0',       '254.0.0.0',       '255.0.0.0',
		'255.128.0.0',     '255.192.0.0',     '255.224.0.0',     '255.240.0.0',
		'255.248.0.0',     '255.252.0.0',     '255.254.0.0',     '255.255.0.0',
		'255.255.128.0',   '255.255.192.0',   '255.255.224.0',   '255.255.240.0',
		'255.255.248.0',   '255.255.252.0',   '255.255.254.0',   '255.255.255.0',
		'255.255.255.128', '255.255.255.192', '255.255.255.224', '255.255.255.240',
		'255.255.255.248', '255.255.255.252', '255.255.255.254', '255.255.255.255' ];

//////////////////////////////////////////////////////////////////////////
VMWarevCenterVMNICsProbe.prototype = Object.extendsObject(AVMWareProbe, {

    process : function() {
		var name,
			debug = ('' + probe.getParameter('debug')) == 'true',
			vmMorIds = JSON.parse('' + probe.getParameter('mor_ids')),
			originalData = [ ],
			datamap = {
				config: {
					hardware: {
						device: [ {
							macAddress: 'macAddress',
							capacityInBytes: 'size',
							key: 'name',
							diskObjectId: 'volume_id',
							deviceInfo: {
								label: 'label'
							},
							backing: {
								fileName: 'filename'
							}
						} ]
					},
					template: function(value, o) { o.template = !!value.isTemplate(); },
				},
				guest: {
					ipAddress: 'ipAddress',
					ipStack: [ {
						ipRouteConfig: {
							ipRoute: [ {
								prefixLength: 'prefixLength',
								gateway: {
									device: 'device',
									ipAddress: 'ipAddress'
								}
							} ]
						}
					} ],
					net: [ {
						macAddress: 'macAddress',
						dnsConfig: [ { ipAddress: 'ipAddress' } ],
						ipConfig: {
							dhcp: {
								ipv4: {
									enable: function(value, o) { o.enable = !!value.isEnable(); }
								},
								ipv6: {
									enable: function(value, o) { o.enable = !!value.isEnable(); }
								}
							},
							ipAddress: [ {
								ipAddress: 'ipAddress',
								prefixLength: 'prefixLength'
							} ]
						}
					} ]
				}
			};

		if (!this.serviceInstance)
			return;

		_this = this;

		datamap.config.hardware.device._filter = vmFilter;
		includeNics = ('' + probe.getParameter('disable_vm_nic_vnics')) != 'true';
		includeDisks = ('' + probe.getParameter('disable_vm_nic_vdisks')) != 'true';

		/*
		Sample data.  Truncated for brevity:
			[
			  {
				"mo": {
				},
				"type": "VirtualMachine",
				"morid": "vm-3184",
				"config": {
				  "hardware": {
					"device": [
					  {
						"macAddress": "00:50:56:a7:b0:51",
						"mo": {
						}
					  }
					]
				  },
				  "template": false
				},
				"guest": {
				  "ipStack": [
				  ],
				  "net": [
					{
					  "macAddress": "00:50:56:a7:b0:51",
					  "dnsConfig": [
					  ],
					  "ipConfig": {
						"ipAddress": [
						  {
							"ipAddress": "172.16.7.76",
							"prefixLength": 24
						  }
						]
					  }
					}
				  ]
				}
			  },
			  {
				"mo": {
				},
				"type": "VirtualMachine",
				"morid": "vm-5494",
				"config": {
				  "hardware": {
					"device": [
					  {
						"macAddress": "00:50:56:a7:9b:fa",
						"mo": {
						}
					  }
					]
				  },
				  "template": false
				},
				"guest": {
				  "ipStack": [
				  ],
				  "net": [
					{
					  "macAddress": "00:50:56:a7:9b:fa",
					  "dnsConfig": [
					  ],
					  "ipConfig": {
						"ipAddress": [
						  {
							"ipAddress": "172.16.15.76",
							"prefixLength": 24
						  }
						]
					  }
					}
				  ]
				}
			  }
			]
		*/
		// Iterate over the MOR IDs of VMs we're going to get NICs for
		vmMorIds.forEach(
			function(vm) {
				try {
					// Create a managed object for the current VM, fetch data for its NICs
					// See http://pubs.vmware.com/vsphere-60/index.jsp#com.vmware.wssdk.apiref.doc/vim.VirtualMachine.html
					var mor = new vim25.ManagedObjectReference();
					mor.setType('VirtualMachine');
					mor.setVal(vm.morid || vm);
					vm = vim25.mo.util.MorUtil.createExactManagedEntity(_this.serverConnection, mor);
					vm = _this.getPropsForManagedObject(vm, datamap);

					// If we're debugging, save the data we fetched
					if (debug)
						originalData.push(JSON.stringify(vm));

					// Fixup the data.
					fixVM(vm);
				} catch (e) {
					this.probe.appendWarning('Caught exception when processing NICs for VirtualMachine ' + vm + ': ' + e.toString());
				}
			});

		output = {
			cmdb_ci_storage_volume: vmDisks,
			cmdb_ci_vmware_nic: vmNics,
			vm_without_disks : vmWithoutDisks
		};

		if (debug)
			output.originalData = originalData.map(JSON.parse);

		this.output = JSON.stringify(output);
	},

	type : 'VMWarevCenterVMNICsProbe'
});

//////////////////////////////////////////////////////////////////////////
function vmFilter(vcenterObj, obj) {
	if ((includeDisks && (vcenterObj instanceof vim25.VirtualDisk)) || (includeNics && (vcenterObj instanceof vim25.VirtualEthernetCard))) {
		obj.dd = vcenterObj;
		return true;
	}
}

//////////////////////////////////////////////////////////////////////////
function fixVM(vm) {
	var config = vm.config,
		hardware = config.hardware,
		devices = hardware.device,
		count = 0;

	// We've already filtered hardware to have only disks & ethernet cards
	devices.forEach(
		function(device) {
			if (device.dd instanceof vim25.VirtualDisk) {
				vmDisks.push({
					computer: vm.morid,
					label: device.deviceInfo.label,
					name: device.name,
					size_bytes: device.size,
					volume_id: device.volume_id,
					object_id: device.backing && device.backing.filename,
					vdisk_id: vm.morid + '-' + device.name
				});
				count++;
			}
			else
				vmNics.push(extractNic(device, vm));
				/*
				// Get the virtual manufacturer
				if (dd instanceof vim25.VirtualE1000)
					vm.card = 'Intel E1000';
				else if (dd instanceof vim25.VirtualE1000e)
					vm.card = 'Intel E1000e';
				else if (dd instanceof vim25.VirtualPCNet32)
					vm.card = 'AMD Lance PCNet32';
				else if (ff instanceof vim25.VirtualSriovEthernetCard)
					vm.card = 'SR-IOV';
				else if (ff instanceof vim25.VirtualVmxnet)
					vm.card = 'VMWare vmx';*/
		});
	if(count == 0)
		vmWithoutDisks.push(vm.morid);
		
}

//////////////////////////////////////////////////////////////////////////
function extractNic(device, vm) {
	var addresses, address, noPrefix, ipConfig,
		guest = vm.guest,
		net = guest && guest.net,
		ipStack = guest && ipStack,
		nic = {
			mac_address: device.macAddress,
			cmdb_ci: vm.morid
		};

	// 1. Find the net device with the mac address
	net = net && net.find(
		function(net) {
			return net.macAddress.toLowerCase() == device.macAddress.toLowerCase();
		});

	// 2. If we found it, try to get dns server, ip address, subnet mask & dhcp from it
	if (net) {
		ipConfig = net.ipConfig;
		
		// Just pick the first DNS server... but make sure there is at least one
				// Just pick the first DNS server...
		if(net.dnsConfig && net.dnsConfig.ipAddress.length > 0)
			nic.dns_server = net.dnsConfig.ipAddress[0];

		addresses = ipConfig && ipConfig.ipAddress;

		// Look for an IP V4 address first, then use IP V6
		if (addresses) {
			if (!addresses.find(isIpV4))
				addresses.find(isIpV6);
		}
	}

	// 3. Look for the gateway, preferring the default gateway
	if (nic.ip_address && ipStack) {
		if (!ipStack.some(useIpStack)) {
			noPrefix = true;
			ipStack.some(useIpStack);
		}
	}

	return nic;

	function useIpStack(stack) {
		if (stack.ipRouteConfig && stack.ipRouteConfig.ipRoute)
			return stack.ipRouteConfig.ipRoute.some(
				function(route, idx) {
					if ((idx == foundIdx) && (noPrefix || !route.prefixLength) && route.gateway && route.gateway.ipAddress) {
						nic.ip_default_gateway = route.gateway.ipAddress;
						return true;
					}
				});
	}

	function isIpV4(address, idx) {
		if (address.ipAddress && address.ipAddress.match(v4)) {
			foundIdx = idx;
			nic.ip_address = address.ipAddress;
			nic.subnet_mask = masks[address.prefixLength];
			nic.dhcp_enabled = ipConfig.dhcp && ipConfig.dhcp.ipv4 && ipConfig.dhcp.ipv4.enable;
			return true;
		}
	}
	
	function isIpV6(address, idx) {
		foundIdx = idx;
		nic.ip_address = address.ipAddress;
		nic.dhcp_enabled = ipConfig.dhcp && ipConfig.dhcp.ipv6 && ipConfig.dhcp.ipv6.enable;
	}
}

})();
