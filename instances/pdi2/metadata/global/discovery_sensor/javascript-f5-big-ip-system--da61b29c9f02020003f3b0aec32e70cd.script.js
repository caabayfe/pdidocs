new F5CliSensor({

    processF5Result: function(ci) {
        gs.log(' process F5 results in sensor');
        ci.debug(this.isDebugging());
        
        //there is need to define only pools and services referrals
        //the rest done by snmp

        ci.defineReferrals([
            {   table: 'cmdb_ci_lb_pool',
                referenceField: 'load_balancer',
				deleteMissing: false,
				retireMissing: true
            },
            {   table: 'cmdb_ci_lb_service',
                referenceField: 'load_balancer',
				deleteMissing: false,
				retireMissing: true
            },
        ]);
            
        ci.defineRelations([
            {   table: 'cmdb_ci_lb_service',
                nature: 'Runs on::Runs',
                isParent: false,
				deleteMissing: false,
				deleteMissingRelationship: false
            }
        ]);

        this.processVirtualServices();
    },

   
    /*
    This function mapping raw virtual services data to the CI table cmdb_ci_lb_service
    */
    processVirtualServices: function () {

        
        var vips = this.deviceVips;

        if (vips === null) {
            gs.log(' ' + new Date().getTime() + 'F5CliSensor:processVirtualServices vips is null');
            return;
        }

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
                },
            ]
        };

        
        for (var entryIndex in vips) {
            var entry = vips[entryIndex];
           
            var service = new Ci(serviceCiOptions, {
                name: entry['@name'] || null,
                load_balancer: this.deviceCi,
                ip_address: entry['@ip'],
                port: entry['@port'] || null,
                operational_status: 2,
                pool: null // set later ...
            }); 

            if (service.name === null)
                continue;
            
            //assign only the VIPs to the LB. do not associate pools.
            //the pools needed for the maps, but this solution
            //should solve the top down discovery.
            //important: the incoming payload contains only the active VIPs.

            this.deviceCi.addReferral(service);
            service.addRelation(this.deviceCi);
        }
    },
});
