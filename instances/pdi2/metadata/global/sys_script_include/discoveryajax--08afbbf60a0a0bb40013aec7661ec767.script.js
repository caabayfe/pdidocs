var DiscoveryAjax = Class.create();

DiscoveryAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	ajaxFunction_getSysID: function() {
		var d = new Discovery();
		var sys_id = d.discoveryFromCI(this.getParameter('sysparm_cmdb_ci'));
		return sys_id;
	},
	
	/**
 	* Creates range sets for all IP Networks that have been freshly discovered.
 	* @return boolean TRUE on success
 	*/
	ajaxFunction_createRangesFromNetworkDiscovery: function() {
		return new DiscoveryCreateRangeSets().processNetworks();
	},
	
	ajaxFunction_setAllToReady: function() {
		var gr = new GlideRecord('cmdb_ci_ip_network');
		gr.addQuery('state', 'Processed');
		gr.query();
		while (gr.next()) {
			gr.setValue('state', 'Ready');
			gr.update();
		}
	},
	
	ajaxFunction_countECCRecords: function() {
		var sysId = this.getParameter("sysparm_sys_id");
		var ga = new GlideAggregate("ecc_queue");
		ga.addQuery("agent_correlator", sysId);
		ga.addAggregate('COUNT');
		ga.query();
		var count = 0;
		if (ga.next())
			count = ga.getAggregate('COUNT');
		var max = gs.getProperty('glide.discovery.timeline.max_entries');
		var answer = count + ',' + max;
		return answer;
	},
	
	ajaxFunction_quickDiscovery: function() {
		var targetIP = this.getParameter("sysparm_target");
		var midserver = this.getParameter("sysparm_agent_name");
		var midSysId = this.getParameter("sysparm_agent_sysId");
		
		var d = new Discovery();
		var statusID = d.discoveryFromIP(targetIP+'', midserver, 'Quick_Discovery');
		
		if (statusID)
			Discovery.throttlingInfoMessage();
		
		session.getUser().setPreference('quick_discovery.ip', targetIP);
		session.getUser().setPreference('quick_discovery.midserver_name', midserver);
		session.getUser().setPreference('quick_discovery.midserver_sysId', midSysId);
		
		return statusID;
	},
	
	ajaxFunction_discoverNow: function() {
		var schedGR = new GlideRecord('discovery_schedule');
		if(!schedGR.get('sys_id', this.getParameter('sysparm_schedule_sysId')))
			return null;
		var disco = new Discovery();
		var discoverType = schedGR.getValue("discover");
		var isCloudDiscovery = (discoverType == "Cloud Resources");
		var statusID = disco.discoverNow(schedGR);
		Discovery.throttlingInfoMessage();
		this.getRootElement().setAttribute("isCloudDiscovery", isCloudDiscovery);
		this.getRootElement().setAttribute("auto_refresh_sub_accounts_and_ldcs", gs.getProperty("glide.discovery.cdu.auto_refresh_sub_accounts_and_ldcs"));
		return statusID;
	},
	
	ajaxFunction_MIDServerFinderByIP: function() {
		var targetIP = this.getParameter("sysparm_target");
		var application = this.getParameter("sysparm_app_name");
		var midSelector = new SNC.MidSelector();
		var midserver = null;
		
		try {
			// As per PRB1317165, we are now checking against application value for selecting MID Server
			midserver = midSelector.selectAnyDegradedOrBetterMidServer(application, [targetIP+''], null) + '';
		} catch (e) {
			gs.log('Unable to find any MID server for ip ' + targetIP + ' with exception ' + e);
		}
		
		return midserver;
	},
	
	ajaxFunction_deletePendingApplications: function() {
		var gr = new GlideRecord("cmdb_ci_appl_pending");
		gr.addNullQuery("classifier");
		gr.deleteMultiple();
	},
	
	ajaxFunction_getStartDate: function() {
		var gdt = new GlideDateTime();
		
		return gdt.getDisplayValueInternal();
	},
	
	ajaxFunction_getEndDate: function() {
		var gdt = new GlideDateTime();
		gdt.addWeeks(1);
		
		return gdt.getDisplayValueInternal();
	},
	
	ajaxFunction_testMidSelection: function() {
		var selector = new CommonMIDServerSelector();
		session.getUser().setPreference('mid_selection_test.ip', this.getParameter('sysparm_target'));
		session.getUser().setPreference('mid_selection_test.app', this.getParameter('sysparm_app_name'));
		session.getUser().setPreference('mid_selection_test.cap', this.getParameter('sysparm_capability'));
		gs.log('parameters mid select ' + this.getParameter('sysparm_target') + ' ' + this.getParameter('sysparm_app_name') + ' ' + this.getParameter('sysparm_capability'));
		return selector.findAgentCandidates(this.getParameter('sysparm_target'), '', this.getParameter('sysparm_app_name'), this.getParameter('sysparm_capability'));
	},	
});
