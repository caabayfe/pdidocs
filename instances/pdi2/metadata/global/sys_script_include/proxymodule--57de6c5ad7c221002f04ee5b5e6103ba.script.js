// Discovery

var ProxyModule = Class.create();

ProxyModule.prototype = Object.extendsObject (LBModule, {
	
    initialize: function(inputServers) {
		this.servers = inputServers; 
		this.type = 'mod_proxy';
    },
	
	// Populate proxy information 
	populateProxyInfo: function() {
		var msg = '';
		var proxyLbGr = '';
		var proxyBalancing = false;
		
		// Create a record in cmdb_ci_lb for mod_proxy load balancer. 
		if (!gs.nil(this.servers[0].serverName))
			proxyLbGr = this.updateLbTable(this.servers[0].serverName, this.servers[0].ip, 'cmdb_ci_lb_modproxy');
		else
			proxyLbGr = this.updateLbTable(this.servers[0].ip, this.servers[0].ip, 'cmdb_ci_lb_modproxy');
		
		for (var i = 0; i< this.servers.length; i++) {
			var serverIndex = i; 
			
			for (var j = 0; j< this.servers[i].proxyPasses.length;j++) {
				
				var proxyPass = this.servers[i].proxyPasses[j]; 
				var serviceGrList = this.populateServiceInfo(serverIndex, j, proxyLbGr); 
				var curProxyBalancer = this.servers[serverIndex].proxyBalancers[proxyPass.lbName];
		
				for (var k = 0; k < serviceGrList.length; k++) {
					var serviceGr = serviceGrList[k];
					// populate pool information
					var poolGr = this.updatePoolTable(proxyPass.lbName, curProxyBalancer.method, proxyLbGr, serviceGr);
					
					// populate pool members information 
					if (!gs.nil(poolGr)) { 
						for (var p = 0; p < curProxyBalancer.lbMembers.length; p++) {
							proxyBalancing = true;
							var lbMember = this.setLBMember(proxyPass, curProxyBalancer.lbMembers[p], proxyLbGr);
							this.updatePoolMemberTable (lbMember, poolGr); 
						}
						
					} else if (gs.nil(poolGr)) {
						msg = 'No load balancer pool found for ' + proxyPass.lbName; 
						DiscoveryLogger.warn (msg, 'Apache - Get Proxy Module', this.getEccQueueId(),null);
							
					}
						
				}
			}
		}
		// Create Relationship 'provides:: provided by' between the apache web server and the load_balancer
		if (proxyBalancing) {
			var cmdbGr = g_device.getCmdbCi();
			var discoFunctions = new DiscoveryFunctions();
			discoFunctions.createRelationshipIfNotExists(cmdbGr, proxyLbGr.sys_id+'', 'Provides::Provided by');
			
		}
		
		this.reconcile(proxyLbGr.getValue('sys_id'));
	},
	
	// @param lbMem: a string containing information for balancerMember
	//		proxy: the proxy corresponding to the lbMem
	setLBMember: function(proxy,lbMem,lbGr) {
		var member = {};
		member.name = 'LBMember@'+proxy.lbName;
		member.service_port = '';
		member.load_balancer = lbGr.getValue('sys_id')+'';
		
		if (lbMem.indexOf('http://') == 0 || lbMem.indexOf('ajp://') == 0 ) {
			var value = lbMem.split('//')[1];
			member.ip_address = value.split(':')[0];
			member.service_port = value.split(':')[1];
		} else {
			var msg = 'BalancerMember ' + lbMem + ' is not defined in the format: http(ajp)://ip.address:port';
			DiscoveryLogger.warn (msg,'Apache - Get Proxy Module', this.getEccQueueId(), null);
		}
		
		return member;
	},
	
	// populate proxy information in cmdb_ci_lb_service table
	populateServiceInfo: function(serverIndex, proxyPassIndex, lbGr) {
		var serviceList = []; 
		
		for (var i = 0; i< this.servers[serverIndex].port.length; i++) {
			
			var service = {};
			var sName = this.servers[serverIndex].serverName;
			if (gs.nil(sName))
				sName =  this.servers[0].serverName
					
			service.name = 'ProxyModule@'+ sName +':'+this.servers[serverIndex].port[i];
			service.port = this.servers[serverIndex].port[i];
			service.ip_address =  this.servers[serverIndex].ip;
			service.input_url = this.setUrl(this.servers[serverIndex].proxyPasses[proxyPassIndex].url, this.servers[serverIndex].serverName);
	
			if (gs.nil(service.ip_address))
				service.ip_address = this.servers[0].ip; 
			service.load_balancer = lbGr.sys_id +'';
			
			serviceList.push(this.updateServiceTable(service));
		}
	
		return serviceList;
		
	},
	
	// Add the server name at the begining of the url to make it complete path
	// if url is a regular expression, it will be populated by regExpr: at the begining 
	setUrl: function(url, sName) {
		if (url.indexOf('regExpr:') == 0)
			return url;
		else {
			var urlParts = url.split('/');
			var prefix = sName;
		
			if (urlParts[0] != prefix)
				return prefix+url;
		
			return url;
		}
	},
	
    type: 'ProxyModule'
});
