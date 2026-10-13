var ServersCounter = Class.create();
ServersCounter.prototype = {
	
	au : undefined,
	isDomainSeparationSupported : undefined,
	
    initialize: function() {
		this.au = new ArrayUtil();
		this.isDomainSeparationSupported = (new SNC.DomainHelper()).isDomainPluginInstalled();
	},
	
	performQuery : function () {
		var res = {};
		
		var lh = new SNC.LicensingUtil();
		var allServers = lh.getServersForLicensing();
		
		for (var i = 0; i < allServers.length; i++) {
			var serverData = allServers[i];
			var domain = this.isDomainSeparationSupported ? serverData[3] : 'global';
			
			if (!(domain in res))
				res[domain] = [];
		
			res[domain][res[domain].length] = serverData[1];
		}
		
		return res;
	},
	
	/*
	 * This function is external API
	 * It returns map : domain to integer counter of servers
	 */
	getServerCounters : function () {
		var res = this.performQuery();
		
		for (var domain in res)
			if (res.hasOwnProperty(domain))
				res[domain] = res[domain].length;

		return res;
	},
	
	/*
	 * This function is external API
	 * It returns map : domain to list of objects, each one has
	 * properties: sys_id, name and sys_class_name
	 */
	getServers : function () {

		var res = {};
		
		var lh = new SNC.LicensingUtil();
		var allServers = lh.getServersForLicensing();
		
		for (var i = 0; i < allServers.length; i++) {
			var serverData = allServers[i];
			var domain = this.isDomainSeparationSupported ? serverData[3] : 'global';
			
			if (!(domain in res))
				res[domain] = [];
			
			var server = {};
						
			server.sys_id = serverData[1];
			server.name   = serverData[2];
			server.sys_class_name = serverData[0];
			res[domain][res[domain].length] = server;
		}
		
		return res;

	},

    type: 'ServersCounter'
};
