// Discovery


var JkModule = Class.create();
JkModule.prototype = Object.extendsObject(LBModule,{
	
    initialize: function (serversInfo, workers, hostIpInfo) {
		this.servers = serversInfo;
		this.type = 'mod_jk';
		this.workerList = workers;
		this.hostsIpList = hostIpInfo;
    },
	
   /*
    * Populate information in the tables
    */
    populateJkInfo: function() {
		var msg = ''; 
		var jkLbGr = '';
		var jkBalancer = false;
		
		if (!gs.nil(this.servers[0].serverName))
			jkLbGr = this.updateLbTable(this.servers[0].serverName, this.servers[0].ip, 'cmdb_ci_lb_modjk');
		else
			jkLbGr = this.updateLbTable(this.servers[0].ip,this.servers[0].ip, 'cmdb_ci_lb_modjk');
		
		for (var i = 0; i< this.servers.length; i++) {
			
			for (var j = 0; j< this.servers[i].jkMounts.length; j++) {
				var workerName = this.servers[i].jkMounts[j].split(/\s+/)[1];
				
				if (this.workerList[workerName] != undefined && this.workerList[workerName].type == 'lb'){
					
					jkBalancer = true;	// mod_jk is running as a load balancer 
					var serviceGrList = this.populateServiceInfo(i,j,jkLbGr);
					
					if (serviceGrList.length>0) {		 
						for (var k = 0; k < serviceGrList.length; k++) {
							var serviceGr = serviceGrList[k];
							var poolGr = this.updatePoolTable (this.workerList[workerName].name, 'round-robin', jkLbGr, serviceGr);
							
							if (!gs.nil(poolGr)) 				
								this.populatePoolMembers (i, poolGr, workerName, jkLbGr.sys_id, poolGr);
								
							 else if (gs.nil(poolGr)) {
								msg =  'No load balancer pool found for ' + workerName; 
								DiscoveryLogger.warn (msg,'Apache - Get JK Module',this.getEccQueueId(),null);
							}
						}
					} else {
						msg =  'No load balancer services found for ' + workerName; 
						DiscoveryLogger.warn (msg,'Apache - Get JK Module',this.getEccQueueId(),null);
					}
			
				}
			}
		}
		
		// Create Relationship 'provides:: provided by' between the apache web server and the load_balancer
		if (jkBalancer) {
			var cmdbGr = g_device.getCmdbCi();
			var discoFunctions = new DiscoveryFunctions();
			discoFunctions.createRelationshipIfNotExists(cmdbGr, jkLbGr.sys_id+'','Provides::Provided by');	
		}
		this.reconcile(jkLbGr.getValue('sys_id'));
	},
	
	
	populateServiceInfo: function (jkIndex,jkMountIndex,lbGr) {
		var serviceList =[];
		
		for (var i=0; i< this.servers[jkIndex].port.length;i++) {
			var service = {};
		
			if (!gs.nil(this.servers[jkIndex].serverName)) {
				service.name = 'JKModule@'+this.servers[jkIndex].serverName+ ':'+this.servers[jkIndex].port[i];
			} else if (!gs.nil(this.servers[0].serverName)){
					service.name = 'JKModule@'+this.servers[0].serverName + ':'+this.servers[jkIndex].port[i];
			} else {
				service.name = 'JKModule@'+this.servers[0].ip + ':'+this.severs[jkIndex].port[i];
			}
			
			service.port = this.servers[jkIndex].port[i];
			service.ip_address = this.servers[jkIndex].ip;
			if (gs.nil(service.ip_address))
				service.ip_address = this.servers[0].ip;
		
			service.input_url =  this.setUrl(jkIndex,jkMountIndex);
			service.load_balancer = lbGr.sys_id;
			serviceList.push(this.updateServiceTable(service));
			
		}
		
		return serviceList;
	},
	
	/*
	 * Creates a complete url to populate in cmdb_ci_lb_service table, url in JkMount can be a partial url
	 */
	 
	setUrl : function(jkIndex,mountIndex) {
		var JkParts = this.servers[jkIndex].jkMounts[mountIndex].split(/\s+/);
		var url = JkParts[0];
		var urlParts = url.split('/');
		var prefix = this.servers[jkIndex].serverName;
		
		if (urlParts[0] != prefix)
			return prefix+url;
		
		return url;
	},
	
	
	/*
	 * Populate information in the cmdb_ci_lb_pool_member table 
	 */
	populatePoolMembers:function (jkIndex, poolGr, workerName,lbGr, poolGr) {
		var poolName = poolGr.getValue('name'); 
		var wList = this.workerList[workerName].balance_workers;
		var blWorkers = wList.split(','); 
		
		for (var i = 0; i < blWorkers.length; i++) {
			var wName = blWorkers[i];
			
			
			if (this.workerList[wName] != undefined ) {
				var blWorker = this.workerList[wName];
				var member = {}
				member.name = blWorker.name;
				member.service_port = blWorker.port;
				member.load_balancer = lbGr; 
				var wIPAddress = null;
				wIPAddress = this.hostsIpList[blWorker.host];
				if (wIPAddress == '127.0.0.1' || wIPAddress == undefined)
			 		wIPAddress = this.servers[0].ip;
				
				// IP address of the host is not a valid IPv4
				if (wIPAddress == 'INVALID'){
					var msg = 'The ip address of host ' + blWorker.host + ' is not valid IPV4 format in /etc/hosts file';
					DiscoveryLogger.warn(msg,'Apache - Get JK Module',this.getEccQueueId(),null); 
				} else {
					member.ip_address = wIPAddress;
					this.updatePoolMemberTable (member,poolGr); 
					
				}
					
			}
		}
	},
	

    type: 'JkModule'
});
