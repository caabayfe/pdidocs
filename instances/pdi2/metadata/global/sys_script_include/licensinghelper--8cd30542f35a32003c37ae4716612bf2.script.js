var LicensingHelper = Class.create();
LicensingHelper.prototype = {

	serversCounter : undefined,
	cloudApplicationsCounter : undefined,

    initialize: function() {
		this.serversCounter = new ServersCounter();
		this.cloudApplicationsCounter = new CloudApplicationsCounter();
    },

	saveRecord : function(num) {
		var gr = new GlideRecord('sa_server_usage');
		gr.setValue('number_of_servers', num);
		gr.setValue('created_on', gs.nowDateTime());
		gr.insert();
	},

	saveProductCount: function(count) {
		var licenseUtils = new sn_itom_license.ITOMLicensingUtils();
		licenseUtils.updateProductCount('Service Mapping', count);
	},

	// This function saves licensing counter for each domain
	// to DB table sa_server_usage, if saveToDB parameter is true
	// Returns: sum of all licensing counters as integer
	// For each domain licensing counter is sum of 2 numbers:
	// 1. Number of servers that are belong to business services
	// 2. Number of applications, hosted on logical datacenters

	saveNumberOfServersInAllDomains : function (saveToDB) {
		var serversData   = this.serversCounter.getServerCounters();
		var cloudAppsData = {}; //PRB1170297     this.cloudApplicationsCounter.getCloudApplicationCounters();

		var res = {};
		var domain;

		for (domain in serversData)
			if (serversData.hasOwnProperty(domain))
					res[domain] = serversData[domain];
		for (domain in cloudAppsData)
			if (cloudAppsData.hasOwnProperty(domain)) {
				if (res.hasOwnProperty(domain))
					res[domain] += cloudAppsData[domain];
				else
					res[domain] = cloudAppsData[domain];
			}

		var total = 0;
		var noData = true;

		for (domain in res)
			if (res.hasOwnProperty(domain)) {
				noData = false;
				total += res[domain];
				if (saveToDB) {
					var currentDomain = GlideSession.get().getCurrentDomainID();
				    GlideSession.get().setDomainID(domain);
					this.saveRecord(res[domain]);
				    GlideSession.get().setDomainID(currentDomain);
				}
			}
		if (saveToDB) {
			if (noData)
				this.saveRecord(0);

			this.saveProductCount(total);
		}

		return total;
	},

	//This function prepares report about all objects that are
	//included to licensing counters for verification purposes.
	//Returns: Javascript object with domain SysIDs as properties,
	//the value of each one is array of SysIDs of CIs, that belong
	//to appropriate domain and included to licensing counter.
	getReport : function() {
		var serversData   = this.serversCounter.getServers();
		var cloudAppsData = {}; //PRB1170297     this.cloudApplicationsCounter.getCloudApplications();

		var res = {};
		var domain;

		for (domain in serversData)
			if (serversData.hasOwnProperty(domain))
					res[domain] = serversData[domain];


		for (domain in cloudAppsData)
			if (cloudAppsData.hasOwnProperty(domain)) {
				if (domain in res) {
					for (var n = 0; n < cloudAppsData[domain].length; n++)
						res[domain][res[domain].length] = cloudAppsData[domain][n];
				}
				else
					res[domain] = cloudAppsData[domain];
			}
		return res;
	},

	//This function prints detailed report about CIs, that
	//are included to licensing counter, to log.
	//Can be invoked on instance from background script.
	logReport : function() {
		var data = this.getReport();
		var total = 0;

		for (var domain in data)
			if (data.hasOwnProperty(domain)) {
				gs.log('Domain: ' + domain);
				var num = 1;
				total += data[domain].length;
				for (var i = 0; i < data[domain].length; i++) {
					var info = data[domain][i];
					gs.log('    ' + num + ': ' + info.sys_id + '    ' + info.name + '    ' + info.sys_class_name);
					num++;
				}
			}
		gs.log('TOTAL: ' + total);
	},

    type: 'LicensingHelper'
};
