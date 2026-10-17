
            
            /* jshint -W030 */
            ObjectPolyfill;
            ArrayPolyfill;

            var VMWarevCenterVMsProbe = Class.create();

            (function() {

                var _this, refreshOnly,
                    output = {},
                    dvpgDatamap = {
                        config: {
                            distributedVirtualSwitch: {}
                        }
                    };

                //////////////////////////////////////////////////////////////////////////
                VMWarevCenterVMsProbe.prototype = Object.extendsObject(AVMWareProbe, {

                    process: function() {
                        var name, output,
                            vms = [],
                            templates = [],
                            leftOverMors = JSON.parse('' + probe.getParameter('mor_ids')),
                            debug = ('' + probe.getParameter('debug')) == 'true',
                            // Average measured size of a VM is 637 bytes.  Default page size
                            // of 100 leaves us well below the 5 MB limit.
                            pageSize = parseInt(probe.getParameter('page_size')) || 100,
                            vmMorIds = leftOverMors.splice(0, pageSize),
                            originalData = [],
                            datamap = {
                                parent: {},
                                resourcePool: {},
                                parentVApp: {},
                                config: {
                                    hardware: {
                                        numCPU: 'cpus',
                                        memoryMB: 'memory',
                                        device: [{
                                            capacityInKB: 'capacity',
                                            macAddress: 'macAddress'
                                        }]
                                    },
                                    uuid: 'correlation_id',
                                    instanceUuid: 'vm_instance_uuid',
                                    files: {
                                        vmPathName: 'vmPathName'
                                    },
                                    template: function(value, o) {
                                        o.template = !!value.isTemplate();
                                    },
                                    guestId: 'guest_id',
                                    guestFullName: 'guest_os_fullname'
                                },
                                guest: {
                                    guestFullName: 'guest_vm_tool_os_fullname',
                                },
                                summary: {
                                    guest: {
                                        ipAddress: 'ipAddress',
                                        hostName: 'hostName'
                                    }
                                },
                                datastore: [{}],
                                runtime: {
                                    powerState: 'state',
                                    host: {}
                                },
                                name: 'name',
                                network: [{}]
                            },
                            refreshDatamap = {
                                runtime: {
                                    powerState: 'state'
                                }
                            };

                        datamap.config.hardware.device._filter = vmFilter;

                        refreshOnly = (this.getParameter('refresh_state') == 'true');
                        if (refreshOnly)
                            datamap = refreshDatamap;

                        if (!this.serviceInstance)
                            return;

                        _this = this;

                        /*
            Sample data.  Truncated for brevity, so possibly inconsistent:
            	[
            	  {
            		"type": "VirtualMachine",
            		"morid": "vm-4373",
            		"parent": {
            		  "type": "Folder",
            		  "morid": "group-v3"
            		},
            		"config": {
            		  "hardware": {
            			"cpus": 1,
            			"memory": 64,
            			"device": [
            			  {
            				"capacity": 524288
            			  },
            			  {
            				"macAddress": "00:50:56:a7:3c:c1"
            			  }
            			],
				guest_os_fullname: 'Microsoft Windows Server 2012 (64-bit)'
            		  },
			  guest: {
				guest_vm_tool_os_fullname: 'Microsoft Windows Server 2016 (64-bit)',
				toolsStatus: 'toolsNotRunning'
			  },
            		  "correlation_id": "42273e88-343c-9bda-96e1-9bd9680081f2",
            		  "vm_instance_uuid": "5027ad3b-f66e-fe70-ab41-5d2dcdc52521",
            		  "files": {
            			"vmPathName": "[SANLAB1GlobalDS_4] DC0_C1_RP2_VM11\/DC0_C1_RP2_VM11.vmx"
            		  },
            		  "template": false,
            		  "guest_id": "winNetStandardGuest"
            		},
            		"datastore": [
            		  {
            			"type": "Datastore",
            			"morid": "datastore-93"
            		  }
            		],
            		"runtime": {
            		  "state": {

            		  },
            		  "host": {
            			"type": "HostSystem",
            			"morid": "host-1078"
            		  }
            		},
            		"name": "DC0_C1_RP2_VM11",
            		"network": [
            		  {
            			"type": "DistributedVirtualPortgroup",
            			"morid": "dvportgroup-11"
            		  }
            		]
            	  }
            	]
            */
                        // Iterate over the MOR IDs of VMs we're going to process
                        vmMorIds.forEach(
                            function(vm) {
                                try {
                                    // Create a managed object for the current VM, fetch data for it
                                    // See http://pubs.vmware.com/vsphere-60/index.jsp#com.vmware.wssdk.apiref.doc/vim.VirtualMachine.html
                                    var mor = new vim25.ManagedObjectReference();
                                    mor.setType(vm.type);
                                    mor.setVal(vm.morid);
                                    vm = vim25.mo.util.MorUtil.createExactManagedEntity(_this.serverConnection, mor);
                                    vm = _this.getPropsForManagedObject(vm, datamap);
                                    // If we're debugging, save the data we fetched
                                    if (debug)
                                        originalData.push(JSON.stringify(vm));

                                    if (vm.config.template)
                                        templates.push(vm);
                                    else
                                        vms.push(vm);

                                    // Fixup the data.
                                    fixVM(vm);
                                } catch (e) {
                                    this.probe.appendWarning('Caught exception when processing ' + vm.type + ' ' + vm.morid + ': ' + e.toString());
                                }
                            });

                        output = {
                            cmdb_ci_vmware_instance: vms,
                            cmdb_ci_vmware_template: templates
                        };

                        // We fetched at most pageSize VMs.  Send back the IDs of remaining VMs so the
                        // sensor can fire another probe.
                        if (leftOverMors.length)
                            output.leftOverMors = leftOverMors;

                        if (debug)
                            output.originalData = originalData.map(JSON.parse);

                        this.output = JSON.stringify(output, function(key, value) {
                            if (key != "mo") return value;
                        });
                    },

                    type: 'VMWarevCenterVMsProbe'
                });

                //////////////////////////////////////////////////////////////////////////
                function vmFilter(vcenterObj, obj) {
                    if (vcenterObj instanceof vim25.VirtualDisk || vcenterObj instanceof vim25.VirtualEthernetCard) {
                        obj.mo = vcenterObj;
                        return true;
                    }
                }

                //////////////////////////////////////////////////////////////////////////
                function fixVM(vm) {
                    var name, dvpg, mor,
                        state = vm.runtime.state,
                        config = vm.config,
                        hardware = config.hardware,
                        devices = hardware.device;

                    if (state == 'poweredOn')
                        vm.state = 'on';
                    else if (state == 'poweredOff')
                        vm.state = 'off';
                    else
                        vm.state = 'paused';

                    vm.cmdb_ci_esx_morid = vm.runtime.host && vm.runtime.host.morid;

                    delete vm.runtime;

                    if (refreshOnly)
                        return;

                    vm.network.forEach(
                        function(network) {
                            if (network.type == 'DistributedVirtualPortgroup') {
                                mor = new vim25.ManagedObjectReference();
                                mor.setType(network.type);
                                mor.setVal(network.morid);
                                dvpg = vim25.mo.util.MorUtil.createExactManagedEntity(_this.serverConnection, mor);
                                dvpg = _this.getPropsForManagedObject(dvpg, dvpgDatamap);
                                if (dvpg.config && dvpg.config.distributedVirtualSwitch)
                                    vm.cmdb_ci_vcenter_dvs = dvpg.config.distributedVirtualSwitch.morid;
                            }
                        });

                    extractMORs(vm.datastore);
                    extractMORs(vm.network);

                    vm.cmdb_ci_vcenter_network = vm.network;
                    vm.cmdb_ci_vcenter_datastore = vm.datastore;
                    if (vm.resourcePool)
                        vm.cmdb_ci_esx_resource_pool = vm.resourcePool.morid;
                    if (vm.parentVApp)
                        vm.vapp = vm.parentVApp.morid;

                    for (name in config)
                        vm[name] = config[name];
                    for (name in hardware)
                        vm[name] = hardware[name];

                    vm.cmdb_ci_vcenter_folder = vm.parent.morid;

                    vm.object_id = vm.morid;

                    vm.image_path = config.files.vmPathName;

                    if (vm.summary.guest) {
                        if (vm.summary.guest.ipAddress)
                            vm.ip_address = vm.summary.guest.ipAddress;
                        if (vm.summary.guest.hostName)
                            vm.fqdn = vm.summary.guest.hostName;
                    }

                    vm.disks = 0;
                    vm.disks_size = 0;
                    vm.nics = 0;
                    vm.macs = [];

                    devices.forEach(
                        function(device) {
                            if (device.mo instanceof vim25.VirtualDisk) {
                                vm.disks_size += device.capacity;
                                vm.disks++;
                            } else {
                                vm.nics++; // We've already filtered hardware to have only disks & ethernet cards
                                vm.macs.push(device.macAddress);
                            }
                        });
                    vm.disks_size = (vm.disks_size / 1048576) | 0;

                    if (vm.guest && vm.guest.guest_vm_tool_os_fullname) {
                        vm.guest_os_fullname = vm.guest.guest_vm_tool_os_fullname;
                    }

                    delete vm.resourcePool;
                    delete vm.parentVApp;
                    delete vm.files;
                    delete vm.config;
                    delete vm.hardware;
                    delete vm.device;
                    delete vm.parent;
                    delete vm.network;
                    delete vm.datastore;
                    delete vm.guest;
                }

                //////////////////////////////////////////////////////////////////////////
                function extractMORs(a) {
                    a.forEach(function(o, idx) {
                        a[idx] = o.morid;
                    });
                }

            })();
