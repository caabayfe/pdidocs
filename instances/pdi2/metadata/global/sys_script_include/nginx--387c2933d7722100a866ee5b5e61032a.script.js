// Discovery

var Nginx = Class.create();
Nginx.prototype = Object.extendsObject ( LBModule, {
	
    initialize: function (blocks, serverIP , webServerGr) {
		this.servers = blocks.serverList;
		this.upstreams = blocks.upstreamList; 
		this.hosts = blocks.hostList; 
		this.webServerGr = webServerGr;
		this.serverIP = serverIP; 
		this.serverName = '';
		this.lbGr = null; 
		this.type = 'Nginx';
    },
	
	/*
	 * Return true if nginx is configured as a load-balancer
	 * It is possible that nginx is setup only as a webserver, in this case 
	 * no information is populated. 
	 */
	isLoadBalancer: function () {
          var RunsOn_Runs = '60bc4e22c0a8010e01f074cbe6bd73c3';
          var hostCISysID, hostCIClass;
          if (this.servers.length > 0) {
            // Fetching the related host CI for the web server
            var hostRelGr = new GlideRecord('cmdb_rel_ci');
            hostRelGr.addQuery('parent', this.webServerGr.getValue('sys_id'));
            hostRelGr.addQuery('type', RunsOn_Runs);
            hostRelGr.query();
            if(hostRelGr.next()) {
                hostCISysID = hostRelGr.getValue('child');
                hostCIClass = hostRelGr.getElement('child.sys_class_name');
            }

            this.serverName = this.webServerGr.getValue('name').split('@')[1];
            this.lbGr = this.updateNginxLbTable(this.serverName, this.serverIP, 'cmdb_ci_lb_nginx', hostCISysID, hostCIClass, this.webServerGr.getValue('sys_id'));

            return true;
          }
          return false;
	},
	
	/*
	 * Populate LB information for Nginx
	 * We start from every virtual server defined by the server block 
	 * Every service is defined based on the ip, port and input_url, so for every 
	 * port or ip or host name assigned to a server we need to create a new service.
	 * For example : server {
	 *						listen 	10.12.12.23:80
	 *						listen	 10.12.12.24:80
	 *						server_name example.org example.com
	 *						...
	 *						location / {
	 *								proxy_pass http://myCloud
	 *						}
	 * we need to create 4 services 
	 * service1: (ip: 10.12.12.23:80, port: 80, input_url:example.org/)
	 * service2: (ip: 10.12.12.23:80, port: 80, input_url:example.com/)
	 * service3: (ip: 10.12.12.24:80, port: 80, input_url:example.org/)
	 * service4: (ip: 10.12.12.24:80, port: 80, input_url:example.com/)
	 */
	populateInfo: function () {
		
		for (var i =0; i < this.servers.length ; i++) {
			
			var server = this.servers[i];
			// For every server, process listen parameters to find ip and port
			for (var j = 0; j < server.listens.length; j++){
				var listen = server.listens[j];
				// Process list of locations to find the url and poolName 
				for (var k = 0; k < server.locations.length; k++) {
					var location = server.locations[k];
					var serviceGrList = this.populateServiceInfo (server, listen, location); 
					this.populatePoolInfo (serviceGrList, location); 
					
				}
			}
		}
		// Create Relationship 'provides:: provided by' between the inginx web server and the load_balancer
		
		var cmdbGr = g_device.getCmdbCi();
		var discoFunctions = new DiscoveryFunctions();
		discoFunctions.createRelationshipIfNotExists(cmdbGr, this.lbGr.sys_id+'','Provides::Provided by');
		
		this.reconcile(this.lbGr.getValue('sys_id'));
		
	},
	/*
	 * For every name of the server we create a service and populate information
	 * in cmdb_ci_lb_service.
	 */
	populateServiceInfo: function (server, listen, location) {
		var serviceList = [];

		// Don't support IPv6
		if (listen.indexOf('[::]') > -1)
			return serviceList;
							
		// No information for the pool						
		if (this.upstreams[location.proxyPass] == undefined)
			return serviceList; 
	
		// Find ip and port for the service
		var ip = this.serverIP;		  // default IP address is the ip address of the server
		var port = 80;   				//default port for nginx is 80
		
		
		var parts = listen.split(':');
		if (parts.length == 1) 			// It is possible that we have only the port:  listen 80;
			port = parts[0]; 
		else {
			port = parts[1];
			if (parts[0] != 'localhost' && parts[0] != '*')	// If the ip part is '*' or localhost ip is the same as serverIP
				ip = parts[0];
		}
		
		// Process url part from location block
		// If url or the server_name is regular expression then input_url is populated
		// with this format "regExpr:server_name/url"
		var regExprUrl = false; 
		var locationUrl = location.url;
		
		if (locationUrl.charAt(0) == '~') {	// '~' at the begining of the url menas we used regular expression
			regExprUrl = true;
			locationUrl = locationUrl.substring(locationUrl.indexOf('~')+1); 
		}
		
		// It is possible that server_name is not defined 
		// In this case all location are related to the main server
		if ( server.names.length == 0 )
			server.names.push (''); 
		
		// create a service for every defined virtual server name
		// For every url the complete url is a combination of the server-name and url
		// Example:
		// 		server_name	myExample.org
		// 		location  /{
		//				....
		//		 }
		// the input_url which is populated is myExample.org/
		for (var i = 0; i < server.names.length; i++) {
			var service = {}; 
			service.name = 'Nginx@' + this.serverName + ':' + port;
			service.port = port;
			service.ip_address = ip; 
			// It is possible that the server_name is defined as a regular expression
			// the same rules for url is followed
			var regExprServer = false;
			var name = server.names[i]; 
			if (name.charAt(0) == '~' ) {
				regExprServer = true;
				name = name.substring(name.indexOf('~')+1);
			}
			
			if (locationUrl.indexOf('/') != 0)
				service.input_url = name +'/'+ locationUrl;
			else
				service.input_url = name + locationUrl;
			
			if (regExprUrl || regExprServer)
				service.input_url = 'regExpr:' + service.input_url;
			
			service.load_balancer = this.lbGr.sys_id + '';
			serviceList.push (this.updateServiceTable(service));
		}
		
		return serviceList; 	
						
	},
	
	/* 
	 * Based on the name of the pool, the corresponding upstream block is found
	 * and the method of load balancing is populated.
	 */
	populatePoolInfo: function (serviceGrList, location) {
		for (var i = 0 ; i < serviceGrList.length ; i++) {
			var serviceGr = serviceGrList[i];
			
			// Populate pool information in cmdb_ci_pool table
			var poolName  = location.proxyPass;
			var lbMethod = this.upstreams[poolName].method;
			var poolGr = this.updatePoolTable(poolName, lbMethod, this.lbGr, serviceGr);
						
			//Populate pool memebrs information 
			if (!gs.nil (poolGr)) 
				this.populatePoolMemberInfo (poolName, poolGr);
				
			
						
		}
	},
	/*
	 * From the upstream block corresponding to the pool, the information 
	 * for the pool members are populated 
	 */ 
	populatePoolMemberInfo: function (poolName, poolGr) {
		var pool = this.upstreams[poolName];
		
		for (var i = 0; i < pool.servers.length; i++) {
			var server = pool.servers[i];
			var ipInfo = server.split(':');
			var ip = server.split(':')[0];
			var port = server.split(':')[1];
			if (gs.nil(port))
				port = 80;    	//default port is 80 
				
			//Create a member object 
			var member = {};
			member.name = 'LBMember@' + poolName;
			member.service_port = port;
			member.load_balancer = this.lbGr.sys_id + '';
			if (this.isValidIPv4 (ip))
				member.ip_address = ip;
			else {
				member.fqdn = ip;
				if (this.hosts [ip] != undefined)
					member.ip_address = this.hosts[ip];
				
			}
			this.updatePoolMemberTable (member, poolGr) ;
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
				 
    type: 'Nginx'
});
