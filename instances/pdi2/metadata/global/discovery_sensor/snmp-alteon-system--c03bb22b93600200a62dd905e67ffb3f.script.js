new SnmpSensor({
    
    LB_METHODS: {
        
        2: 'Least-Connections',
        1: 'Round-Robin',
        3: 'Min-Misses',
        5: 'Response-Time',
        6: 'Server-Bandwidth',
        4: 'IP-Hash',
        7: 'Persistent-Hash',
        8: 'Least-Connections-per-Service'
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
				retireMissing: true,
            }
        ]);

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
        this._getVirtualServers();
        this._processVirtualServices();


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

            
        var entries = this.getProbeTable('interfaces', 'ipCurCfgIntfEntry');

        if (typeof entries === 'undefined'){
            DiscoveryLogger.warn('No interface entries in payload', 'SNMP - Alteon - System', this.getEccQueueId(), null);
            return;
        }

        for (var entryIndex in entries) {
            var entry = entries[entryIndex];    

            var anInterface = new Ci(interfaceCiOptions, {
                index: entry.ipCurCfgIntfIndex,
                name: entry.ipCurCfgIntfIndex, //no name for the interface so the address will be used instead.
                load_balancer: this.deviceCi,
                mac_address: 'NONE',
                // mac_address: ( entry.axInterfaceMacAddr ? entry.axInterfaceMacAddr.replace(' ', ':', 'g') : null ),
                operational_status: ( entry.ipCurCfgIntfState === 2 ? 0 : 1 ) // operational if 2, non-operational otherwise
            });
            this.deviceCi.addReferral(anInterface);
        }
    },


        _getServers: function() {
        var servers=[];
        var serverPorts=this._getServerPorts();
        var entries = this.getProbeTable('servers', 'slbCurCfgEnhRealServerEntry');
        if (typeof entries === 'undefined'){
            DiscoveryLogger.warn('No server entries in payload', 'SNMP - Alteon - System', this.getEccQueueId(), null);
            return;
        }
        
        for (var entryIndex in entries) {
            var entry = entries[entryIndex]; 
            var fixedServerName;
            if (entry.slbCurCfgEnhRealServerName === null) {
                fixedServerName = entry.slbCurCfgEnhRealServerIndex;
            }
            else {
                fixedServerName = entry.slbCurCfgEnhRealServerName;
            }       
            var server = {
                'index':entry.slbCurCfgEnhRealServerIndex,
                'name':fixedServerName, 
                'address':entry.slbCurCfgEnhRealServerIpAddr,
                'enabled':entry.slbCurCfgEnhRealServerState,    
                'port': null  //to be populated later since it is on another data structure 
            };
            for ( var i in serverPorts){
                serverPort=serverPorts[i];
                if(serverPort.serverIndex === server.index){
                    //server index is a match so poulate the port and leave...
                    server.port = serverPort.port;
                    break;
                }
            }
            servers.push(server);
        }

        return servers;
    },


        
    _getServerPorts: function() {
        var serverPorts=[];
        var entries = this.getProbeTable('serverPorts', 'slbCurCfgEnhRealServPortEntry');
        if (typeof entries === 'undefined'){
            DiscoveryLogger.warn('No server port entries in payload', 'SNMP - Alteon - System', this.getEccQueueId(), null);
            return;
        }
        for (var entryIndex in entries) {
            var entry = entries[entryIndex];        
            var serverPort = {
                'port':entry.slbCurCfgEnhRealServRealPort, 
                'serverIndex':entry.slbCurCfgEnhRealServIndex   
            };
            serverPorts.push(serverPort);
        }
        
        return serverPorts;
    },


    _getServersGroupPairs: function() {
        var serverGroupPairs=[];
        var entries = this.getProbeTable('serversGroups', 'slbEnhGroupRealServersEntry');
        if (typeof entries === 'undefined'){
            DiscoveryLogger.warn('No server group entries in payload', 'SNMP - Alteon - System', this.getEccQueueId(), null);
            return;
        }
        for (var entryIndex in entries) {
            var entry = entries[entryIndex];        
            var serverGroupPair = {
                'groupIndex':entry.slbEnhRealServerGroupIndex, 
                'serverIndex':entry.slbEnhGroupRealServerIndex
            };
            serverGroupPairs.push(serverGroupPair);
        }
        
        return serverGroupPairs;
    },



    
    _processGroups: function() {
        var entries = this.getProbeTable('groups', 'slbCurCfgEnhGroupEntry');
        if (typeof entries === 'undefined'){
            DiscoveryLogger.warn('No group entries in payload', 'SNMP - Alteon - System', this.getEccQueueId(), null);
            return;
        }
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
            var poolFixedName;
            if (entry.slbCurCfgEnhGroupName === null) {
                poolFixedName = entry.slbCurCfgEnhGroupIndex;
            }
            else {
                poolFixedName = entry.slbCurCfgEnhGroupName;
            }
            var pool = new Ci(poolCiOptions, {
                index: entry.slbCurCfgEnhGroupIndex || null,
                name: poolFixedName,
                load_balancer: this.deviceCi,
                load_balancing_method: this.LB_METHODS[entry.slbCurCfgEnhGroupMetric] || null
            });
            
           this.deviceCi.addReferral(pool);
        }
    },  


    _processGroupMembers: function() {
        var servers=this._getServers(); 
        var serverGroupPairs=this._getServersGroupPairs();  
        var pools = this.deviceCi.getReferralsByTable('cmdb_ci_lb_pool');

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
        
        for (var serversIndex in servers) {
            var server = servers[serversIndex]; 
            var groupIndex;

            var poolMember = new Ci(poolMemberCiOptions, {
                ip_address: server.address,
                service_port: server.port,
                load_balancer: this.deviceCi,
                name: server.name, 
                pool: null // set later
            });

            //look for pool index
            for (var pairsIndex in serverGroupPairs){
                var serverGroupPair = serverGroupPairs[pairsIndex];
                if (serverGroupPair.serverIndex === server.index) {
                    //server found so populate group index
                    groupIndex=serverGroupPair.groupIndex;
                    //look for the pool according to pool index
                    for (var poolsIndex in pools){
                        var pool = pools[poolsIndex];

                        if (groupIndex === pool.data.index) {
                            //pool found so populate the member with pool
                            poolMember.data.pool=pool;
                            poolMember.addRelation(pool);
                            poolMember.data.pool.addReferral(poolMember);
							this.deviceCi.addReferral(poolMember);
                            break;
                        }
                    }
                    break;
                }
            }
        }       
    },      
    

    _getVirtualServers: function() {
        var virtualServers=[];
        var entries = this.getProbeTable('virtualServers', 'slbCurCfgEnhVirtualServerEntry');
        if (typeof entries === 'undefined'){
            DiscoveryLogger.warn('No virtual server entries in payload', 'SNMP - Alteon - System', this.getEccQueueId(), null);
            return;
        }
        for (var entryIndex in entries) {
            var entry = entries[entryIndex]; 
            var fixedVirtualName;
            if (entry.slbCurCfgEnhVirtServerVname === null){
                fixedVirtualName = entry.slbCurCfgEnhVirtServerIndex;
            }
            else {
                fixedVirtualName = entry.slbCurCfgEnhVirtServerVname;
            }       
            var virtualServer = {
                'index':entry.slbCurCfgEnhVirtServerIndex,
                'name':fixedVirtualName, 
                'state':entry.slbCurCfgEnhVirtServerState,
                'address':entry.slbCurCfgEnhVirtServerIpAddress
            };
            
            virtualServers.push(virtualServer);

        }

        return virtualServers;
    },

    _getGroupBindings: function() {
        var groupBindings=[];
        var entries = this.getProbeTable('groupBindings', 'slbCurCfgEnhVirtServicesSeventhPartEntry');
        if (typeof entries === 'undefined'){
            DiscoveryLogger.warn('No group to server/service entries in payload', 'SNMP - Alteon - System', this.getEccQueueId(), null);
            return;
        }
        for (var entryIndex in entries) {
            var entry = entries[entryIndex];        
            var groupBinding = {
                'virtualServiceIndex':entry.slbCurCfgEnhVirtServiceSeventhPartIndex,
                'virtualServerIndex':entry.slbCurCfgEnhVirtServSeventhPartIndex, 
                'groupIndex':entry.slbCurCfgEnhVirtServiceRealGroup
            };
            groupBindings.push(groupBinding);

        }

        return groupBindings;
    },

    _processVirtualServices: function() {
        var virtualServers = this._getVirtualServers();
        var entries = this.getProbeTable('virtualServices', 'slbCurCfgEnhVirtServicesEntry');
        var pools = this.deviceCi.getReferralsByTable('cmdb_ci_lb_pool');

        if (typeof entries === 'undefined'){
            DiscoveryLogger.warn('No service entries in payload', 'SNMP - Alteon - System', this.getEccQueueId(), null);
            return;
        }
        for (var entryIndex in entries) {
            var entry = entries[entryIndex];        
            var virtualService = {
                'serverIndex':entry.slbCurCfgEnhVirtServIndex,
                'serviceIndex':entry.slbCurCfgEnhVirtServiceIndex,
                'virtualPort':entry.slbCurCfgEnhVirtServiceVirtPort, 
                'realPort':entry.slbCurCfgEnhVirtServiceRealPort
            };

            var serviceCiOptions = {
                table: 'cmdb_ci_lb_service',
                indices: ['load_balancer', 'name', 'port', 'ip_address'],
                referrals: [
                    {   table: 'cmdb_lb_service_vlan',
                        referenceField: 'service',
						deleteMissing: false,
						retireMissing: true
                    }
                ],
                relations: [
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
						deleteMissingRelationship: true
                    }
                ]
            };

        
            var virtualServer ;
            //look for virtualServer according to virtual server index (resides on virtual service record)
            for (var virtualServersIndex in virtualServers){
                var currentVirtualServer = virtualServers[virtualServersIndex];
            
                if (virtualService.serverIndex === currentVirtualServer.index) {
                    //virtual server found so populate group 
                    virtualServer=currentVirtualServer;
                    break;
                }
            }
            
            if (virtualServer !== null) {
                var fixedName;
                if (virtualServer.name === null) {
                    fixedName = virtualServer.index;
                }
                else {
                    fixedName = virtualServer.name;
                }
            
                var service = new Ci(serviceCiOptions, {
                    // name: virtualServerPort.name+'@'+virtualServerPort.address+':'+virtualServerPort.port,
                    name: fixedName || null,
                    load_balancer: this.deviceCi,
                    ip_address: virtualServer.address || null,
                    port: virtualService.virtualPort || null,
                    operational_status: virtualServer.state || null, 
                    pool: 'LATER'
                });
            
            
                //find the group (pool) of the virtual server
                groupBindings = this._getGroupBindings();
                var groupIndexFromBinding ;
                for (var grouBindingsIndex in groupBindings){
            
                    var currentGroupBinding = groupBindings[grouBindingsIndex];
    
                    if (virtualService.serverIndex === currentGroupBinding.virtualServerIndex && virtualService.serviceIndex === currentGroupBinding.virtualServiceIndex) {
                        //group binding found so populate group index 
                        groupIndexFromBinding=currentGroupBinding.groupIndex;
                        break;
            
                    }
                }
           
                var foundPool;
                for (var poolIndex in pools){
                    var currentGroup = pools[poolIndex];

                    if (groupIndexFromBinding !== null && currentGroup.data.index === groupIndexFromBinding) {
                        //group found so populate group 
                        foundPool=currentGroup;
                        break;
                    }
                }
            
                //populate the pool of the service
                if (foundPool !== null && foundPool !== 'undefined') {
                    service.data.pool=foundPool;
                    //add reference to the service on the pool
                    service.data.pool.addReferral(service);
                    service.addRelation(foundPool);
                }   
            
            
                if (service.name !== null){
                    this.deviceCi.addReferral(service);
                    service.addRelation(this.deviceCi);
                }
                else {
                    DiscoveryLogger.warn('No virtual service name found in payload', 'SNMP - Alteon - System', this.getEccQueueId(), null);
                }
            }
        }
    }

});
