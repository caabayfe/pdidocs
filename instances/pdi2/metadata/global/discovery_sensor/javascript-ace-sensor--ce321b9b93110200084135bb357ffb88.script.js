/*
This CiscoCliSensor responble for mapping raw data,
that arriving from CiscoCliProber to CI in order to save it in CMDB.

The following inforamtion is saved at the end of this process:

        1. Information about the device interfaces
        2. Information about the device farms/groups/pools
        3. Information about the device members (real servers)
        4. Information about the device services (must for service mapping)
        4. Information about the device vlans - currently unsupported.

At the end of the discovery process you can explore this information graphically.

Raw Data Example:
<results probe_time="15272">
<result>
<device type="Cisco ACE LoadBalancder" version="Version A3(2.0) [build 3.0(0)A3(2.0) adbuild_17:35:22-2008/10/01_/auto/adbu-rel4/rel_a3_2_0_dev_build/REL_3_0_0_A3_2_0]">
    <groups>
        <group method="ROUNDROBIN" name="SF_test"/>
        <group method="ROUNDROBIN" name="SF_web"/>
    </groups>
    <servers>
        <server group="SF_web" ip="10.196.39.213" name="ibm_http_1" port="0"/>
        <server group="SF_web" ip="10.196.39.214" name="ibm_http_2" port="0"/>
    </servers>
    <interfaces>
        <interface MACAddress="00:1b:24:08:7c:a9" name="1.1" status="DOWN"/>
        <interface MACAddress="00:1b:24:08:7c:a9" name="1.2" status="DOWN"/>
        <interface MACAddress="00:1b:24:08:7c:a9" name="1.3" status="DOWN"/>
        <interface MACAddress="00:1b:24:08:7c:a9" name="1.4" status="UP"/>
    </interfaces>
    <vips>
        <vip group="SF_web" ip="10.196.33.199" name="VS_web" port="80" state="INSERVICE"/>
    </vips>
    </device>
</result>

*/

new CiscoCliSensor({

    processCiscoCliObject: function() {
      
        this.deviceCi.defineReferrals([{
            table: 'cmdb_ci_lb_pool',
            referenceField: 'load_balancer',
			deleteMissing: false,
			retireMissing: true
        }, {
            table: 'cmdb_ci_lb_interface',
            referenceField: 'load_balancer',
			deleteMissing: false,
			retireMissing: true
        }, {
            table: 'cmdb_ci_lb_vlan',
            referenceField: 'load_balancer',
			deleteMissing: false,
			retireMissing: true
        }, {
            table: 'cmdb_ci_lb_service',
            referenceField: 'load_balancer',
			deleteMissing: false,
			retireMissing: true
        }, {
            table: 'cmdb_ci_lb_pool_member',
            referenceField: 'load_balancer',
			deleteMissing: false,
			retireMissing: true
        }]);

        this.deviceCi.defineRelations([{
            table: 'cmdb_ci_lb_service',
            nature: 'Runs on::Runs',
            isParent: false,
			deleteMissing: false,
			deleteMissingRelationship: false
        }]);

        this.processInterfaces();
        this.processGroups();
        this.processGroupMembers();
        this.processVirtualServices();

    },

    /*
    This function mapping raw interfaces data to the CI table cmdb_ci_lb_interface
    */
    processInterfaces: function () {
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

        var interfaces = this.deviceResult.getInterfaces();

        if (interfaces === null) {
            gs.log(' ' + new Date().getTime() + 'CiscoCliSensor:processInterfaces: interfaces is null');
            return;
        }
        
        for (var i in interfaces) {
            var ciscoInterface = interfaces[i];
            this.__prepareInterfaces(ciscoInterface['@name'], ciscoInterface['@MACAddress'], ciscoInterface['@status'], interfaceCiOptions);
        }

    },
    /*
        This is the Helper function for processInterfaces in order to make code more readble
    */
    __prepareInterfaces: function(pName, pMacAddress, pStatus, interfaceCiOptions){
        
        var interfaceHashCode = this.__getStrHashCode(pName.toLowerCase());
        
        var anInterface = new Ci(interfaceCiOptions, {
                    index: interfaceHashCode,
                    name: pName, //no name for the interface so the description will be used instead.
                    load_balancer: this.deviceCi,
                    mac_address: pMacAddress,
                    operational_status: (pStatus === 'UP' ? 0 : 1) // operational if up, non-operational otherwise
                });
        this.deviceCi.addReferral(anInterface);
    },

    /*
    This function mapping raw groups data to the CI table cmdb_ci_lb_pool
    */
    processGroups: function(){
        var poolCiOptions = {
            table: 'cmdb_ci_lb_pool',
            indices: ['load_balancer', 'name'],
            referrals: [
                {
                    table: 'cmdb_ci_lb_pool_member',
                    referenceField: 'pool',
					deleteMissing: false,
					retireMissing: true
                }, 
                {
                    table: 'cmdb_ci_lb_service',
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

        var groups = this.deviceResult.getGroups();

        if (groups === null) {
            gs.log(' ' + new Date().getTime() + 'CiscoCliSensor:processGroups: groups is null');
            return;
        }
        
        for (var i in groups) {
            var group = groups[i];
            this.__prepareGroups(group['@name'], group['@method'], poolCiOptions);
        }
        
    },
    
    /*
        This is the Helper function for processGroups in order to make code more readble
    */
    __prepareGroups: function(pName, pMethod, poolCiOptions){
                
        var poolHashCode = this.__getStrHashCode(pName.toLowerCase());
        
        var pool = new Ci(poolCiOptions, {
                    index: poolHashCode,
                    name: pName,
                    load_balancer: this.deviceCi,
                    load_balancing_method: pMethod
                });

        if (pool.name === null)
            return;
        
        this.deviceCi.addReferral(pool);
        
    },

    /*
    This function mapping raw group members data to the CI table cmdb_ci_lb_pool_member
    */
    processGroupMembers: function () {
        var poolMemberCiOptions = {
            table: 'cmdb_ci_lb_pool_member',
            indices: ["name", "pool", "ip_address", "service_port"],
            relations: [{
                table: 'cmdb_ci_lb_pool',
                nature: 'Members::Member of',
                isParent: false,
				deleteMissing: false,
				deleteMissingRelationship: false
            }]
        };

        try{
            var realServers = this.deviceResult.getServers();

            if (realServers === null) {
                gs.log(' ' + new Date().getTime() + 'CiscoCliSensor:processGroupMembers: real servers is null');
                return;
            }

            for (var i in realServers) {
                var curServer = realServers[i];
                var foundPool = this.__getPoolRefByPoolName(curServer['@group']);     
                this.__prepareGroupMembers(curServer['@ip'], curServer['@port'], curServer['@name'], foundPool,poolMemberCiOptions);      
            }

        }catch(errorMsg){
            gs.log(' ' + new Date().getTime() + 'CiscoCliSensor:processGroupMembers: failed to prepare members due to ' + errorMsg);
        }    
    },

     /*
        This is the Helper function for processGroupMembers in order to make code more readble
    */
    __prepareGroupMembers: function(pIp, pPort, pName, pPool, poolMemberCiOptions){
        
        if(pPool === null){
            gs.log(' ' + new Date().getTime() + 'CiscoCliSensor:processGroupMembers: exiting because pool is null');
            return;
        }
        
        var poolMember = new Ci(poolMemberCiOptions, {
            ip_address: pIp,
            service_port: pPort,
            load_balancer: this.deviceCi,
            name: pName,
            pool: pPool
        });

        poolMember.addRelation(pPool);

        if (gs.nil(poolMember.data.ip_address) || gs.nil(poolMember.data.service_port)) {
            gs.log(' ' + new Date().getTime() + 'CiscoCliSensor:processGroupMembers: exiting _processGroupMembers because IP or PORT are missing');
            return;
        }
        
        poolMember.data.pool.addReferral(poolMember);
		this.deviceCi.addReferral(poolMember);
    },

    /*
    This function mapping raw virtual services data to the CI table cmdb_ci_lb_service
    */
    processVirtualServices: function () {
        var serviceCiOptions = {
            table: 'cmdb_ci_lb_service',
            indices: ['load_balancer', 'name'],
            referrals: [{
                table: 'cmdb_lb_service_vlan',
                referenceField: 'service',
				deleteMissing: false,
				retireMissing: true
            }],
            relations: [
                {
                    table: 'cmdb_ci_lb',
                    nature: 'Runs on::Runs',
					deleteMissing: false,
					deleteMissingRelationship: false
                }, {
                    table: 'cmdb_ci_computer',
                    nature: 'Distributed by::Distributes',
                    isParent: false,
					deleteMissing: false,
					deleteMissingRelationship: false
                }, {
                    table: 'cmdb_ci_appl',
                    nature: 'Distributed by::Distributes',
                    isParent: false,
					deleteMissing: false,
					deleteMissingRelationship: false
                }, {
                    table: 'cmdb_ci_lb_pool',
                    nature: 'Uses::Used by',
					deleteMissing: false,
					deleteMissingRelationship: false
                }
            ]
        };
        
        var vips = this.deviceResult.getVips();
        if (vips === null) {
            gs.log(' ' + new Date().getTime() + 'CiscoCliSensor:processVirtualServices vips is null');
            return;
        }

        for (var i in vips) {
            var vipService = vips[i];
            var foundPool = this.__getPoolRefByPoolName(vipService['@group']);       
            this.__prepareVirtualService(vipService['@name'], vipService['@ip'], vipService['@port'], vipService['@state'],foundPool,serviceCiOptions);
        }

    },

    /*
        This is the Helper function for processVirtualServices in order to make code more readble
    */
    __prepareVirtualService: function(pName, pIp, pPort, pState, pPool, serviceCiOptions ){
        var service = new Ci(serviceCiOptions, {
            name: pName,
            load_balancer: this.deviceCi,
            ip_address: pIp,
            port: pPort,
            operational_status: (pState === 'INSERVICE' ? 0 : 1),
            pool: pPool
        });

        if (service.name === null) {
            gs.log(' ' + new Date().getTime() + 'CiscoCliSensor:__prepareVirtualService: COULD NOT FIND VIRTUAL SERVICE NAME');
            return;
        }

        if (pPool !== null) {
            //add reference to the service on the pool
            service.data.pool.addReferral(service);
            service.addRelation(pPool);
        }else{
            gs.log(' ' + new Date().getTime() + 'CiscoCliSensor:__prepareVirtualService: pool is undefined');
        }

        this.deviceCi.addReferral(service);
        service.addRelation(this.deviceCi);
    },

    /*
        Get Pool Object from CI by Pool name POOL/FARM/GROUP
    */
    __getPoolRefByPoolName: function(poolName){
        var pools = this.deviceCi.getReferralsByTable('cmdb_ci_lb_pool');
        var foundPool = null;
        for (var poolIndex in pools) {
            var currentPool = pools[poolIndex];
            if (currentPool.data.index === this.__getStrHashCode(poolName.toLowerCase())) {
                //group found so populate group 
                return currentPool;
            }
        }
        return  foundPool; 
    },
    
    /*
    This function was created in order to convert pool name to hash code,
    due to missing index code on the device
    
    input: strToConvert 
    output: hash value 32bit integer
    */
    __getStrHashCode: function(strToConvert){
        var hashValue = 0;
        if (strToConvert.length == 0) return hashValue;
        for (var strIndex = 0; strIndex < strToConvert.length; strIndex++) {
            charValue = strToConvert.charCodeAt(strIndex);
            hashValue = ((hashValue<<5)-hashValue)+charValue;
            hashValue = hashValue & hashValue; // Convert to 32bit integer
        }
        return hashValue;
    }

});
