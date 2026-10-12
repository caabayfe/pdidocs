new ProbePostProcessor({
	
	/**
 	* Runs the probe instance
 	*/
	process : function() {
		related_data.adapters = [];
		// get our adapters and configurations...
		var network_confs = g_array_util.ensureArray(output.Win32_NetworkAdapterConfiguration);
		var network_adapters = g_array_util.ensureArray(output.Win32_NetworkAdapter);
		var network_routes = g_array_util.ensureArray(output.Win32_IP4RouteTable);
		var idutil = new IDSensorUtil();
		
		// filter routes down for better searching later
		var fixedRoutes = [];
		var seenRoutes = {};
		
		for (var i=0; i < network_routes.length; i++) {
			var route = network_routes[i];
			
			if (route.Destination.indexOf('127.') == 0 || route.Destination == '255.255.255.255' ||
				(route.Destination.indexOf('224.') == 0 && route.Mask.indexOf('240.') == 0) ) {
				// ignore broadcast, localhost, and multicast routes
				continue;
			}
			
			// Only add the route if we haven't seen it yet
			var hashedRoute = this.hashRoute(route);
			if (!seenRoutes[hashedRoute]) {
				seenRoutes[hashedRoute] = true;
				fixedRoutes.push(route);
			}
		}
		
		var vips = {};
		this.buildVIPHash(vips);
		
		for(var i = 0; i < network_confs.length; i++) {
			var nc = network_confs[i];
			var na = network_adapters[i];
			
			if (parseInt(nc.Index) != parseInt(na.Index)) //Just in case Index doesn't match...
				na = this.findCorrectIndex(nc.Index, network_adapters);
			
			if (JSUtil.nil(nc.IPAddress) || !nc.IPEnabled)
				continue;
			
			// Filter out loopback adapters
			if (JSUtil.notNil(nc.Caption) && nc.Caption.indexOf("Loopback Adapter") >= 0)
				continue;
			
			var ipParsed = nc.IPAddress.split(",");
			var subnetParsed = [];
			if (!JSUtil.nil(nc.IPSubnet))
				subnetParsed = nc.IPSubnet.split(",");
			
			var ips = [];
			
			for(var j = 0; j < ipParsed.length; j++) {
				// The ip shouldn't be a VIP...
				if (vips[ipParsed[j]])
					continue;
				
				var ip_address = ipParsed[j];
				var isIPv6 = (ip_address.indexOf(":") > -1);
				if (isIPv6) {
					ip_address = SncIPAddressV6.get(ip_address);
					if (!ip_address)
						continue;
				} else {
					// check if valid nic ip address..
					if (!SncIPAddressV4.get(ip_address) || ip_address == "0.0.0.0" ||
						ip_address == "255.255.255.255" || ip_address == "127.0.0.1")
					continue;
				}
				
				var ip = {};
				ip.ip_address = ip_address;
				ip.netmask = (j < subnetParsed.length) ? subnetParsed[j] : null;
				ip.ip_version = isIPv6 ? '6' : '4';
				ips.push(ip);
			}
			
			var adapter = {};
			adapter.name	           = na.NetConnectionID;
			adapter.short_description  = nc.Caption;
			adapter.ip_address         = (ips.length > 0) ? ips[0].ip_address : null;
			adapter.netmask            = (ips.length > 0) ? ips[0].netmask : null;
			adapter.ip_default_gateway = nc.DefaultIPGateway ? nc.DefaultIPGateway.toString() : null;
			adapter.mac_address        = nc.MACAddress ? nc.MACAddress.toString() : null;
			adapter.dhcp_enabled       = (nc.DHCPEnabled.toString() == 1) ? true : false;
			adapter.ip_addresses       = ips;
			adapter.manufacturer 	  = na.Manufacturer;
			adapter.routes             = {ifRoutes: [], gwRoutes: []};
			
			// handle routes
			for (var j=0; j < adapter.ip_addresses.length; j++) {
				var ip = adapter.ip_addresses[j];
				
				if (ip.ip_version == '6' || ip.netmask == null)
					continue;
				
				// search for matching routes
				var cidr = idutil.maskToCidr(ip.netmask);
				var network = new SncIPNetworkV4(ip.ip_address + '/' + cidr);
				for (var k=0; k < fixedRoutes.length; k++) {
					var route = fixedRoutes[k];
					
					cidr = idutil.maskToCidr(route.Mask);
					var destIpNetwork = route.Destination + '/' + cidr;
					var newRoute = { dest_ip_network: destIpNetwork };
					if (route.NextHop == '0.0.0.0') {
						// possible exit interface route
						if (route.Mask == '255.255.255.255') {
							// host or broadcast exit interface route, will be contained by a subnet route
							continue;
						}
						if (route.Destination == '' + network.address) {
							newRoute.router_interface = adapter.name;
							adapter.routes.ifRoutes.push(newRoute);
						}
					} else {
						// possible next hop route
						var nextHop = new SncIPAddressV4(route.NextHop);
						if (network.contains(nextHop) || network.isBroadcastAddress(nextHop) ) {
							newRoute.route_interface = adapter.name;
							newRoute.next_hop_ip_address = String(nextHop);
							adapter.routes.gwRoutes.push(newRoute);
						}
					}
				}
				
			}
			
			related_data.adapters.push(adapter);
			
			//if this nic has a default gateway configured, set the default_gateway for the computer CI:
			if(JSUtil.notNil(adapter.ip_default_gateway))
				related_data.ip_default_gateway = adapter.ip_default_gateway;
		}
	},
	
	/*************************************************************
 	* Function definitions
 	*************************************************************/
	
	buildVIPHash: function(vips) {
		// if we have a VIPs parameter, parse it and build a hashmap of them...
		var vipsParam = g_probe.getParameter('vips');
		if (vipsParam) {
			var vipsParamParts = vipsParam.split(',');
			for (var i = 0; i < vipsParamParts.length; i++)
				vips[vipsParamParts[i]] = true;
		}
	},
	
	/*
 	* Win32_NetworkAdapter and Win32_NetworkAdapterConfiguration seem to always have the same
 	* length of array data and the order matches. But just in case it doesn't, we need to
 	* manually match them up by index.
 	*/
	findCorrectIndex: function(index, network_adapters) {
		for(var i=0; i<network_adapters.length; i++)
			if (parseInt(network_adapters[i].Index) == parseInt(index))
			return network_adapters[i];
	},
	
	// Routes are unique based on Destination, Mask, and NextHop
	hashRoute: function(route) {
		var routeHash = "";
		routeHash += "D:" + route.Destination;
		routeHash += "M:" + route.Mask;
		routeHash += "NH:" + route.NextHop;
		
		return routeHash;
	},
	
	type: "ProbePostProcessor"
});
