new DiscoverySensor({

	process: function(result) {
		if (gs.nil(result.output))
			return; 
		this.servers = [];
		this.isProxyBalancing = false; 
		this.parseOutput(result.output);
		
		if (this.isProxyBalancing) { 
			var proxyModule = new ProxyModule(this.servers);
			proxyModule.populateProxyInfo();
		}
	},
	
	/*
	 * Collect proxy information
	 */
	parseOutput: function(output) {
		
		var lines = output.split(/\n/);;
		var vHostInfo = false;	
		this.addNewServer(); 
		this.servers[0].ip = g_device.getSource();
		this.tempHost = {};
		var lastLbName = ''; 
		 
		for (var i = 0; i < lines.length; i++) {
			
            var line = lines[i];
			line = line.trim();
			
            var lineParts = line.split(/\s+/);
			var key = lineParts[0];
			var value = lineParts[1]; 
			
			if (key == 'ServerName') {
				if (!vHostInfo) 
					this.servers[0].serverName = value;
				else 
					this.tempHost.serverName = value; 
				
			} else if (key == 'Listen') {
				this.servers[0].port.push(value);
				
			} else if (key == '<VirtualHost') {
				// <VirtualHost, reading virtual information begins
				var vHostTag = line.substring(line.indexOf('<VirtualHost')+key.length);
				vHostTag = vHostTag.trim();
				vHostTag = vHostTag.substring(0, vHostTag.length-1) 	//Remove ending >
				//create temparay host and if it used in mod_proxy we add it to the servers
				this.tempHost = this.getTempVirtualServer(vHostTag);
				vHostInfo = true;
				
			} else if (key == '</VirtualHost>') {
				this.processVirtualHost();
				vHostInfo = false;
				
			} else if (key == 'ProxyPass' || key == 'ProxyPassMatch') {
				// Collect information regarding which url is forwarded to 
				// the load_balancer. Example ProxyPass /test  balancer://myCluster
				var balancerName = lineParts[2];
		
				if (balancerName.indexOf('balancer://') == 0) {
					var newProxyPass = this.getNewProxyPass();
					//Remove '/' from the end of balancer
					if (balancerName.charAt(balancerName.length-1)=='/')
						balancerName = balancerName.substring(0, balancerName.length-1);
					
					newProxyPass.lbName = balancerName.split('//')[1];
					// ProxyPassMatch is used with regular expressions
					// In this case we put regExpr: at the begining of the url.
					var curUrl = lineParts[1];
					if (key == 'proxyPassMatch')
						curUrl = 'regExpr:'+ curUrl; 
					
					newProxyPass.url = curUrl;
					if (!vHostInfo)
						this.servers[0].proxyPasses.push (newProxyPass);
					else
						this.tempHost.proxyPasses.push (newProxyPass);
					
				}
				
			} else if (key == '<Proxy' && value.indexOf('balancer://' == 0)) {
				// Collect information for a balancer worker
				var newObject = this.getNewProxyBalancer();
				lastLbName = value.substring(0, value.length-1).split('//')[1];
				if (!vHostInfo)
					this.servers[0].proxyBalancers[lastLbName] = newObject;
				else
					this.tempHost.proxyBalancers[lastLbName] = newObject;
				
				this.balancerInfo = true; 
				
			} else if (key == 'BalancerMember') {
				this.isProxyBalancing = true;
				
				// Collect pool members information
				if (this.balancerInfo) {
					var memberInfo = value.split(/\s+/)[0];
					if (!vHostInfo)
						this.servers[0].proxyBalancers[lastLbName].lbMembers.push(memberInfo);
					else 
						this.tempHost.proxyBalancers[lastLbName].lbMembers.push(memberInfo);	
					
				} else {
					// Expected example:
					//           <Proxy balancer://myCluster>
					//            BalancerMember http://192.168.1.50:80  
					//           </Proxy>
					var msg = 'BalancerMember is defined outside of <Proxy balancer://....>';
					DiscoveryLogger.warn (msg, 'Apache - Get Proxy Module', this.getEccQueueId(), null); 
				}
			} else if (key == 'ProxySet') {
				// Collect information for pool 
				var valueParts = value.split('=');
				if (valueParts[0] == 'lbmethod')
					if (this.balancerInfo) {
						if (!vHostInfo)
							this.servers[0].proxyBalancers[lastLbName].method = valueParts[1];
						else
							this.tempHost.proxyBalancers[lastLbName].method = valueParts[1];
							
					} else {
						// Expected example:
						//           <Proxy balancer://myCluster>
						//            ProxySet lbMethod=byrequests 
						//           </Proxy>
						var msg = 'lbmethod is defined  outside of <Proxy balancer://....>';
						DiscoveryLogger.warn (msg, 'Apache- Get Proxy Module', this.getEccQueueId(), null); 
					}
			}
		}
		 
		
	},
	
	addNewServer: function() {
		var server = {};					
		server.serverName = '';			
		server.ip = '';
		server.port = [];
		server.proxyPasses = [];     		// List of url requests and the corresponding workers 
		server.proxyBalancers = {};			// List of load balancer workers and their members
		this.servers.push(server);
	},
	
	getTempVirtualServer: function(tag){
		var vHost = {};
		vHost.tag = tag;
		vHost.serverName = '';
		vHost.proxyPasses = [];
		vHost.proxyBalancers = {};
		return vHost; 
	},
	
	// Service 
	getNewProxyPass: function() {
		var proxyPass = {};
		proxyPass.url = '';
		proxyPass.lbName = '';
		return proxyPass;
	},
	
	// Pool and pool member
	getNewProxyBalancer: function() {
		var proxyLB = {};
		proxyLB.lbMembers = [];
		proxyLB.method = 'byrequests'
		return proxyLB; 
	},
	
	/*
	 * Process the attributes of the virtual hosts and add the virtual hosts that 
	 * contain Proxy balancers
	 */
	processVirtualHost: function() {
		var temHostHasPool = false;
		for (var key in this.tempHost.proxyBalancers) {
			temHostHasPool = true;
			break;
		}
			
		if (!temHostHasPool)
			return;
		
		// add a new server 
		this.addNewServer();
		var curIndex = this.servers.length-1;
		this.servers[curIndex].serverName = this.tempHost.serverName;
		this.servers[curIndex].proxyPasses = this.tempHost.proxyPasses;
		this.servers[curIndex].proxyBalancers = this.tempHost.proxyBalancers;
			
			
		var value = this.tempHost.tag;
			
		if (value.indexOf(':')>-1) {
			var ipPart = value.split(':')[0];
			var portPart = value.split(':')[1];
				
			// Example: <VirtualHost *:80>  <VirtualHost _default_:80)
			if (ipPart == '*'|| ipPart == '_default_')
				this.servers[curIndex].port.push(portPart);
			else
				// Example: <ViirtualHost 10.12.32.15:80>
				if (this.isValidIPv4(ipPart)) {
					this.servers[curIndex].port.push(portPart);
					this.servers[curIndex].ip = ipPart;
				}
			
		}else {
			//Example: <VirtualHost 10.13.23.90>
			if (this.isValidIPv4(value)) {
				this.servers[this.servers.length-1].ip = value;
				this.servers[this.servers.length-1].port = this.servers[0].port;
			}
			else {
					
				//Example: <VirtualHost 10.12.14.14 10.12.14.25>
				var ipList = value.split(/\s+/);
					
				for ( var i = 0; i< ipList.length; i++) {
					if (this.isValidIPv4(ipList[i])) {
						if (i > 0)		
							this.addNewServer();
						
						var serverIndex = this.servers.length-1;
						this.servers[serverIndex].port = this.servers[0].port;
						this.servers[serverIndex].ip = ipList[i];
						this.servers[serverIndex].serverName = this.tempHost.serverName;
						this.servers[serverIndex].proxyBalancers = this.tempHost.proxyBalancers;
						this.servers[serverIndex].proxyPasses = this.tempHost.proxyPasses;
					}
				}
						
			}	
			
		}
		
	},
	
	/* 
	 * Check if a string for ip is an IPv4 ?
	 */
	isValidIPv4: function(ip) {
		try {
			var valid = new SncAddress32Bit(ip);
		} catch (ex) {
			return false;
		}
		return true;
	},
	
	type: 'DiscoverySensor'
});
