new DiscoveryMultiSensor({
    //
    // this sensor uses the common script include class "DiscoveryMultiSensor"
    //

    finish: function() {
        this.ci_data = this.ciData.getData();
	
		if (!this.ci_data['arp'] || !this.ci_data['routes']) {
			DiscoveryLogger.warn("Probe did not return all required information", 'Netscaler - Get Network Path Information', this.getEccQueueId(), null);
			return;
		}
		
		this.processResult(this.ci_data['arp'], this.ci_data['routes']);
    },
	
	processResult: function(arp, routes) {
		var deviceSysId = this.getCmdbRecord().sys_id;
		for (var ip in arp) {
			
			// Skip ip_addresses that we don't have any route information for 
			if (!routes.hasOwnProperty(ip))
				continue;
			
			// Verify if there is an interface related to the current arp record 
			var gr = new GlideRecord('dscy_router_interface');
			gr.addQuery('cmdb_ci', deviceSysId);
			gr.addQuery('name', arp[ip].iface);
			gr.addQuery('mac_address', arp[ip].mac_address);
			gr.addQuery('ip_address', ip); 
			gr.query();
			if (!gr.next()) {
				gr.initialize();
				gr.setValue('cmdb_ci', deviceSysId);
				gr.setValue('name',arp[ip].iface );
				gr.setValue('mac_address', arp[ip].mac_address);
				gr.setValue('ip_address', ip);
				gr.insert();
			}
			
			// Compute the dest_network for dscy_route record 
			var adapterGr = new GlideRecord('cmdb_ci_network_adapter');
			adapterGr.addQuery('cmdb_ci', deviceSysId);
			adapterGr.addQuery('name', arp[ip].iface);
			adapterGr.query();
			if(!adapterGr.next())
				continue;
			
			var interfaceNetwork = SncIPNetworkV4.getIPNetworkInstance(adapterGr.getValue('ip_address') + "/" + adapterGr.getValue('netmask')).getNetworkAsString();
			
			// Populate the information in dscy_route_interface  table 
			var ifaceGr = new GlideRecord('dscy_route_interface');
			ifaceGr.addQuery('router_interface', gr.getValue('sys_id'));
			ifaceGr.addQuery('cmdb_ci', deviceSysId);
			ifaceGr.addQuery('traffic_domain', arp[ip].traffic_domain);
			ifaceGr.query();
			if (!ifaceGr.next()) {
				ifaceGr.initialize();
				ifaceGr.setValue('router_interface', gr.getValue('sys_id'));
				ifaceGr.setValue('cmdb_ci', deviceSysId);
				ifaceGr.setValue('dest_ip_network', interfaceNetwork);
				ifaceGr.setValue('traffic_domain', arp[ip].traffic_domain);
				ifaceGr.insert();
			}
			
			// Populate the information in dscy_route_next_hop  table 
			var network = SncIPNetworkV4.getIPNetworkInstance(routes[ip].network + "/" + routes[ip].netmask).getNetworkAsString();
			var hopGr = new GlideRecord('dscy_route_next_hop');
			hopGr.addQuery('next_hop_ip_address', ip);
			hopGr.addQuery('cmdb_ci', deviceSysId );
			hopGr.addQuery('route_interface', ifaceGr.getValue('sys_id'));
			hopGr.addQuery('dest_ip_network', network);
			hopGr.addQuery('traffic_domain', routes[ip].traffic_domain);
			hopGr.query();
			if (!hopGr.next()) {
				hopGr.initialize();
				hopGr.setValue('next_hop_ip_address', ip);
				hopGr.setValue('cmdb_ci', deviceSysId );
				hopGr.setValue('route_interface', ifaceGr.getValue('sys_id'));
				hopGr.setValue('dest_ip_network', network);
				hopGr.setValue('traffic_domain', routes[ip].traffic_domain);
				hopGr.insert();			
			}
			
		}
		
	},

    type: "DiscoveryMultiSensor"
});
