new DiscoverySensor({
	
	args: {  //provided to JsonCi
		schema: {
			cmdb_ci_lb_service: {
				index: [ "name", "ip_address", "port", "load_balancer" ],
				parentOf: {
					cmdb_ci_lb: "Runs on::Runs",
					cmdb_ci_lb_pool: "Uses::Used by"
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
			}
		},
		results: {  //placeholders to be populated in this sensor
			cmdb_ci_lb_service: [],
			cmdb_ci_lb_pool: [],
			cmdb_ci_lb_pool_member: []
		}
	},
	
	// mappings of pool and service data needed for references and relationships
	_poolNameToPoolObject: {},
	_serverNameToPoolName: {},
	
	process: function(result) {
		var resultFormat = this.getParameter("result_format");
		if (JSUtil.nil(resultFormat) || resultFormat.toLowerCase() != "json") {
			DiscoveryLogger.warn("Probe parameter 'result_format' equal to 'JSON' is required, aborting sensor", 'SNMP - Netscaler - System - V2 sensor', this.getEccQueueId(), null);
			return;
		}
		
		var json = new JSON();
		this.resultObj = json.decode(result['#text']);
		this.lbId = ''+this.getCmdbRecord().sys_id;

		this._processPools();
		this._processPoolMembers();
		this._processServerServices();
		this._processServices();
		this._processVlans();

		this.getCmdbRecord().update(); // commit any updates to the load balancer base data

		JsonCi.prepare(this.args);
		JsonCi.writeJsObject(this.args);
		JsonCi.writeRelationships(this.args);
		
		this._updateInstallStatus('cmdb_ci_lb_service');
		this._updateInstallStatus('cmdb_ci_lb_pool');
		this._updateInstallStatus('cmdb_ci_lb_pool_member');
		this._updateInstallStatus('cmdb_ci_lb_vlan');
	},
	
	_setOperStatus: function() {
		var operStatus = this.convertOperStatus(this.resultObj.sysHighAvailabilityMode);
		this.getCmdbRecord().operational_status = operStatus;
	},
	
	_convertOperStatus: function(deviceOperStatus) {
		if (deviceOperStatus == '0')
			return 1;	
		else if (deviceOperStatus == '1')
			return 1;
		else if (deviceOperStatus == '2')
			return 2;
		else 
			return 2;
	},
	
	_processPools: function() {
		var pools = [];
		
		var poolEntries = this.resultObj.serviceGroupEntry;
		if (JSUtil.nil(poolEntries))
			return;
	
		for (var entryIndex in poolEntries) {
			var entry = poolEntries[entryIndex];
			var name = entry.svcgrpSvcGroupName;
			var fullName = entry.svcgrpSvcGroupFullName;
			
			if (!name)
				continue;
			
			// rename existing pools to use the fullName
			if (fullName) {
				var poolsGr = new GlideRecord('cmdb_ci_lb_pool');
				poolsGr.addQuery('name', name);
				poolsGr.addQuery('load_balancer', this.lbId);
				poolsGr.query();
				poolsGr.setValue('name', fullName);
				poolsGr.updateMultiple();
				name = fullName;
			}
			
			var pool = {
				name: name,
				load_balancer: this.lbId,
				install_status: 1
			};
			
			pools.push(pool);
			this._poolNameToPoolObject[name] = pool;
		}
		
		this.args.results.cmdb_ci_lb_pool = pools;
	},
	
	_processPoolMembers: function() {
		var poolMembers = [];
		var poolMemberEntries = this.resultObj.serviceGroupMemberEntry;
		if (JSUtil.nil(poolMemberEntries))
			return;
	
		for (var entryIndex in poolMemberEntries) {
			var poolMemberEntry = poolMemberEntries[entryIndex];
			var poolIp = poolMemberEntry.svcGrpMemberPrimaryIPAddress;
			var poolPort = poolMemberEntry.svcGrpMemberPrimaryPort;
			
			if (JSUtil.nil(poolIp) || JSUtil.nil(poolPort))
				continue;
			
			// look for pool object using full name first, then short name
			// if we have poolFullName here, we do not need to rename existing pool records
			// since _processPools does that and runs before
			var poolFullName = poolMemberEntry.svcGrpMemberGroupFullName;
			var poolName = poolMemberEntry.svcGrpMemberGroupName;
			var pool = this._poolNameToPoolObject[poolFullName];
			if (JSUtil.nil(pool)) {
				pool = this._poolNameToPoolObject[poolName];
				if (JSUtil.nil(pool))
					continue;
			}
			
			var poolMemberFullName = poolMemberEntry.svcGrpMemberFullName;
			var poolMemberName = poolMemberEntry.svcGrpMemberName;
			if (poolMemberFullName) {
				// rename existing members with the short name to use the full name
				var poolMemberGr = new GlideRecord('cmdb_ci_lb_pool_member');
				poolMemberGr.addQuery('name', poolMemberName);
				poolMemberGr.addQuery('ip_address', poolIp);
				poolMemberGr.addQuery('service_port', poolPort);
				poolMemberGr.addQuery('load_balancer', this.lbId);
				poolMemberGr.addQuery('pool.name', pool.name);
				poolMemberGr.query();
				poolMemberGr.setValue('name', poolMemberFullName);
				poolMemberGr.updateMultiple();
				
				poolMemberName = poolMemberFullName;
			}
				
			var poolMember = {
				name: poolMemberName,
				ip_address: poolIp,
				service_port: poolPort,
				load_balancer: this.lbId,
				pool: pool,
				cmdb_ci_lb_pool: pool,
				install_status: 1
			};
			
			poolMembers.push(poolMember);
		}

		//old way since name was composed of ip_address + service_port
		if (!this._isNewIdentifierMode())
			this.args.schema.cmdb_ci_lb_pool_member.index = [ "pool", "ip_address", "service_port" ]; 
		
		this.args.results.cmdb_ci_lb_pool_member = poolMembers;
	},
	
	_processServerServices: function() {
		var arrayUtil = new ArrayUtil();  
		var serverServiceEntries = this.resultObj.vserverServiceEntry;
		if (JSUtil.nil(serverServiceEntries))
			return;
		
		for (var entryIndex in serverServiceEntries) {
			var entry = serverServiceEntries[entryIndex];
			var serverName = entry.vserverFullName;
			var serviceName = entry.vsvrServiceFullName;
			if (JSUtil.nil(serverName) || JSUtil.nil(serviceName))
				continue;
			
			var poolName = serviceName.split('?')[0];  //get the group name from the full name of the service
			this._serverNameToPoolName[serverName] = poolName;
		}
	},
	
	_processServices: function() {
		var services = [];
		var serviceEntries = this.resultObj.vserverEntry;
		if (JSUtil.nil(serviceEntries))
			return;
		
		for (var entryIndex in serviceEntries) {
			var entry = serviceEntries[entryIndex];
			
			//The MID Server may filter this data but it is worth avoiding if not
			if (entry.vsvrIpAddress == '0.0.0.0')
				continue;
			
			var shortName = entry.vsvrName;
			var fullName = entry.vsvrFullName;
			
			//use the fullName if we get one back
			var name = shortName;
			if (JSUtil.notNil(fullName)) {
				name = fullName;
			
				//change existing services to use the full name
				if (shortName != fullName) {
					var serviceGr = new GlideRecord('cmdb_ci_lb_service');
					serviceGr.addQuery('load_balancer', this.lbId);
					serviceGr.addQuery('name', shortName);
					serviceGr.query();
					if (serviceGr.getRowCount() > 0) {
						serviceGr.setValue('name', fullName);
						serviceGr.updateMultiple();
					}
				}
			}
			
			var poolName = 	this._serverNameToPoolName[name];
			var pool = this._poolNameToPoolObject[poolName];
			var loadBalancer = {
				sys_id: this.lbId
			};

			services.push( {
					name: name,
					ip_address: entry.vsvrIpAddress,
					port: entry.vsvrPort,
					load_balancer: this.lbId,
					cmdb_ci_lb: loadBalancer,
					cmdb_ci_lb_pool: pool,
					install_status: 1
				}
			);
		}

		this.args.results.cmdb_ci_lb_service = services;
	},
	
	_processVlans: function() {
		var vlans = [];
		var vlanEntries = this.resultObj.vlanEntry;
		if (JSUtil.nil(vlanEntries))
			return;
		
		for (var entryIndex in vlanEntries) {
			var entry = vlanEntries[entryIndex];
			var name = entry.vlanAliasName;
			if (JSUtil.nil(name))
				continue;
			
			vlans.push( {
					name: name,
					load_balancer: this.lbId,
					tag: entry.vlanId,
					install_status: 1
				}
			);
		}
		
		this.args.results.cmdb_ci_lb_vlan = vlans;
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
