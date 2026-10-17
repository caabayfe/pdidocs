new DiscoverySensor({


    process: function(result) {
		
		this.servers = [];	// array of servers where servers[0] is teh main and each additional is a virtual host
		this.workerList = {}; // map of known workers
		this.hostsIpList = {};// map of hosts to IP address from /etc/hosts
		this.jkWorkers = {};  // temporary map of workers and the load balancing attributes
		this.jkLoadBalancer = false; // set to true if at least one worker is configured as a load-balancer in mod_jk  
		
		if (gs.nil(result.output))
            return;
	
		this.parseOutput(result.output);  
		
		// Process the results of the probe if mod_jk is configured as a load_balancer
		if (this.jkLoadBalancer) {
			var jkMod = new JkModule(this.servers,this.workerList,this.hostsIpList);
			jkMod.populateJkInfo(); 
		} else {
			var msg = "JK Module is not configured for load-balancing. Skipping processing";
			DiscoveryLogger.info (msg,'Apache - Get JK Module',this.getEccQueueId(),null);
		}
								  
	},
	
	parseOutput: function (output) {
		var lines = output.split(/\n/); 
		var vHostInfo = false;
		var hostIPInfo = false; 
		
		// server[0] is always includes the information about the original Apache server and 
		// the rest of servers in the array are virtual hosts defined on the apache server.
		this.addNewServer(); 
		this.servers[0].ip = g_device.getSource(); 
		this.tempHost = {};
		
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
			} else if (key == 'JkMount') {
				if (!JSUtil.nil(lineParts[1]) && !JSUtil.nil(lineParts[2])) {
					value = lineParts[1] + ' '+ lineParts[2]; 
					if (!vHostInfo) 
						this.servers[0].jkMounts.push(value);
					else 
						this.tempHost.jkMounts.push(value);
					
					//  Process the JkMount parameter to identify that if mod_jk works as a load-balancer
					if (!this.jkLoadBalancer) {
						var workerName = lineParts[2];
						if (this.jkWorkers[workerName] == undefined) {
							this.jkWorkers[workerName] = {};
							this.jkWorkers[workerName].jk = true;	//The worker is a part of JkMount command
							this.jkWorkers[workerName].lb = false;
						} else {
							this.jkWorkers[workerName].jk = true;
							
							if (this.jkWorkers[workerName].lb) 
								this.jkLoadBalancer = true; 
						}
					}
				}
				
			} else if(key == 'Listen') {
				this.servers[0].port.push(value);
			} else if (key == '<VirtualHost') {
				// <VirtualHost, reading virtual information begins
				var vHostTag = line.substring(line.indexOf('<VirtualHost')+ key.length);
				vHostTag = vHostTag.trim();
				vHostTag = vHostTag.substring(0,vHostTag.length-1) 	//Remove ending >
				// create temparay host and if it used in mod_jk we add it to the servers
				this.tempHost = this.getTempVirtualServer(vHostTag);			     
				vHostInfo = true;	
			} else if(key == '</VirtualHost>') {
				this.processVirtualHost();
				vHostInfo = false;
			} else if (line.indexOf('worker')==0) 
				this.processWorkerInfo(line);
			else if (hostIPInfo) 
				this.processHostIPInfo(line);
			else if (key == '<<HOST-INFORMATION>>')
				hostIPInfo = true;
			
        }
    },
		
	addNewServer: function() {
		var server = {};					
		server.serverName = '';			
		server.ip = '';
		server.port = [];
		server.jkMounts = [];
		this.servers.push(server);
	},
	
	getTempVirtualServer: function(tag) {
		var vHost = {};
		vHost.tag = tag;
		vHost.serverName = '';
		vHost.jkMounts = []; 
		return vHost; 
	},
	
	/*
	 * Process the attributes of the virtual hosts and add the virtual hosts that 
	 * contain JkMount
	 */
	processVirtualHost: function() {
		
		if (JSUtil.nil(this.tempHost.jkMounts) || this.tempHost.jkMounts.length == 0)
    			 return;      // nothing to process
		
		// add a new server 
		this.addNewServer();
		var curIndex = this.servers.length-1;
		this.servers[curIndex].serverName = this.tempHost.serverName;
		this.servers[curIndex].jkMounts = this.tempHost.jkMounts;
			
		
		var value = this.tempHost.tag;
			
		if (value.indexOf(':')>-1) {
			var valueParts = value.split(':');
				
			// Example: <VirtualHost *:80>  <VirtualHost _default_:80)
			if (valueParts[0] == '*' || valueParts[0] == '_default_')
				this.servers[curIndex].port.push(valueParts[1]);
			else
				// Example: <ViirtualHost 10.12.32.15:80>
				if (this.isValidIPv4(value.split(':')[0])) {
					this.servers[curIndex].port.push(valueParts[1]);
					this.servers[curIndex].ip = valueParts[0];
				}
			
		} else {
			//Example: <VirtualHost 10.13.23.90>
			if (this.isValidIPv4(value)){
				this.servers[this.servers.length-1].ip = value;
				this.servers[this.servers.length-1].port = this.servers[0].port;
			} else {
					
				//Example: <VirtualHost 10.12.14.14 10.12.14.25>
				var ipList = value.split(/\s+/);
					
				for ( var i = 0; i < ipList.length; i++) {
					if (this.isValidIPv4(ipList[i])) {
						if (i > 0)		
							this.addNewServer();
						
						var serverIndex = this.servers.length-1;
						this.servers[serverIndex].port = this.servers[0].port;
						this.servers[serverIndex].ip = ipList[i];
						this.servers[serverIndex].serverName = this.tempHost.serverName;
						this.servers[serverIndex].jkMounts = this.tempHost.jkMounts;
						
					}
				}	
			}	
		}
		
		
	},
	
	/*
	 * Collect the workers information
	 * The format of the information is "worker.workerName.keyword=value" 
	 * Example:  worker.myWorker.type=lb 
	 */
	processWorkerInfo:function(line) {
		
		var lineParts = line.split('=');		
		var wInfo = lineParts[0].split('.');
		var value = lineParts[1];
		var wName = wInfo[1]; 
		
		if (wName != 'list') {
			
			if (this.workerList[wName] == undefined) {
				this.workerList[wName] = {};
				this.workerList[wName].name = wName;				
			}
		
			if (wInfo[2] == 'port' || wInfo[2] == 'host' || wInfo[2] == 'type' || wInfo[2] =='balance_workers')
				this.workerList[wName][wInfo[2]] = value;
			
			// Process the worker parameters to identify if mod_jk is working as a load-balancer 
			if (!this.jkLoadBalancer && wInfo[2] == 'type' && value == 'lb') {
				if (this.jkWorkers[wName] == undefined) {
					this.jkWorkers[wName] = {};
					this.jkWorkers[wName].jk = false;
					this.jkWorkers[wName].lb = true;
				} else {
					this.jkWorkers[wName].lb = true; 
					
					if (this.jkWorkers[wName].jk)
						this.jkLoadBalancer = true; 
				}
			}
		}
	},
		
	/*
	 * Process the host information collected from /etc/hosts file by the probe 
	 * For host A with ip address a, it create a new object this.hostIpList[A] = a
	 * It is possible that the host name A  be mapped to both IPv4 and IPv6,
	 * in this case Ipv4 address is chosen for the this.hostIpList[A]. If the host name A
	  *is mapped only to IPv6 this.hostIpList[A] = 'INVALID'
	 * 
	 */
	processHostIPInfo:function(line) {
		 
		var lineParts = line.split(/\s+/);
		var ip = lineParts[0];
		var hostInfo = {}; 
		if (!this.isValidIPv4(ip))
			ip = 'INVALID';
		for (var i = 1; i< lineParts.length; i++)
			if (this.hostsIpList[lineParts[i]] == undefined || this.hostsIpList[lineParts[i]] == 'INVALID')
				this.hostsIpList[lineParts[i]] = ip;
			
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
	
    type: "DiscoverySensor"
});
