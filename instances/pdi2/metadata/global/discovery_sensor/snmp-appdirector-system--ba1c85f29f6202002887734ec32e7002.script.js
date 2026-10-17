new SnmpSensor({ 
		
	processSnmp: function(ci, snmp) {			
		ci.defineReferrals([
			
			{   table: 'cmdb_ci_lb_service',
				referenceField: 'load_balancer',
				deleteMissing: false,
				retireMissing: true
			},
			
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

		this._processVirtualServices();
	},

	_processVirtualServices: function() {
		var entries = this.getProbeTable('VirtualServices', 'rsWSDL4PolicyEntry');
	//	var pools = this.deviceCi.getReferralsByTable('cmdb_ci_lb_pool');

		if (typeof entries === 'undefined'){
			gs.log(' '+new Date().getTime()+'==================in radware-AppDirector System Sensor._processVirtualServices could not find no entries');	
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

		for (var entryIndex in entries) {
			var entry = entries[entryIndex];		

			var service = new Ci(serviceCiOptions, {
				name: entry.rsWSDL4PolicyName || null,
				load_balancer: this.deviceCi,                       //ci is the first argument === this.deviceCi
				ip_address: entry.rsWSDL4PolicyVirtualIP,
				port: entry.rsWSDL4PolicyDstPort || null,
				operational_status: entry.rsWSDL4PolicyStatus || null,            // entry.rsWSDL4PolicyRedunStatus
				pool: null // set later ...  entry.rsWSDL4PolicyFarmName    entry.rsWSDL4PolicyExplicitFarmName
			});

			this.deviceCi.addReferral(service);
			service.addRelation(this.deviceCi);		
		}
	}

});
