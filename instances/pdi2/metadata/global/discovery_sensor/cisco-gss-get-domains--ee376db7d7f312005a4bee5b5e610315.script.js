new DiscoverySensor({


    process: function(result) {
		var domains = result.split(",");
		
		// get the current ip_address gr
		var iGr = new GlideRecord('cmdb_ci_ip_address');
		iGr.addQuery('ip_address', g_sensor.getSource());
		iGr.query();
		if (iGr.hasNext())
			iGr.next();
		else 
			return;
			
		for (var i = 0; i < domains.length; i++) {
			var domain = domains[i];
			// update dns table. Set up a mutex to update the table safely. 
			var mutexName = 'GssDomainName:' + domain;
			var mutex = new Mutex(mutexName);
			// limit our attempt to get a mutex to 60 seconds...
			mutex.setSpinWait(500);
			mutex.setMaxSpins(120);
			mutex.setMutexExpires(60000); 
			if (mutex.get()) {
				try {
					this._updateDNSTable(domain, iGr);
				
				} finally {
					mutex.release();
				}
			} else 
				//lock failed
				DiscoveryLogger.warn("Unable to get mutex to update DNS table for " + mutexName, 'Cisco GSS - Get Domains', this.getEccQueueId(), null);
		}				  
	},
	
	
	_updateDNSTable: function (domain, ipGr){
		
		// populate the cmdb_ci_dns_name
		var dGr = new GlideRecord('cmdb_ci_dns_name');
		dGr.addQuery('name', domain);
		dGr.query();
		
		// if this dns name does not exist, insert it
		if (!dGr.hasNext()) {
			dGr.name = domain;
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
	 type: "DiscoverySensor"
});
