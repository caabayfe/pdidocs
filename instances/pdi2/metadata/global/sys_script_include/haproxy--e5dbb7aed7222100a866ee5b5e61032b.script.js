// Discovery

var HAProxy = Class.create();
HAProxy.prototype = Object.extendsObject (LBModule, {

    initialize: function(blocks, lbGr, serverIP, serverName) {
		this.frontends = blocks.frontendList;
		this.backends = blocks.backendList;
		this.listens = blocks.listenList;
		this.hosts = blocks.hostList;
		this.lbGr = lbGr; 
		this.serverIP = serverIP;
		this.serverName = serverName;
		this.type = 'HAProxy';
    },
	
	// Populate HAProxy information
	populateInfo: function () {
		if (this.serverName.indexOf('.') != -1)
			this.serverName = this.serverName.split('.')[0];

		var poolName = '';
		// process frontend block information and populate information
		for (var i = 0; i < this.frontends.length; i++) {
			var curFrontend = this.frontends[i];
			curFrontend.type = 'frontend';
			
			// Process Pool information from used_bckends defined in the frontend blocks
			for (var j =0; j < curFrontend.useBackends.length; j++){
				poolName = curFrontend.useBackends[j].name;
				this.processBlockInfo ( curFrontend, poolName, j);
			}
			
			// For every frontend block if the default_backend is defined all requests that are not matching
			// to any acl condition will be passed to the default_backend
			if (curFrontend.default_backend != undefined) {
				poolName = curFrontend.default_backend;
				this.processBlockInfo (curFrontend, poolName);
			}
		}
		
		// process listen blocks information and populate information 
		for (var key in  this.listens) {
			var curListen = this.listens[key];
			curListen.type = 'listen';
			
			// Process Pool information from used_backends defined in listen blocks
			for (i = 0; i < curListen.usedBackends.length; i++) { 
				poolName = curListen.usedBackends[i].name;
				this.processBlockInfo (curListen, poolName, i);
			}
			
			// Only process the backends defining backend servers (pool containing atleast one member)
			if (curListen.servers.length == 0)
				continue;
			
			this.processBlockInfo(curListen,curListen.name); 		
		}
		
		this.reconcile(this.lbGr.getValue('sys_id'));
		
	},
	/*
	 * Populate LB information for a frontend or listen block
	 * The required information in these blocks are defined with different syntax.
	 * block: a frontend or listen block
	 * poolName: a pool (backend block) for that LB information will be populate
	 * bIndex : This input is only passed if the pool is corresponding to use_backend
	 *          In this case it is the index of  the pool in used_backend list in the frontend or listen block
	 *
	 */
	processBlockInfo: function (block, poolName, bIndex) {
		var msg = '';
		
		if ( this.backends[poolName] == undefined && this.listens[poolName] == undefined)
			return;
		
		var lbMethod = 'round-robin';
		if ( this.backends[poolName] != undefined)	
			lbMethod = this.getBalanceMethod (this.backends[poolName]);
		if ( this.listens[poolName] != undefined )
			lbMethod = this.getBalanceMethod (this.listens[poolName]);
		
		
		var serviceGrList = this.populateServiceInfo (block,bIndex);
		if (serviceGrList.length < 1)
			return;

		for ( var k = 0; k < serviceGrList.length; k++) {
			var serviceGr = serviceGrList[k];
			
			var poolGr = this.updatePoolTable ( poolName, lbMethod, this.lbGr, serviceGr);
							
			if (!gs.nil(poolGr)) 
				this.populatePoolMembers (poolGr, block.type);
			else {
				msg =  'No load balancer services found for ' + poolName; 
				DiscoveryLogger.warn (msg,'HAProxy - Get Configuration',this.getEccQueueId(),null);
			}
						
		}
	},
	
	/*
	 * populate service information for a block. 
	 * This service can be corresponding to a defaultbackend or realted to acl or listen block.
	 * based on the value of bIndex we define the service is related to which block
	 */
	populateServiceInfo: function (block, bIndex) {
		var serviceList = [];
		
		
		for (var i = 0; i< block.bind.length ; i++) {
			var service = {};
			var port = block.bind[i].startPort;
			if (block.bind[i].endPort != undefined) {
				port += '-'+ block.bind[i].endPort;
				service.last_port = block.bind[i].endPort;
			}
			
			service.name = 'HAProxy@' + this.serverName + ':' + port;
			service.port = block.bind[i].startPort;
			service.ip_address = block.bind[i].ip;
			if ( service.ip_address == '*' || service.ip_address == '127.0.0.0')
				service.ip_address = this.serverIP; 
			

			if (bIndex != undefined) { 	
				var aclName = block.useBackends[bIndex].acl;
				if (block.aclList[aclName] != undefined) {
					if (block.useBackends[bIndex].condition == 'unless')
						service.name = 'HAProxy_unless_'+ aclName + '@' + this.serverName + ':' + port;
					else
						service.name = 'HAProxy_if_'+ aclName + '@' + this.serverName + ':' + port;
				}
			} else {
				if (block.type == 'frontend') 
					service.name = 'HAProxy_defaultBackend@' + this.serverName + ':' + port;
				else
					service.name = 'HAProxy_listen@' + this.serverName + ':' + port;
			}
				
			service.load_balancer = this.lbGr.sys_id + '';
			serviceList.push (this.updateServiceTable (service));
			
		}
		
		return serviceList; 
		
	},
	
	
	getBalanceMethod: function(block) {
		if ( block.balance == undefined )
			return 'round-robin';
				
		var method = 'round-robin';
		switch (block.balance) {
			
			case 'leastconn': method = 'least-connections';
				break;
				
			case 'source':
			case 'uri':
			case 'static-rr': method = block.balance;
				break;
				
			case 'url_param': method = 'url-param';
				break;
		}
		
		return method;
	},
	/* 
	 * The pool memebrs information is collected from the
	 * block in where are defined. Listen blocks or backend blocks
	 */
	populatePoolMembers: function (poolGr, blockType) {
		
		var poolName = poolGr.getValue ('name');
		var pool = '';
		if (blockType == 'listen' && this.listens[poolName] != undefined)
			pool = this.listens[poolName];
		else
			pool = this.backends[poolName];
		
		for (var i = 0; i < pool.servers.length; i++){
			var server = pool.servers[i];
			
			var member = {};
			member.name = server.name;
			member.ip_address = '';
			if (this.isValidIPv4(server.ip))
				member.ip_address = server.ip;
			else {
				member.fqdn = server.ip; 
				
				if (this.hosts [server.ip] != undefined )
					member.ip_address = this.hosts[server.ip]; 
			}
			member.service_port = server.port;
			member.load_balancer = this.lbGr.sys_id + '';
			this.updatePoolMemberTable (member, poolGr); 
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
    type: 'HAProxy'
});
