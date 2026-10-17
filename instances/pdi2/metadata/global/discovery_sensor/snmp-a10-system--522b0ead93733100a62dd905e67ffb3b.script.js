new SnmpSensor({
	
	LB_METHODS: {
		0: 'Round-Robin',
		1: 'Least-Connection',
		2: 'Service-Least-Connection',
		3: 'Weighted-Round-Robin',
		4: 'Weighted-Least-Connection',
		5: 'Service-Weighted-Least-Connection',
		6: 'Fastest-Response-Time',
		7: 'Least-Request',
		8: 'Round-Robin-Strict',
		9: 'Stateless-Source-IP-Hash',
		10: 'Stateless-Destination-IP-Hash',
		11: 'Stateless-Src-and-Dst-IP-Hash',
		12: 'Stateless-Per-Packet-Round-Robin',
		13: 'Stateless-Source-IP-Only-Hash',
		14: 'Source-IP-Only-Hash',
		15: 'Source-IP-Hash',
		16: 'Destination-Only-IP-Hash',
		17: 'Destination-IP-Hash'
	},	
		
	processSnmp: function(ci, snmp) {
		
		ci.defineReferrals([
			{   table: 'cmdb_ci_lb_pool',
			    referenceField: 'load_balancer',
				deleteMissing: false,
				retireMissing: true
			},
			{   table: 'cmdb_ci_lb_interface',
				referenceField: 'load_balancer',
				deleteMissing: false,
				retireMissing: true
			},
			{   table: 'cmdb_ci_lb_vlan',
			    referenceField: 'load_balancer',
				deleteMissing: false,
				retireMissing: true
			},
			{   table: 'cmdb_ci_lb_service',
				referenceField: 'load_balancer',
				deleteMissing: false,
				retireMissing: true
			},
			{   table: 'cmdb_ci_lb_pool_member',
				referenceField: 'load_balancer',
				deleteMissing: false,
				retireMissing: true
			}
		]);

//TODO: workaround for BSM map showing a "lonely" service ci when drawn
		ci.defineRelations([
			{   table: 'cmdb_ci_lb_service',
			    nature: 'Runs on::Runs',
			    isParent: false,
				deleteMissing: false,
				deleteMissingRelationship: false
			}
		]);

		
		this._processInterfaces();
		this._processGroups();
		this._processGroupMembers();
		this._processServices();

//currently not enabled !!!!!!!!!!!
//		this._processVlans();
//		this._processVlanInterfaces(); // requires interfaces & vlans
	},	
	
	_processInterfaces: function() {
		var interfaceCiOptions = {
			table: 'cmdb_ci_lb_interface',
			indices: ['load_balancer', 'name'],
			referrals: [{
				table: 'cmdb_lb_vlan_interface',
				referenceField: 'vlan_interface',
				deleteMissing: false,
				retireMissing: true
			}]
		};

			
		var entries = this.getProbeTable('interfaces', 'axInterfaceEntry');
		if (typeof entries === 'undefined')
			return;
		
		for (var entryIndex in entries) {
			var entry = entries[entryIndex];		
			var iface = new Ci(interfaceCiOptions, {
				index: entry.axInterfaceIndex,
				name: entry.axInterfaceName,
				load_balancer: this.deviceCi,
				mac_address: ( entry.axInterfaceMacAddr ? entry.axInterfaceMacAddr.replace(' ', ':', 'g') : null ),
				operational_status: ( entry.axInterfaceStatus == 'up' ? 0 : 1 ) // operational if up, non-operational otherwise
			});
			this.deviceCi.addReferral(iface);
		}
	},
	
	_processGroups: function() {
		var entries = this.getProbeTable('groups', 'axServiceGroupEntry');
		if (typeof entries === 'undefined')
			return;
		
		var poolCiOptions = {
			table: 'cmdb_ci_lb_pool',
			indices: ['load_balancer', 'name'],
			referrals: [
				{   table: 'cmdb_ci_lb_pool_member',
				    referenceField: 'pool',
					deleteMissing: false,
					retireMissing: true
				},
				{   table: 'cmdb_ci_lb_service',
				    referenceField: 'pool',
					deleteMissing: false,
					retireMissing: true
				}
            ],
            relations: [
				{
					table: 'cmdb_ci_lb_service',
					nature: 'Uses::Used by',
					isParent: false,
					deleteMissing: false,
					deleteMissingRelationship: false
				},
				{
					table: 'cmdb_ci_lb_pool_member',
					nature: 'Members::Member of',
					deleteMissing: false,
					deleteMissingRelationship: false

				}
			]
		};
		
		for (var entryIndex in entries) {
			var entry = entries[entryIndex];		
			var pool = new Ci(poolCiOptions, {
				name: entry.axServiceGroupName,
				load_balancer: this.deviceCi,
				load_balancing_method: this.LB_METHODS[entry.axServiceGroupLbAlgorithm] || null
			});

			if (pool.name === null)
				continue;

			this.deviceCi.addReferral(pool);
		}
	},	

	_processServers: function() {
		var servers=[];
		var entries = this.getProbeTable('servers', 'axServerEntry');
		if (typeof entries === 'undefined')
			return;
		
		for (var entryIndex in entries) {
			var entry = entries[entryIndex];		
			var server = {
				'name':entry.axServerName, 
				'address':entry.axServerAddress,
				'enabled':entry.axServerEnabledState			
			};
			servers.push(server);
		}
		return servers;
	},
		
	
	_processGroupMembers: function() {
		servers=this._processServers();		
		var pools = this.deviceCi.getReferralsByTable('cmdb_ci_lb_pool');
		var entries = this.getProbeTable('groupMembers', 'axServiceGroupMemberEntry');
		if (typeof entries === 'undefined')
			return;
		
		// process data
		var poolMemberCiOptions = {
			table: 'cmdb_ci_lb_pool_member',
			indices: ['name', 'pool', 'ip_address', 'service_port'],
			relations: [
				{
					table: 'cmdb_ci_lb_pool',
					nature: 'Members::Member of',
					isParent: false,
					deleteMissing: false,
					deleteMissingRelationship: false

				}
			]
		};
		
		for (var entryIndex in entries) {
			var entry = entries[entryIndex];		
			var serverAddress='unknown';
			for (var serversIndex in servers){
				var server = servers[serversIndex];
				if (entry.axServerNameInServiceGroupMember === server.name) {
					//server found so populate address
					serverAddress=server.address;
					break;
				}
			}


			var poolName = entry.axServiceGroupNameInMember;
			var poolMember = new Ci(poolMemberCiOptions, {
				ip_address: serverAddress,
				service_port: entry.axServerPortNumInServiceGroupMember,
				load_balancer: this.deviceCi,
				name: entry.axServerNameInServiceGroupMember, 
				pool: null // set later
			});
			
				
			if (gs.nil(poolMember.data.ip_address) || gs.nil(poolMember.data.service_port) || gs.nil(poolName)){
				continue;
			}

			// find the parent pool reference by name and associate
			for (var i = 0; i < pools.length; ++i) {
				if (pools[i].data.name === poolName) {
					poolMember.data.pool = pools[i];
					poolMember.addRelation(pools[i]);
				}
			}

			if (poolMember.data.pool === null){
				continue;
		   }
			   
			poolMember.data.pool.addReferral(poolMember);
			this.deviceCi.addReferral(poolMember);
		}		
	},		
	
	_processVirtualServerPorts: function() {
		var virtualServerPorts=[];
		var entries = this.getProbeTable('virtualServersPort', 'axVirtualServerPortEntry');
		if (typeof entries === 'undefined')
			return;
		
		for (var entryIndex in entries) {
			var entry = entries[entryIndex];		
			var virtualServerPort = {
				'name':entry.axVirtualServerPortName, 
				'type':entry.axVirtualServerPortType,
				'address':entry.axVirtualServerPortAddress,
				'port':entry.axVirtualServerPortNum,
				'enabled':entry.axVirtualServerPortEnabled,
				'group':entry.axVirtualServerPortServiceGroup				
			};
			virtualServerPorts.push(virtualServerPort);
		}
		return virtualServerPorts;
	},
	
	_processServices: function() {
		virtualServerPorts=this._processVirtualServerPorts();
		var pools = this.deviceCi.getReferralsByTable('cmdb_ci_lb_pool');

		var serviceCiOptions = {
			table: 'cmdb_ci_lb_service',
			indices: ['load_balancer', 'name'],
			referrals: [
				{   table: 'cmdb_lb_service_vlan',
				    referenceField: 'service',
					deleteMissing: false,
					retireMissing: true
				}
			],
			relations: [
				//TODO: workaround for BSM showing lonely services
				{   table: 'cmdb_ci_lb',
					nature: 'Runs on::Runs',
					deleteMissing: false,
					deleteMissingRelationship: false
				},
				{   table: 'cmdb_ci_computer',
					nature: 'Distributed by::Distributes',
					isParent: false,
					deleteMissing: false,
					deleteMissingRelationship: false

				},
				{   table: 'cmdb_ci_appl',
					nature: 'Distributed by::Distributes',
					isParent: false,
					deleteMissing: false,
					deleteMissingRelationship: false

				},
				{
					table: 'cmdb_ci_lb_pool',
					nature: 'Uses::Used by',
					deleteMissing: false,
					deleteMissingRelationship: false

				}
			]
		};

		for (var entryIndex in virtualServerPorts) {
			var virtualServerPort = virtualServerPorts[entryIndex];

//			if (gs.nil(entry.ltmVirtualServAddr)) {
//				DiscoveryLogger.warn("Virtual Server Address is null for " + entry.ltmVirtualServName, 'SNMP - F5 BIG-IP - System Sensor', this.getEccQueueId(), null);
//				continue; 
//			} 

			var service = new Ci(serviceCiOptions, {
				name: virtualServerPort.name+'@'+virtualServerPort.address+':'+virtualServerPort.port,
				load_balancer: this.deviceCi,
				ip_address: virtualServerPort.address,
				port: virtualServerPort.port,
				operational_status: 2,   //should be refactored to something real
				pool: virtualServerPort.group
			});


			//find the pool object and add it to the service
			for (var i = 0; i < pools.length; ++i) {
				if (pools[i].data.name === virtualServerPort.group) {
					service.data.pool = pools[i];
					service.data.pool.addReferral(service);
					service.addRelation(pools[i]);
				}
			}


			if (service.name === null)
				continue;

			this.deviceCi.addReferral(service);
			service.addRelation(this.deviceCi);
		}	
	},	

//currently not in use !!!!!!!!!!!!	
	_processVirtualServers: function() {
		var virtualServers=[];
		var entries = this.getProbeTable('virtualServers', 'axVirtualServerEntry');
		if (typeof entries === 'undefined')
			return;
		
		for (var entryIndex in entries) {
			var entry = entries[entryIndex];

			var virtualServer = {
				'name':entry.axVirtualServerName, 
				'address':entry.axVirtualServerAddress,
				'enabled':entry.axVirtualServerEnabled,
				'displayStatus':entry.axVirtualServerDisplayStatus
			};
			virtualServers.push(virtualServer);
		}
		return virtualServers;
	},		
	

//currently not enabled !!!!!!!!!!!!	
	_processVlans: function() {
		var entries = this.getProbeTable('vlans', 'axVlanCfgEntry');
		if (typeof entries === 'undefined'){
			return;
		}
		
		for (var entryIndex in entries) {
			var entry = entries[entryIndex];		
			var vlan = new Ci(vlanCiOptions, {
				name: entry. axVlanName || null,
				load_balancer: this.deviceCi,
				tag: entry. axVlanId || null
			});

			if (vlan.name === null)
				continue;

			this.deviceCi.addReferral(vlan);
		}
	},
	
//currently not enabled !!!!!!!!!!!!	
	_processVlanInterfaces: function() {
		var vlans = this.deviceCi.getReferralsByTable('cmdb_ci_lb_vlan');
		var interfaces = this.deviceCi.getReferralsByTable('cmdb_ci_lb_interface');
		var entries = this.getProbeTable('vlanInterfaces', 'axVlanCfgMemberEntry');
		if (typeof entries === 'undefined')
			return;
	
		// process data
		var vlanInterfaceCiOptions = {
			table: 'cmdb_lb_vlan_interface',
			indices: ['vlan', 'vlan_interface']
		};
		
		for (var index in entries) {
			var entry = entries[index];
			var vlanInterface = new Ci(vlanInterfaceCiOptions, {
				vlan: null, // set later
				vlan_interface: null,
				tagged: ( entry.axVlanMemberTagged !== '0' )
			});

			// find the associated vlan
			var vlanId = entry.axVlanMemberVlanId;
			for (var i = 0; i < vlans.length && vlanInterface.data.vlan === null; ++i) {
				if (vlans[i].data.tag === vlanId)
					vlanInterface.data.vlan = vlans[i];
			}

			// find the associated interface
			var interfaceId = entry.axVlanMemberIntfId;
			for (var i = 0; i < interfaces.length && vlanInterface.data.vlan_interface === null; ++i) {
				if (interfaces[i].data.index === interfaceId)
					vlanInterface.data.vlan_interface = interfaces[i];
			}		

			if (vlanInterface.data.vlan === null || vlanInterface.data.vlan_interface === null)
				continue;

			vlanInterface.data.vlan.addReferral(vlanInterface);
			vlanInterface.data.vlan_interface.addReferral(vlanInterface);
		}
	}
});
