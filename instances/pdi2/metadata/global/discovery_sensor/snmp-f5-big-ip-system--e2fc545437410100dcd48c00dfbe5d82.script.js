new DiscoverySensor({
	
	args: {  //provided to JsonCi
		schema: {
			cmdb_ci_lb_service: {
				index: [ "name", "load_balancer" ],
				parentOf: {
					cmdb_ci_lb: "Runs on::Runs",
					cmdb_ci_lb_pool: "Uses::Used by"
				},
				childOf: {
					cmdb_ci_appl: "Distributed by::Distributes",
					cmdb_ci_computer: "Distributed by::Distributes"
				}
			},
			cmdb_ci_lb_pool: {
				index: [ "name", "load_balancer" ]
			},
			cmdb_ci_lb_pool_member: {
				index: [ "name", "pool", "ip_address", "service_port" ],
				childOf: { cmdb_ci_lb_pool: "Members::Member of" }
			},
			cmdb_ci_lb_vlan: {
				index: [ "name", "load_balancer" ]
			},
			cmdb_ci_lb_interface: {
				index: [ "name", "load_balancer" ]
			},
			cmdb_lb_vlan_interface: {
				index: [ "vlan", "vlan_interface" ]
			},
			cmdb_lb_service_vlan: {
				index: [ "service", "vlan" ]
			}
		},
		results: {  //placeholders to be populated in this sensor
			cmdb_ci_lb: [],
			cmdb_ci_lb_service: [],
			cmdb_ci_lb_pool: [],
			cmdb_ci_lb_pool_member: [],
			cmdb_ci_lb_interface: []
		}
	},
	
	LB_MODES: {
		0: 'round-robin',
		1: 'ratio-member',
		2: 'least-connections-member',
		3: 'observed-member',
		4: 'predictive-member',
		5: 'ratio-node',
		6: 'least-connections-node',
		7: 'fastest-node',
		8: 'observed-node',
		9: 'predictive-node',
		10: 'dynamic-ratio-node',
		11: 'fastest-application',
		12: 'least-sessions',
		13: 'dynamic-ratio-member',
		14: 'l3-address',
		15: 'weighted-least-connections-member',
		16: 'weighted-least-connections-node',
		17: 'ratio-session'
	},
	
	// mappings of pool and service data needed for references and relationships
	_poolNameToPoolObject: {},
	_poolNameToIpAndPortArray: {},
	_serviceNameToServiceObject: {},
	_vlanNameToVlanObject: {},
	_interfaceNameToInterfaceObject: {},
	_ipAndPortToServiceObject: {},
	
	
	process: function(result) {
		var resultFormat = this.getParameter("result_format");
		if (JSUtil.nil(resultFormat) || resultFormat.toLowerCase() != "json") {
			DiscoveryLogger.warn("Probe parameter 'result_format' equal to 'JSON' is required, aborting sensor", 'SNMP - F5 - System - V2 sensor', this.getEccQueueId(), null);
			return;
		}
		
		var json = new JSON();
		this.resultObj = json.decode(result['#text']);
		this.lbId = ''+this.getCmdbRecord().sys_id;


		this._setOperStatus();
		this._processGlobalInfo();
		this._processInterfaces();
		this._processVlans();
		this._processVlanInterfaces(); // requires interfaces and vlans		
		this._processPools();
		this._processPoolMembers();
		this._processServices(); // requires VIPs - otherwise launches another probe
		this._processServiceVlans(); // requires services and vlans
		this._relateDependencies(); // requires pools, pool members, and services

		this.getCmdbRecord().update(); // commit any updates to the load balancer base data

		JsonCi.prepare(this.args);
		JsonCi.writeJsObject(this.args);
		JsonCi.writeRelationships(this.args);
		
		this._updateInstallStatus('cmdb_ci_lb_service');
		this._updateInstallStatus('cmdb_ci_lb_pool');
		this._updateInstallStatus('cmdb_ci_lb_pool_member');
		this._updateInstallStatus('cmdb_ci_lb_vlan');
		this._updateInstallStatus('cmdb_ci_lb_interface');
	},
	
	_setOperStatus : function() {
		var operStatus = this._convertOperStatus(this.resultObj.sysCmFailoverStatusId);
		if (operStatus == -1) {
			DiscoveryLogger.info('Retrieving failover status using legacy OID', this.getEccQueueId(), null);     
			operStatus = this._convertOperStatusOld(this.resultObj.sysAttrFailoverUnitMask);
		}
		
		this.getCmdbRecord().operational_status = operStatus;
	},
	
	_convertOperStatus : function(deviceOperStatus) {
		if (deviceOperStatus == '1')
			return 2;
		else if (deviceOperStatus == '2')
			return 2;
		else if (deviceOperStatus == '3')
			return 2;
		else if (deviceOperStatus == '4')
			return 1;
		else
			return -1;
	},
	
	_convertOperStatusOld : function(deviceOperStatus) {
		if (deviceOperStatus == '0')
			return 2;
		else if (deviceOperStatus == '1')
			return 2;
		else if (deviceOperStatus == '2')
			return 2;
		else if (deviceOperStatus == '3')
			return 1;
		else
			return 1; //default value for cmdb_ci.operational_status
	},


	_processGlobalInfo: function() {
		var globalInfoEntries = this.resultObj.gtmWideipEntry;
		if (JSUtil.nil(globalInfoEntries))
			return;
		
		// get the current ip_address gr
		var iGr = new GlideRecord('cmdb_ci_ip_address');
		iGr.addQuery('ip_address', this.getCmdbRecord().ip_address);
		iGr.query();
		if (!iGr.next())
			return;
		
		// populate the cmdb_ci_dns_name
		for (var entryIndex in globalInfoEntries) {
			var entry = globalInfoEntries[entryIndex];
			// skip if this entry is not enabled
			if (entry.gtmWideipEnabled != '1')
				continue;
			
			// update dns table. Set up a mutex to update the table safely. 
			var mutexName = 'WideIPName:' + entry.gtmWideipName;
			var mutex = new Mutex(mutexName);
			// limit our attempt to get a mutex to 60 seconds...
			mutex.setSpinWait(500);
			mutex.setMaxSpins(120);
			mutex.setMutexExpires(60000); 
			if (mutex.get()) {
				try {
					this._updateDNSTable(entry, iGr);
				
				} finally {
					mutex.release();
				}
			} else 
				//lock failed
				DiscoveryLogger.warn("Unable to get mutex to update DNS table for " + mutexName, 'SNMP - F5 BIG-IP - System V2 sensor', this.getEccQueueId(), null);
		}
	},
	
	_updateDNSTable: function (entry, ipGr){
		var dGr = new GlideRecord('cmdb_ci_dns_name');
		dGr.addQuery('name',entry.gtmWideipName);
		dGr.query();
		// if this dns name does not exist, insert it
		if (!dGr.hasNext()) {
			dGr.name = entry.gtmWideipName;
			dGr.insert();
		} else
			dGr.next();
		
		// if the cmdb_ip_address_dns_name does not exist for this IP and DNS name, insert it
		var relGr = new GlideRecord('cmdb_ip_address_dns_name');
		relGr.addQuery('dns_name', dGr.sys_id);
		relGr.addQuery('ip_address', ipGr.sys_id);
		relGr.query();
		if (!relGr.hasNext()) {
			relGr.dns_name = dGr.sys_id;
			relGr.ip_address = ipGr.sys_id;
			relGr.insert();
		}
	},
	
	_processInterfaces: function() {
		var interfaces = [];
		
		var interfaceEntries = this.resultObj.sysInterfaceEntry;
		if (JSUtil.nil(interfaceEntries))
			return;
		
		for (var entryIndex in interfaceEntries) {
			var entry = interfaceEntries[entryIndex];
			var name = entry.sysInterfaceName;
			if (!name)
				continue;

			var iface = {
				name: name,
				load_balancer: this.lbId,
				mac_address: ( entry.sysInterfaceMacAddr ? entry.sysInterfaceMacAddr.replace(' ', ':', 'g') : null ),
				operational_status: ( entry.sysInterfaceStatus == 0 ? 1 : 2 ), // operational if up, non-operational otherwise
				install_status: 1
			};
			
			interfaces.push(iface);
			this._interfaceNameToInterfaceObject[name] = iface;
		}

		this.args.results.cmdb_ci_lb_interface = interfaces;
	},
	
	_processVlans: function() {
		var vlans = [];
		var vlanEntries = this.resultObj.sysVlanEntry;
		if (JSUtil.nil(vlanEntries))
			return;
		
		for (var entryIndex in vlanEntries) {
			var entry = vlanEntries[entryIndex];
			var name = entry.sysVlanVname;
			if (JSUtil.nil(name))
				continue;
			
			var vlan = {
				name: name,
				load_balancer: this.lbId,
				tag: entry.sysVlanId,
				install_status: 1
			};
			
			vlans.push(vlan);
			this._vlanNameToVlanObject[name] = vlan;
		}
		
		this.args.results.cmdb_ci_lb_vlan = vlans;
	},

	_processVlanInterfaces: function() {
		var vlanMembers = [];
		var vlanMemberEntries = this.resultObj.sysVlanMemberEntry;
		if (JSUtil.nil(vlanMemberEntries))
			return;
		
		for (var entryIndex in vlanMemberEntries) {
			var entry = vlanMemberEntries[entryIndex];
			var vlanName = entry.sysVlanMemberParentVname;
			var interfaceName = entry.sysVlanMemberVmname;
			if (JSUtil.nil(vlanName) || JSUtil.nil(interfaceName))
				continue;
			
			var vlan = this._vlanNameToVlanObject[vlanName];
			var iface = this._interfaceNameToInterfaceObject[interfaceName];
			if (JSUtil.nil(vlan) || JSUtil.nil(iface))
				continue;
			
			var vlanMember = {
				vlan: vlan,
				vlan_interface: iface,
				tagged: ( entry.sysVlanMemberTagged !== '0' )
			};
			
			vlanMembers.push(vlanMember);
		}
		
		this.args.results.cmdb_lb_vlan_interface = vlanMembers;
	},
	
	_processPools: function() {
		var pools = [];
		var poolEntries = this.resultObj.ltmPoolEntry;
		if (JSUtil.nil(poolEntries))
			return;
	
		for (var entryIndex in poolEntries) {
			var entry = poolEntries[entryIndex];
			var name = entry.ltmPoolName;
			if (JSUtil.nil(name))
				continue;
			
			var pool = {
				name: name,
				load_balancer: this.lbId,
				load_balancing_method: this.LB_MODES[entry.ltmPoolLbMode] || null,
				install_status: 1
			};
			
			pools.push(pool);
			this._poolNameToPoolObject[name] = pool;
		}
		
		this.args.results.cmdb_ci_lb_pool = pools;
	},
	
	_processPoolMembers: function() {
		var poolMembers = [];
		var poolMemberEntries = this.resultObj.ltmPoolMemberEntry;
		if (JSUtil.nil(poolMemberEntries))
			return;
	
		for (var entryIndex in poolMemberEntries) {
			var poolMemberEntry = poolMemberEntries[entryIndex];
			var poolIp = this._hex2ip(''+poolMemberEntry.ltmPoolMemberAddr, poolMemberEntry.ltmPoolMemberAddrType);
			var poolPort = poolMemberEntry.ltmPoolMemberPort;
			var poolName = poolMemberEntry.ltmPoolMemberNodeName;
			if (JSUtil.nil(poolIp) || JSUtil.nil(poolPort))
				continue;
			
			var pool = this._poolNameToPoolObject[poolMemberEntry.ltmPoolMemberPoolName];
			if (JSUtil.nil(pool))
				continue;
			
			var poolMember = {
				name: poolName,
				ip_address: poolIp,
				service_port: poolPort,
				load_balancer: this.lbId,
				pool: pool,
				cmdb_ci_lb_pool: pool,
				install_status: 1
			};
			
			poolMembers.push(poolMember);

			if (JSUtil.nil(this._poolNameToIpAndPortArray[pool.name]))
				this._poolNameToIpAndPortArray[pool.name] = [];
			
			this._poolNameToIpAndPortArray[pool.name].push(poolMember.name);
		}
		
		//old way since name was composed of ip_address + service_port
		if (!this._isNewIdentifierMode())
			this.args.schema.cmdb_ci_lb_pool_member.index = [ "pool", "ip_address", "service_port" ]; 		

		this.args.results.cmdb_ci_lb_pool_member = poolMembers;
	},
	
	_processServices: function() {
		var services = [];
		var serviceEntries = this.resultObj.ltmVirtualServEntry;
		if (JSUtil.nil(serviceEntries)) {
			//fire SSH probe to discover the missing VIPs that do not responed to SNMP and try to
			//discover them by SSH. there is need to define credentials for that.
			//all this depend if the system property that allow to fire SSH is on.
			var isNeedToFireSshProbe = JSUtil.toBoolean(gs.getProperty("glide.discovery.sensors.fire_ssh_probe", "false"));
			if (isNeedToFireSshProbe) {
				DiscoveryLogger.info('fire F5 SSH probe from SNMP sensor for VIPs');
				var probe = new SncProbe.get('JavaScript - F5 - System'); // the value of the discovery_probes.name field for the probe to launch
				if (probe) {
					probe.setSource(this.getSource());
					probe.setMidSelectDetails(this.getParameter('mid_selector_details'));
					probe.create(this.getAgent());
				}
			}	
			return;
		}
		
		for (var entryIndex in serviceEntries) {
			var entry = serviceEntries[entryIndex];
			
			if (JSUtil.nil(entry.ltmVirtualServAddr) || JSUtil.nil(entry.ltmVirtualServName))
				continue;

			var ipAddress = this._hex2ip(entry.ltmVirtualServAddr, entry.ltmVirtualServAddrType);
			if (ipAddress == '0.0.0.0')
				continue;

			var name = entry.ltmVirtualServName;
			var poolName = entry.ltmVirtualServDefaultPool || null;
			var pool = this._poolNameToPoolObject[poolName] || null;
			var loadBalancer = {
				sys_id: this.lbId
			};
			
			var service = {
				name: name,
				ip_address: ipAddress,
				port: entry.ltmVirtualServPort,
				load_balancer: this.lbId,
				operational_status: (entry.ltmVirtualServEnabled == 1 ? 1 : 2),
				pool: pool,
				cmdb_ci_lb: loadBalancer,
				cmdb_ci_lb_pool: pool,
				install_status: (entry.ltmVirtualServEnabled == 1 ? 1 : 100)
			};
			
			services.push(service);
			this._serviceNameToServiceObject[name] = service;
			
			var ipAndPortArr = this._poolNameToIpAndPortArray[poolName];
			for (var i = 0; i < ipAndPortArr.length; i++) {
				var ipAndPort = ipAndPortArr[i];
				this._ipAndPortToServiceObject[ipAndPort] = service;
			}
		}

		this.args.results.cmdb_ci_lb_service = services;
	},
	
	_processServiceVlans: function() {
		var serviceVlans = [];
		var serviceVlanEntries = this.resultObj.ltmVirtualServVlanEntry;
		if (JSUtil.nil(serviceVlanEntries))
			return;
		
		for (var entryIndex in serviceVlanEntries) {
			var serviceVlanEntry = serviceVlanEntries[entryIndex];
			var serviceName = serviceVlanEntry.ltmVirtualServVlanVsName;
			var vlanName = serviceVlanEntry.ltmVirtualServVlanVlanName;
			if (JSUtil.nil(serviceName) || JSUtil.nil(vlanName))
				continue;
			
			var service = this._serviceNameToServiceObject[serviceName];
			var vlan = this._vlanNameToVlanObject[vlanName];
			if (JSUtil.nil(service) || JSUtil.nil(vlan))
				continue;
			
			var serviceVlan = {
				service: service,
				vlan: vlan
			};
			
			serviceVlans.push(serviceVlan);
		}

		this.args.results.cmdb_lb_service_vlan = serviceVlans;
	},
	
	
	_relateDependencies: function() {
		for (var ipAndPort in this._ipAndPortToServiceObject) {
			var service = this._ipAndPortToServiceObject[ipAndPort];
			var parts = ipAndPort.split(':');  //ip:port
			if (JSUtil.nil(service) || parts.length != 2)
				continue;
			
			this._relateConnections(parts[0], parts[1], service);
		}
	},
	
	_relateConnections: function(ip, port, service) {
		var gr = new GlideRecord('cmdb_tcp');
		gr.addQuery('absent', false);
		gr.addQuery('type', 'on');
		gr.addQuery('ip', ip);
		gr.addQuery('port', port);
		gr.setLimit(1);
		gr.query();
		while (gr.next()) {
			// attempt to link the pool member to the application
			if (!JSUtil.nil(gr.process)) {
				var applGr = new GlideRecord('cmdb_ci_appl');
				applGr.addQuery('running_process', gr.process.sys_id);
				applGr.setLimit(1);
				applGr.query();
				if (applGr.next()) {
					var appl = {
						sys_id: applGr.sys_id
					};
					service.cmdb_ci_appl = appl;
					continue;
				}
			}
			
			// no app found, relate computer
			if (!JSUtil.nil(gr.computer)) {
				var computerGr = new GlideRecord('cmdb_ci_computer');
				if (computerGr.get(gr.computer.sys_id)) {
					var computer = {
						sys_id: computerGr.sys_id
					};
					service.cmdb_ci_computer = computer;
				} else {
					DiscoveryLogger.warn('Unable to load computer CI: ' + gr.computer.sys_id);
				}
			}
		}
	},

	/**
	 * Converts a space-delimited hex string to an IP address.
	 * Handles only IPv4 addresses as defined by InetAddressIPv4 and InetAddressIPv4z (see INET-ADDRESS-MIB)
	 * Other types will be ignored
	 * Example: "0a c4 1f 2c" and "0a c4 1f 2c 00 00 ff ff" both convert to "10.196.31.44"
	 * @param hexstr Space delimited hex string
	 * @param addrType Number representing an 
	 */
	_hex2ip: function(hexstr, addrType) {
		if (gs.nil(hexstr) || hexstr == 'undefined')
			
			return null;
		
		if (addrType != 1 && addrType != 3) {  //IPv4 and IPv4z, respectively
			this.debug('SNMP - F5 BIG-IP - System V2: IP address conversion: hexstr=' + hexstr + ', addrType=' + addrType);
			
			return null;
		}
		
		var ip = null;
        var words = hexstr.split(' ', 4);
		for (var i = 0; i < words.length; ++i)
			words[i] = parseInt(words[i], 16);

		ip = words.join('.');
		if (ip != null && ip.indexOf('.') > -1 && SncAddress32Bit.validate(ip))
	
			return ip;
		else {
			DiscoveryLogger.warn('Cannot convert value "' + hexstr + '" to a valid IP address',
					'SNMP - F5 BIG-IP - System V2 Sensor', this.getEccQueueId(), this.deviceCi.data.sys_id);

			return null;
		}
	},
	
	_updateInstallStatus: function(table) {
		var installed = {}; //sys_id: <dummy value>
		var tableResults = this.args.results[table];
		tableResults.forEach(
			function(obj) {
				installed[obj.sys_id] = 1;
			});
		
		var gr = new GlideRecord(table);
		gr.addQuery('load_balancer', this.lbId);
		gr.addQuery('install_status', 1);  //the sensor code above always sets to 1 on applicable tables
		gr.query();
		
		while (gr.next()) {
			if (installed.hasOwnProperty(gr.sys_id))
				continue;
			
			gr.install_status = 100;
			gr.update();
		}
	},
	
	//Load balancer new Identifier is based on name, IP and service port and we query 
	//actual snmp device pool member name. Hence determine if it is 1st run based on 
	//this new identifer and make sure pool member name has been updated correctly using old
	//identifier. Any subsequent discovery for this LB should use only new identifier 
	_isNewIdentifierMode: function(){
		var gr = new GlideRecord("cmdb_ci_lb_pool_member");
		gr.addQuery("load_balancer",this.lbId);
		gr.query();
		
		while (gr.next()) {
			var composedPoolName = gr.ip_address + ":" + gr.service_port; //old way of naming
			
			//check if actual snmp device queried name
			if (gr.name != composedPoolName) { 
				return true;//based on name, ip ,port and pool
			} else if (gr.name == composedPoolName && gr.install_status != 100 ) {  //100 is 'Absent'
				return false;
			}
		}
		return true;
	},
	
});
