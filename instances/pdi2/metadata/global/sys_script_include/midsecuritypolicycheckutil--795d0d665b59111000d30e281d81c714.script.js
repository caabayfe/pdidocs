var MIDSecurityPolicyCheckUtil = Class.create();
MIDSecurityPolicyCheckUtil.prototype = {
    initialize: function() {
    },
	
	getMatchMidsWithServiceNowSecPolicy: function(){
		var currentMatchMids = [];
		
		var policyGr = new GlideRecord("mid_cert_check_policy");
		policyGr.addQuery("name", "*.service-now.com");
		policyGr.query();
		
		if(policyGr.hasNext()) {
			policyGr.next();
			
			// Skip if *.servicenow.com is not active
			if(policyGr.getValue("active") == 0) {
				gs.warn("MIDSecurityPolicyCheckUtil.getMatchMidsWithServiceNowSecPolicy:  Skip if *.servicenow.com is not active");
				
				return currentMatchMids;
			}
		} else {
			// skip if the *.servicenow.com does not exist.
			gs.warn("MIDSecurityPolicyCheckUtil.getMatchMidsWithServiceNowSecPolicy: skip if the *.servicenow.com does not exist.");
			
			return currentMatchMids;
		}
		
		var configGr;
		
		// 1st query for ecc_agent with mid.ssl.use.instance.security.policy=true
		configGr = new GlideRecord('ecc_agent_config');
		configGr.addQuery("param_name", "mid.ssl.use.instance.security.policy");
		configGr.addQuery("value", "true");
		configGr.query();
		
		while (configGr.next()) {
			if(configGr.getValue('ecc_agent') != "")
				currentMatchMids.push(configGr.getValue('ecc_agent'));
		}
		gs.debug("MIDSecurityPolicyCheckUtil.getMatchMidsWithServiceNowSecPolicy: after 1st query: mids: " + currentMatchMids);
		
		return currentMatchMids;
	},
	
	getMismatchMidsWithServiceNowSecPolicy: function(){
		var currentMatchMids = [];
		
		var policyGr = new GlideRecord("mid_cert_check_policy");
		policyGr.addQuery("name", "*.service-now.com");
		policyGr.query();
		
		if(policyGr.hasNext()) {
			policyGr.next();
			
			// Skip if *.servicenow.com is not active
			if(policyGr.getValue("active") == 0) {
				gs.warn("MIDSecurityPolicyCheckUtil.getMissMatchMidsWithServiceNowSecPolicy:  Skip if *.servicenow.com is not active");
				
				return currentMatchMids;
			}
		} else {
			// skip if the *.servicenow.com does not exist.
			gs.warn("MIDSecurityPolicyCheckUtil.getMissMatchMidsWithServiceNowSecPolicy: skip if the *.servicenow.com does not exist.");
			
			return currentMatchMids;
		}
			
		var configGr;

		// 1st query for ecc_agent with mid.ssl.use.instance.security.policy=false or config param does not exist
		configGr = new GlideRecord('ecc_agent_config');

		// query result will be sorted by ecc_agent. For example
		// ecc_agent (sys_id)     param_name                                 value
		// sys_id_1               name                                       ecc_agent_1
		// sys_id_1               mid.ssl.use.instance.security.policy.      true
		// sys_id_2               name                                       ecc_agent_2
		// sys_id_3               mid.ssl.use.instance.security.policy.      false
		// sys_id_3               name                                       ecc_agent_3	
		configGr.orderBy("ecc_agent");
		configGr.query();

		var visitedEccAgentName = 'dummy';
		var visitedUseInstanceSecPolicy = true;

		while (configGr.next()) {
				// starting entry for a new ecc agent
				if(visitedEccAgentName != configGr.getValue('ecc_agent')) {

					// if there was no 'mid.ssl.use.instance.security.policy param for the prev ecc agent 
					if(!visitedUseInstanceSecPolicy && visitedEccAgentName != "") {
						currentMatchMids.push(visitedEccAgentName);
					}

					visitedEccAgentName = configGr.getValue('ecc_agent');
					visitedUseInstanceSecPolicy = false;
				}

				if(configGr.getValue('param_name') == 'mid.ssl.use.instance.security.policy') {
					visitedUseInstanceSecPolicy = true;

					if(configGr.getValue('value') == 'false' && visitedEccAgentName != "") {
						currentMatchMids.push(visitedEccAgentName);
					}
				}

				// skip on other params
				if(visitedUseInstanceSecPolicy)
					continue;
		}

		// On the last ecc_agent and there was no 'mid.ssl.use.instance.security.policy param for the prev ecc agent 
		if(!visitedUseInstanceSecPolicy && visitedEccAgentName != "") {
				currentMatchMids.push(visitedEccAgentName);
		}

		gs.debug("MIDSecurityPolicyCheckUtil.getMisMatchMidsWithServiceNowSecPolicy: after 1st query: mids: " + currentMatchMids);		
		
		return currentMatchMids;
	},


    type: 'MIDSecurityPolicyCheckUtil'
};
