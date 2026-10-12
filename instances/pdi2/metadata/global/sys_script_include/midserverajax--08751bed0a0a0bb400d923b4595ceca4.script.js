var MIDServerAjax = Class.create();

MIDServerAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
 
   ajaxFunction_restartMID: function() { 
     var mm = new MIDServerManage();
     mm.restart(this.getParameter('sysparm_agent_name'));
   },

   ajaxFunction_stopMID: function() { 
     var mm = new MIDServerManage();
     mm.stop(this.getParameter('sysparm_agent_name'));
   },
   
   ajaxFunction_grabMIDLog: function() {
     var mm = new MIDServerManage();
     mm.grab_logs(this.getParameter('sysparm_agent_name'), this.getParameter('sysparm_log_files'), this.getParameter('sysparm_is_dedicated_selection'));
   },
   
   ajaxFunction_upgradeMID: function() {
     var mm = new MIDServerManage();
     mm.upgrade(this.getParameter('sysparm_agent_name'));
   },

   ajaxFunction_getTroubleshootingFileList: function() {
        var mm = new MIDServerManage();
        var sys_id = mm.getTroubleshootingFileList(this.getParameter('sysparm_agent_name'));
        return sys_id;
    },

    ajaxFunction_threaddump: function() {
        var mm = new MIDServerManage();
        return mm.threaddump(this.getParameter('sysparm_agent_name'));
    },

    ajaxFunction_grabSettings: function() {
        var mm = new MIDServerManage();
        return mm.grab_settings(this.getParameter('sysparm_agent_name'));
    },

   ajaxFunction_testProbe: function() {
     var mm = new MIDServerManage();
     var sys_id = mm.test_probe(
                  this.getParameter('sysparm_agent_name'),
                  this.getParameter('sysparm_probe_id'),
                  this.getParameter('sysparm_topic'),
                  this.getParameter('sysparm_ename'),
                  this.getParameter('sysparm_source'),
                  this.getParameter('sysparm_skip_sensor'),
                  this.getParameter('sysparm_port'));

	 session.getUser().setPreference('test_probe.ip', this.getParameter('sysparm_source'));
	 session.getUser().setPreference('test_probe.port', this.getParameter('sysparm_port')); 
	 session.getUser().setPreference('test_probe.midserver_name', this.getParameter('sysparm_agent_name'));
	 session.getUser().setPreference('test_probe.midserver_sysId', this.getParameter('sysparm_agent_sysId'));
	 session.getUser().setPreference('test_probe.skip_sensor', this.getParameter('sysparm_skip_sensor'));
   
	 return sys_id;
   },
	
   ajaxFunction_addRelatedList: function() { 
     var arl = new AddStandardCIRelatedLists(); 
     arl.process();    
   },

	ajaxFunction_hasBehavior: function() {
		var mm = new MIDServerManage();
		return mm.hasBehavior(this.getParameter('sysparm_agent')+'');
	},

	ajaxFunction_validateMID: function() {
		var mm = new MIDServerManage();
		var agent = this.getParameter('sysparm_agent')+'';
		var gr = new GlideRecord("ecc_agent");
		if (agent)
			gr.get('sys_id', agent);
		if (gr && JSUtil.getBooleanValue(gr, 'validated') !== true)
			mm.validate(gr.name);
	},
	
	ajaxFunction_setSelectionCriteria: function() {
		var mm = new MIDServerManage();
		mm.setSelectionCriteria(
			this.getParameter('sysparm_agent')+'',
			this.getParameter('sysparm_capabilities')+'',
			this.getParameter('sysparm_applications')+'',
			this.getParameter('sysparm_ip_ranges')+'');
	},

	ajaxFunction_getSlushValues: function() {
		var agentGr = new GlideRecord("ecc_agent");
		agentGr.addQuery("status", "Up");
		agentGr.addQuery("validated", true);
		agentGr.query();
		while (agentGr.next()) {
			var payload = this.newItem('agent');
			payload.setAttribute('name', agentGr.getValue("name"));
			payload.setAttribute('sys_id', agentGr.getValue("sys_id"));
		}
	},

	ajaxFunction_triggerSubnetDiscovery: function() {
		var agents = this.getParameter('sysparm_agents')+'';
		var statusGr = new GlideRecord("automation_status_set");
		statusGr.initialize();
		statusGr.mid_server_list = agents;
		statusGr.do_subnet_discovery = true;
		statusGr.do_range_assign = true;
		return statusGr.insert();
	},
	
	ajaxFunction_syncProfileToMids: function() {
		var profileId = this.getParameter('sysparm_profile_id')+'';
		var syncStrategy = this.getParameter('sysparm_sync_strategy')+'';
		var restartAllowed = this.getParameter('sysparm_restart_allowed');
		var performWrapperSync = this.getParameter('sysparm_perform_wrapper_sync');

		var msf = new MIDServerProfile();
		msf.syncProfileToMids(profileId, syncStrategy);

		if (performWrapperSync) {
			var gr = new GlideRecord("ecc_agent");
			gr.addQuery("profile_id", profileId);
			gr.query();

			var mid_list = [];

			while(gr.next()) {
				mid_list.push(gr.getValue('name'));
			}

			if(!restartAllowed)
				restartAllowed = false;

			gs.info(JSON.stringify(new MIDWrapperConfigOperations().syncWithProfile(mid_list, syncStrategy, restartAllowed)));
		}
	},

	ajaxFunction_getMidsfromProfile: function() {
		var profileId = this.getParameter('sysparm_profile');
		var midsCount = 0;
		var ga = new GlideAggregate("ecc_agent");
		ga.addQuery("profile_id", profileId);
		ga.addAggregate("COUNT");
		ga.query();
		if (ga.next())
			midsCount = ga.getAggregate("COUNT");
		return midsCount;
	},
	
	ajaxFunction_getInstanceURL: function() {
		return gs.getProperty('glide.servlet.uri');
	}

});
