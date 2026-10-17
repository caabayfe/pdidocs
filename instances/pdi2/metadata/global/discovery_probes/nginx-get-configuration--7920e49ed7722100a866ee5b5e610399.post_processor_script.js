new ProbePostProcessor({


    /**
     * All load-balancing information for nginx can be collected from two types of blocks.
	 * Upstream blocks contain pool and pool members information. 
	 * Server blocks conrain information about which servers and on which ports are listening for the requests
	 * and which requests are forwarded to which pools.
     */    
    process: function() {
		var lines = output.split("\n");
		
		// no results
		if (lines.length == 0)
			return;
		
		this.upstreamList = {};
		this.serverList = [];
		this.hostList = {};
	
		 
		//  by seeing 'upstream' or 'server' keywords we start processing a block.
		 
		var curUpstream = '';			// Contains the name of the upstream block that we are in the middle of reading its information
		var serverBlock = false;
		var locationBlock = false;
		var tempServer = {};
		var tempLocation = {};
		var hostInfo = false;
		
		// Process output
		for (var i = 0; i < lines.length; i++){
			var line = lines[i];
			if (line == '')
				continue;
			line = line.trim();
			
			// remove ';'  or '{' characters from the end of the end of the line
			line = this.removeExtraChar(line);
			var parts = line.split(/\s+/);
			var keyword = parts[0];
			var value = parts[1];
			var lastPart = parts[parts.length -1];
			var lineNoKeyword =''; 	// For some cases we need to work on the rest of the line after keyword
			for (var j = 1; j < parts.length; j++)
					lineNoKeyword += ' ' + parts[j];
			lineNoKeyword = lineNoKeyword.trim();
			
			// If the last character of the line is '}' (end of a block) lastPart set to '}'
			// to identify a completed block
			if ( lastPart.charAt(lastPart.length-1) == '}')
				lastPart = '}'; 
			
			// If the information is related to host information containing host name and it's ip address
			// we add them to this.hostList 
			if (hostInfo) {
				var hostName = line.split(':')[0].trim();
				var hostIP = line.split(':')[1].trim();
				if (!JSUtil.nil(hostIP)){
					if ( this.hostList[hostName] == undefined)
						this.hostList[hostName] = hostIP;
				}
				continue;
			}
			
			// A new upstream block begins, create a new block in upstreamList
			if (keyword == 'upstream') {
				curUpstream = value;
				this.upstreamList[value] = {};
				this.upstreamList[value].servers = [];
				this.upstreamList[value].method = 'round-robin';
			}
			
			//Process configuration parameters in upstream block
			if (!JSUtil.nil(curUpstream)) {
				if (keyword == 'server' && lineNoKeyword.indexOf('down') == -1)		// information related to pool members
					this.upstreamList[curUpstream].servers.push(value);
				else if (keyword == 'ip_hash') 
						this.upstreamList[curUpstream].method = 'ip-hash';			// load-balancing method is ip-hash
				else if (keyword == 'least_conn')
						this.upstreamList[curUpstream].method = 'least-connection';	// load-balancing method is least-connection
				
				if (lastPart == '}')    			// Check if the line includes '}' to end of the block 
					curUpstream = '';
			} else {
				// start reading host-ip information
				if (keyword == '<HOST-IP-INFORMATION>'){
					hostInfo = true;
					continue;
				} else if (keyword == 'server') {	// Looking for a server block
						serverBlock = true; 
						// server block information is collected in a temporary server and we add this server to serverList
						// if it works as a load balancer, it contains some location blocks that forward requestes to an upstream block
					    // with pool members.
						tempServer = {};
						tempServer.locations = [];
						tempServer.names = [];
						tempServer.listens = [];
					}
				
				if (!serverBlock) 
					continue;
				else if (keyword == 'listen' )				// listening ip and port
						tempServer.listens.push(value);
				else if (keyword == 'server_name')
						for (j = 1 ; j < parts.length; j++)
							tempServer.names.push(parts[j]);
				else if (keyword == 'location'){			
						locationBlock = true;
						// location is a block that explain under waht conditions the input requests will be forwarded
					    // the location information is saved in a temporary object and it will be added to locationlist in the server
						// if it has some conditions to forward the  requests to a pool ( works as a load balancer)
						tempLocation = {};
						tempLocation.url = lineNoKeyword;			// indicates which requests are accepted by this block
						tempLocation.proxyPass = '';		 // indicates the accepted requests are forwarded to which pool
					
					}
				else if (keyword == 'proxy_pass' && locationBlock ) {	// proxy-pass has the poolName information
					var poolInfo = value.split('//');					// Example: proxy_pass http://myproject;
					if (poolInfo[0] == 'http:' || poolInfo[0] == 'https:')						  // The name of the pool to which the requests are forwarded
						tempLocation.proxyPass = poolInfo[1].slice(-1) == '/' ? poolInfo[1].slice(0, -1) : poolInfo[1];			// is saved in proxyPass.
				}
				
				if (lastPart == '}'){ 		 // Check if the line contains the '}' to identify the end of the block
					if (locationBlock){		// If we are processing the lcoation block, it will be added to the tempServer 
						locationBlock = false;
						if (!JSUtil.nil(tempLocation.proxyPass))
							tempServer.locations.push (tempLocation);
					
					} else {
						serverBlock = false;	// If we are processing a server block, we add tempServer to serverList  
												// if it has some load-balancing information (location block to forward requests to a pool)
						if (tempServer.locations.length >0){
							// default port 80 is used for the server if the listen is not defined for the server
							if (tempServer.listens.length == 0)
								tempServer.listens.push('80');
							this.serverList.push(tempServer);
						}
					}
				}
			
			}	
		}
		
		related_data.upstreamList = this.upstreamList;
		related_data.serverList = this.serverList;
		related_data.hostList = this.hostList; 
	
	},
	
	/* 
	 * In  some cases the line includes ; or { which is not part of the parameters.
	 * Example upstream myCloud{
	 * The following function removes these extra characters from the input string.
	 */
	removeExtraChar: function(value) {
		var lastChar = value.charAt(value.length-1);
		if (lastChar == ';' || lastChar == '{')
			value = value.substring(0,value.length-1);
		return value; 
	},
   
    type: "ProbePostProcessor"
});
