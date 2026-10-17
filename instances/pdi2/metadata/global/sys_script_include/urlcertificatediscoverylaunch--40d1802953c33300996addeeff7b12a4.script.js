// Discovery
var URLCertificateDiscoveryLaunch = Class.create();
URLCertificateDiscoveryLaunch.prototype = Object.extendsObject(global.DiscoveryLaunch, {
    initialize: function(status, schedule) {
		global.DiscoveryLaunch.prototype.initialize.call(this, status, schedule);
    },

	launch: function() {
		var urls = [];
		var scheduleGr = new GlideRecord('discovery_schedule');
		// batch size = number of probes triggered, split urls accordingly
		var batchSize = 1000;
		/**
		  Step 1 - Grab the list of urls from enpoint http table based on discovery domain Id and insert matching records into discovery url table.
		  Step 2 - Dynamic Mapping: Add the endpoint urls to m2m relationship table
		**/
		if (scheduleGr.get(this.schedule.sysID)) { // should always exist ...
			batchSize = scheduleGr.getElement('cert_discovery_url_batch_size');
			var fetchEndpointURLs = scheduleGr.getValue('include_endpoint_https_urls');
			if (fetchEndpointURLs == 1) {
				var discoveryScheduleDomainId = scheduleGr.getValue('sys_domain');
				var grEndpointUrls = new GlideRecord('cmdb_ci_endpoint_http');
				grEndpointUrls.addQuery('sys_domain', discoveryScheduleDomainId);
				grEndpointUrls.addEncodedQuery('urlISNOTEMPTY');
				grEndpointUrls.query();
				while (grEndpointUrls.next()) {
					var certURLM2M = new GlideRecord('sn_disco_certmgmt_cert_url_sched_m2m');
					certURLM2M.addQuery('schedule', this.schedule.sysID);
					certURLM2M.addQuery('cert_url.url', grEndpointUrls.getValue('url'));
					certURLM2M.addQuery('sys_domain', discoveryScheduleDomainId);
					certURLM2M.query();
					if (!certURLM2M.next())
						this._mapUrlsToSchedule(grEndpointUrls.getValue('url'), discoveryScheduleDomainId);
				}
			}
		}
		// grab the list of urls and put into probe parameter
		var scheduledUrls = new GlideRecord('sn_disco_certmgmt_cert_url_sched_m2m');
		scheduledUrls.addQuery('schedule', this.schedule.sysID);
		scheduledUrls.query();

		while (scheduledUrls.next()) {
			if (!scheduledUrls.cert_url)
				continue;

			urls.push(scheduledUrls.cert_url.url); // dot-walk to the sn_disco_certmgmt_cert_url record
		}
		// Make probe objects that contain the 'urls' parameter for each batch
		var urlProbeBatches = this._getUrlProbeBatches(urls, batchSize);

		if (this.schedule.midSelectSpecificCluster())
			this._launchForSpecificMidCluster(urlProbeBatches);
		else if (this.schedule.midSelectAuto())
			this._launchForAutoSelectMid(urlProbeBatches);
		else
			this._launchForSpecificMid(urlProbeBatches);
	},
	_mapUrlsToSchedule: function(url, discoveryScheduleDomainId) {
		var certURLSysID = null;
		
		var certURLGR = new GlideRecord('sn_disco_certmgmt_cert_url');
		certURLGR.addQuery('url', url);
		certURLGR.addQuery('sys_domain', discoveryScheduleDomainId);
		certURLGR.query();
		
		if (certURLGR.next())
			certURLSysID = certURLGR.sys_id;
		else {
			certURLGR = new GlideRecord('sn_disco_certmgmt_cert_url');
			certURLGR.initialize();
			certURLGR.setValue('url', url);
			certURLGR.setValue('sys_domain', discoveryScheduleDomainId);
			certURLSysID = certURLGR.insert();
		}
		
		var grCertUrlScheduleRelatoinship = new GlideRecord('sn_disco_certmgmt_cert_url_sched_m2m');
		grCertUrlScheduleRelatoinship.setValue('schedule', this.schedule.sysID);
		grCertUrlScheduleRelatoinship.setValue('cert_url', certURLSysID);
		grCertUrlScheduleRelatoinship.setValue('sys_domain', discoveryScheduleDomainId);
		grCertUrlScheduleRelatoinship.insert();
	},
	_getUrlProbeBatches: function(urls, batchSize) {
		var urlProbeBatches = [];
		while (urls && urls.length) {
			var probe = SncProbe.get('70de175d53433300996addeeff7b1243'); // URL Certificate Scan
			probe.setCorrelator(this.status.sysID);
			probe.addParameter('urls', urls.splice(0, batchSize).join(","));
			if (this.status.priority)
				probe.setEccPriority(this.status.priority);

			urlProbeBatches.push(probe);
		}

		return urlProbeBatches;
	},

	_launchForSpecificMid: function(urlProbeBatches) {
		var agent = this.schedule.midServer.name;
		urlProbeBatches.forEach(function(urlProbe) {
			urlProbe.createForMidServer(agent, null);
		});
	},

	_launchForAutoSelectMid: function(urlProbeBatches) {
		var app = this.schedule.getAppName();
		urlProbeBatches.forEach(function(urlProbe) {
			urlProbe.createForAutoSelectMidServer(app, null, null);
		});
	},

	_launchForSpecificMidCluster: function(urlProbeBatches) {
		var cluster = this.schedule.midClusterID;
		var app = this.schedule.getAppName();
		urlProbeBatches.forEach(function(urlProbe, index) {
			urlProbe.createForCluster(app, cluster, null);
		});
	},

    type: 'URLCertificateDiscoveryLaunch'
});
