new ProbePostProcessor({


    /**
     * Load balancing information for HAProxy can be collected from 4 different types of blocks
	 * defaults: sets default parameters for all other sections following its declaration.
	 * frontend: describes a set of listening sockets accepting client connection.
	 *		   It includes lb_service information.
     * backend: descibes a set of servers to which the proxy will connect to forward incomming connections.
	 *		  It includes lb_pool and lb_pool_member information
	 * listen: defines a cmplete proxy with its frontend and backend parts combined in one section
	 *		 It includes lb_service, lb_pool and lb_pool_member information
	 **/
    process : function() {
		var lines = output.split("\n");
		
		// no results
		if (lines.length == 0)
			return;
		
		this.frontendList = [];	// includes lb_service information like: IP and listening ports for the
								   // server, condition to forward requests and the pool names to forward
								   
		this.backendList = {};	 // includes lb_pool and lb_pool information like the pool name, lb method
								   // and pool members info like ip_address and ports
		this.listenList = {};	  // includes the frontend and backend information
		this.hostList = {};
		this.defaultBlock = {};
		
		
		// based on the keywords defaults, frontend, backend and listen we start processing a block and
		// create a temporary block named "tempBlock" and keep the type of the block in "blockType" 
		// After reading all neccessay information of the block in "tempBlock", if it is active and works 
		// in http mode it will be added to the corresponding list: frontend, backend or listen
		var blockType = null;
		var tempBlock = {};
		
		// A block can be disabled by including "disabled" keyword in the block. "enabledBlock" is true
		// as long as we don't see "disabled" in a block
		var enabledBlock = true;	
									   
		// HAProxy can run in 2 modes, http and tcp. We are processing information only for http mode.
		// "validBlock" is true as long as the mode is http.
		var validBlock = true;	
		
		// the number of blocks that are processed. It is used to track the blocks and add them in to the 
		// corressponding list: frontend, backend or listen 
		var blockNumber = 0;	
		var hostInfo = false;
		
		for (var i = 0; i < lines.length; i++) {
			var line = lines[i];
			if (line == '')
				continue;
			
			line = line.trim();
			
			if (hostInfo) {
				var lineParts = line.split (':');
				var hostName = lineParts[0].trim();
				var hostIP = lineParts[1].trim();
				if (!JSUtil.nil(hostIP)){
					if ( this.hostList[hostName] == undefined)
						this.hostList[hostName] = hostIP;
				}
				continue;
			}
			
			var parts = line.split(/\s+/); 
			var keyword = parts[0];
			var value = parts[1];
			
			
			
			// Identify a new block 	
			if (keyword == 'defaults' || keyword == 'frontend' || keyword == 'backend' || keyword == 'listen') {
				if (blockNumber > 0 && enabledBlock && validBlock) 
					this.updateBlockLists (tempBlock, blockType);
					
				blockNumber ++;
				enabledBlock = true;
				validBlock = true; 
				blockType = keyword;
				tempBlock = {};
				tempBlock.aclList = {}; 
				
				// Process frontend block or listen block declaration to find the name and available binds
				if (keyword == 'frontend' || keyword == 'listen') {
					this.processBlockDeclaration (tempBlock, line);
					tempBlock.useBackends = [];
				}
				
				// define serverList for listen and backend blocks 
				if (keyword == 'listen' || keyword == 'backend'){
					tempBlock.servers = [];
					tempBlock.name = value;
				}
				
			}
			
			if (!enabledBlock || !validBlock)
				continue;
			else if (keyword == 'bind') 
				this.processIPBinds (tempBlock, value); 
			else if (keyword == 'disabled')
				enabledBlock = false;
			else if (keyword == 'default_backend' || keyword == 'balance')
				tempBlock[keyword] = value;
			else if (keyword == 'acl')
				this.processACL (tempBlock, line); 
			else if (keyword == 'mode') {
					// Ignore listen, backend and frontend blocks of tcp mode
					if ((value == 'tcp' || value == 'health') && blockType != 'defaults')
						validBlock = false;
					else
						tempBlock.mode = value;
				}	
			else if (keyword == 'server') {
					var server = {};
					var address = parts[2];
					var ipInfo = address.split(':');
					server.ip = ipInfo[0];
					server.port = ipInfo[1]; 
					server.name = value;
					tempBlock.servers.push(server);
				}
			else if (keyword == 'use_backend') {
					var backend = {};
					backend.name = value; 
					backend.condition = parts[2];
					backend.acl = parts[3];
					tempBlock.useBackends.push(backend);
				}
			else if (keyword == '<HOST-IP-INFORMATION>') {
					if (blockNumber > 0 && enabledBlock && validBlock) 
						this.updateBlockLists (tempBlock, blockType);
					hostInfo = true;
				}
		}
		
		related_data.frontendList = this.frontendList;
		related_data.backendList = this.backendList;
		related_data.listenList = this.listenList;
		related_data.hostList = this.hostList;
		
	},
	
	
	
	/*
	 * Process the first line of frontend or listen block
	 * This line has the following format 
	 * frontend <name> <ip-address>:<port>[,...]
	 * The name is optional and port can be a single integer or a range
	 */
	processBlockDeclaration: function (block, line) {
		block.bind = [];
		var value = line.substr (line.indexOf(' ') + 1);
		value = value.trim ();
		if (JSUtil.nil (value))
			return;
		
		var decParts = value.split(/\s+/);
		// Block declaration incldues name and IP list
		// Example: frontend webfarm 10.12.12.23:8080-8082,10.12.12.23:8085
		if (decParts.length > 1){
			block.name = decParts[0];
			this.processIPBinds (block,decParts[1]);
			return;
		}
		
		// Block declaration includes only name 
		// Example: frontend wefarm
		if (decParts[0].indexOf(':') == -1){
			block.name = decParts[0];
			return;
		}
		
		// No name in the block declaration 
		// Example: frontend 10.12.12.23:8080-8082,10.12.12.23:8085
		if (decParts[0].indexOf(',') !== -1) {
			block.name = '';
			this.processIPBinds (block, decParts[0]);
			return;
		}
		
		// Block declaration has only one part, check if it is name or <ip-adress>:<port>
		// The name of the block can include ':'
		// Example1: frontend webfarm 
		// Example2: frontend 10.12.12.23:8080-8082
		var ipInfo = decParts[0].split(':');
		var ip = ipInfo[0];
		var port = ipInfo[1];
		if (!isNaN(port))
			this.processIPBinds (block, decParts[0]);
		else if (port.indexOf ('-') != -1) {
			var portParts = port.split('-');
			if (portParts.length != 2)
				return;
			
			if (!isNaN (portParts[0]) && !isNaN (portParts[1]))
				this.processIPBinds (block, decParts[0]);
			
		}
	},
	
	
	// Process the list of <ip-address>:<port>,..
	processIPBinds: function (block,ipPart) {
		var ipList = ipPart.split(',');
		for (var i = 0; i < ipList.length; i++) {
			if (ipList[i].indexOf(':') != -1) {
				var ipInfo = ipList[i].split(':');
				var ip = ipInfo[0];
				var portPart = ipInfo[1];
				var newAddr = {};
				newAddr.ip = ip;
				var ports = portPart.split('-');
				newAddr.startPort = ports[0];
				if (ports.length > 1) 
					newAddr.endPort = ports[1];
				block.bind.push(newAddr);
					
				
			}
		}
		
	},

	// Add the processed block to its corresponding list based on the block type
	updateBlockLists: function (tempBlock, blockType) {
		
		if (blockType == 'defaults'){
			this.defaultBlock = {};
			this.defaultBlock = tempBlock;
		} else {
			// If the block mode is tcp is not processed
			if ( ( this.defaultBlock.mode == 'tcp' ||  this.defaultBlock.mode == 'health') && tempBlock.mode == undefined)
				return;
			
			// For frontend and listen blocks, default-backend defined in default block is added
			if (blockType == 'frontend' || blockType == 'listen') {
				if (tempBlock.default_backend == undefined && this.defaultBlock.default_backend != undefined)
					tempBlock.default_backend = this.defaultBlock.default_backend;
				
				if (blockType == 'frontend')
					this.frontendList.push (tempBlock);
				
				if (blockType == 'listen')
					this.listenlist.push (tempBlock);
				
			}
			
			// For listen and backend blockd the balance defined in dafault block is added
			if (blockType == 'listen' || blockType == 'backend') {
				if (tempBlock.balance == undefined && this.defaultBlock.balance != undefined)
					tempBlock.balance = this.defaultBlock.balance;
				
				if (blockType == 'backend')
					this.backendList[tempBlock.name] = tempBlock;
				
				if (blockType == 'listen')
					this.listenList[tempBlock.name] = tempBlock;
			}
		}	
	},
		
	// ACL is added to the aclList of the block
	// The list is indexed based on the name of ACL
	processACL: function (block, line) {
		var lineParts = line.split(/\s+/);
		var aclName = lineParts[1];
		var value = line.substr(line.indexOf(lineParts[2]));
		var acl = {};
		acl.criterion = value;
		block.aclList [aclName] = acl;
		
	},
	
	
   
    type: "ProbePostProcessor"
});
