var CommonMIDServerSelector = Class.create();
CommonMIDServerSelector.prototype = {

	initialize: function() {
		this.overrideValid  = gs.getProperty("glide.ecc_agent.validated.override", "false");
		this.useLegacy      = gs.getProperty("sa.mapping.legacy_mid_selection", "false");
		this.accMappingMode = parseInt(gs.getProperty('sa.topdown.mapping_with_acc_mode', 0));
		this.reuseMidFromHDSchedule = gs.getProperty('sm.topdown.reuse_mid_from_hd_schedule', 'false') === 'true';
		this.mm = new SNC.MidManager();
		this.cf = new FindMidCapabiltiesByHost();
		this.accUtil = new ServiceMappingACCUtil();

		this.validateMidProperties();
	},

	validateMidProperties: function(){
	    if (this.reuseMidFromHDSchedule && this.accMappingMode == 2)
	        gs.print("Property 'sa.topdown.mapping_with_acc_mode' value is 2 and property 'sm.topdown.reuse_mid_from_hd_schedule' value is true. Those value are conflict, please change one of them");
	},

	isEmpty: function(str) {
		return (!str || 0 === str.length);
	},

	findAgentForDNS: function(midListToExclude, applicationName) {
		if (this.useLegacy == "true")
			return this.findAgentForDNSLegacy(midListToExclude);

		if (this.isEmpty(applicationName))
			applicationName = "ServiceMapping";

		if(midListToExclude){
			midListToExclude = JSON.parse(midListToExclude);
		}
		return this.mm.findMidWithExclusions(applicationName, "", "", true, midListToExclude);
	},

	findAgent: function(target, hostId, applicationName) {
		// First try to pick mid from the relevant agent for the host
		var accGr = this.accUtil.getAgentForHostOrIp(hostId, target);
		if (accGr != null && accGr.mid.status == 'Up' && accGr.mid.validated == 'true' && !gs.nil(accGr.getDisplayValue('mid')))
			return accGr.getDisplayValue('mid');
		// If working in ACC only mode, abort after fail to find MID by ACC
		if (this.accMappingMode == 2) {
			gs.print("CommonMidServerSelector: Failed to find MID by ACC in mode '2' (ACC only), aborting MID selection.");
			return null;
		}
		if (this.useLegacy == "true")
			return this.findAgentLegacy(target, hostId, applicationName);

		return this._findAgentHandler(target, hostId, applicationName);
	},

	_findAgentHandler: function(target, hostId, applicationName) {
		if (this.isEmpty(applicationName))
		    applicationName = "ServiceMapping";

		var capArray = this.isEmpty(hostId) ? [] : this.cf.findMidCapabilties(hostId);
		// If one of the capabilities is Cloud Management, use the CMP API to find the correct MID
		if (capArray) {
			for (var capIndex = 0;capIndex<capArray.length; capIndex++) {
				if (capArray[capIndex] == 'Cloud Management') {
					gs.print("CommonMidServerSelector._findAgentHandler: Cloud Management capability required");
					return this.findMidForCloud(hostId , applicationName);
				}
			}
		}

		if (this.reuseMidFromHDSchedule) {
			var midBySchedule = this._getAgentFromDiscoverySchedule(target, hostId, applicationName, capArray);
			if (midBySchedule)
				return midBySchedule;

			gs.print("CommonMidServerSelector._findAgentHandler: no MID found from HD scheduler. Falling back to IP-based MID selection. host: " + hostId);
		}

		var midByIp = this.mm.findMid(applicationName, target, capArray.toString(), true);
		gs.print("CommonMidServerSelector._findAgentHandler:  MidManager found MID '" + midByIp + "' for host " + hostId + " for IP " + target);
		return midByIp;
	},
	_getAgentFromDiscoverySchedule: function(target, hostId, applicationName, capArray) {
			if (this.isEmpty(hostId)) {
				gs.print("CommonMidServerSelector._getAgentFromDiscoverySchedule: no hostId, cannot find schedule.");
				return null;
			}

			var schedule = DiscoveryScheduleAPI.findScheduleFromCiUsingDeviceHistory(hostId);

			if (!schedule || !schedule.active) {
				gs.print("CommonMidServerSelector._getAgentFromDiscoverySchedule: no active schedule for hostId: " + hostId);
				return null;
			}

			if (schedule.midSelectAuto() || schedule.midSelectBehavior()) {
				gs.print("CommonMidServerSelector._getAgentFromDiscoverySchedule: schedule has mid selection method='auto_select' or 'behavior'. These methods are not supported in this flow. scheduleId: " + schedule.sysID);
				return null;
			}

			var midName = sn_discovery.DiscoveryAPI.getMidServerFromSchedule(schedule.sysID);

			if (midName) {
				gs.print("CommonMidServerSelector._getAgentFromDiscoverySchedule: resolved MID name '" + midName +
					"' from schedule: " + schedule.sysID + ". hostId: " + hostId);
			} else {
				gs.print("CommonMidServerSelector._getAgentFromDiscoverySchedule: no mid for hostId: " + hostId + " via schedule: " + schedule.sysID);
				return null;
			}

        var mid = new GlideQuery('ecc_agent')
            .getBy({
                name: midName
            }, ['sys_id', 'status'])
            .orElse({
                sys_id: null
            });

			if (!mid.sys_id) {
				gs.print("CommonMidServerSelector._getAgentFromDiscoverySchedule: failed to fetch mid record by name: " + midName);
				return null;
			}

			if (String(mid.status).toLowerCase() !== 'up') {
				gs.print("CommonMidServerSelector._getAgentFromDiscoverySchedule: the MID is not in status UP, discarding: " + midName);
				return null;
			}

        var capabilities = capArray.map(function(name) {
            return {
                capability: name
            };
        });

			var midSelector = new SNC.MidSelector();

			try {
				var validatedMid = midSelector.selectMidFromList(
					applicationName,
					[target],
					capabilities,
					null,
					[mid.sys_id]);

				if (validatedMid) {
					gs.print("CommonMidServerSelector._getAgentFromDiscoverySchedule: matched MID: " + midName);
					return midName;
				}
			} catch (e) {
				gs.print("CommonMidServerSelector._getAgentFromDiscoverySchedule: MID doesn't match the criteria: \n" + e);
				return null;
			}
	},

	findAgentCandidates: function(target, hostId, applicationName, cap) {
		if (this.useLegacy == "true"){
			return this.findAgentLegacyTest(target, hostId, applicationName);
		}

		if (this.isEmpty(applicationName))
		    applicationName = "ServiceMapping";

		var capArray = this.isEmpty(cap) ? [] : [cap];
		return this.mm.getMidCandidates(applicationName, target, capArray.toString(), true);

	},

	findAgentForDNSLegacy: function(midListToExclude) {
		var midList = [];
		var gr = this.getEccAgentRecord();
		if(midListToExclude){
			midListToExclude = JSON.parse(midListToExclude);
			gr.addQuery('name', 'NOT IN', midListToExclude);
		}
		gr.query();
		var defaultMidServer = GlideProperties.get("mid.server.sm_default");
		while (gr.next() ) {
			var name = gr.getValue('name');
			if (name == defaultMidServer)
				return defaultMidServer;
			midList.push(name);
		}

		if (midList.length > 0)
			return midList[0];

		return null;
	},

//Now legacy mode must support ALL application and ALL IP range
//MID with ALL ip range is treated as one that has no range, and can serve all ip addresses

	findAgentLegacy: function(target, hostId, applicationName) {
		var applicationId = this.isEmpty(applicationName) ? ' ' : this.getApplicationId(applicationName);
		var	midsForApplication = this.findMidsForApplication(applicationId);

		// If there's at least one MID with an IP range defined limit MID candidates by searching MID by IP ranges and pick one MID randomly  and return it
		if (!this.isValidIPAddress(target)) {
			gs.info("************* Target ip is:" + target +"*************");
			if (target === null) // serverless case
				return this._findAgentHandler(target, hostId, applicationName);
			return null;
		}

		var allIpRangeSysId = this.getALLipRangeSysId();
		var midIdsWithALLrange = this.isEmpty(allIpRangeSysId) ? [] : this.getMidsWithALLipRange(allIpRangeSysId);

		var only_mids_with_ranges = this.findMidsWithIpRange(midIdsWithALLrange);

		var midIdsWithRanges = [];
		var midIdsWithNoRanges = [];
		var gr = this.getEccAgentRecord();
		if (midsForApplication.length > 0)
			gr.addQuery('sys_id', midsForApplication);
		gr.query();

        var midServerRangesDB = SncMIDServerRangesDB;

		while (gr.next()) {
			var agentId = gr.getValue('sys_id');
			if (only_mids_with_ranges) {
				if (midServerRangesDB.inRanges(target, agentId))
					midIdsWithRanges.push(agentId);
			} else {
				if (!this.isEmpty(allIpRangeSysId) && this.isMidHasALLipRange(agentId, allIpRangeSysId))
					midIdsWithNoRanges.push(agentId);
				else if (midServerRangesDB.noRanges(agentId))
					midIdsWithNoRanges.push(agentId);
			}
		}

		if (midIdsWithRanges.length > 0)
			return this.selectRandomMid(midIdsWithRanges);

		// If there is a default MID, return this MID
		var mid = this.findDefaultMid();
		if (mid)
			return mid;

		// If there is no default mid and all the MIDs have no IP ranges, pick one MID randomly
		if (midIdsWithNoRanges.length > 0){
			return this.selectRandomMid(midIdsWithNoRanges);
		}

		return null;

	},

	findAgentLegacyTest: function(target, hostId, applicationName) {

		var applicationId = this.isEmpty(applicationName) ? ' ' : this.getApplicationId(applicationName);
		var	midsForApplication = this.findMidsForApplication(applicationId);

		// If there's at least one MID with an IP range defined limit MID candidates by searching MID by IP ranges and pick one MID randomly  and return it
		if (!this.isValidIPAddress(target))
			return null;

		var allIpRangeSysId = this.getALLipRangeSysId();
		var midIdsWithALLrange = this.isEmpty(allIpRangeSysId) ? [] : this.getMidsWithALLipRange(allIpRangeSysId);

		var only_mids_with_ranges = this.findMidsWithIpRange(midIdsWithALLrange);

		var midIdsWithRanges = [];
		var midIdsWithNoRanges = [];
		var gr = this.getEccAgentRecord();
		if (midsForApplication.length > 0)
			gr.addQuery('sys_id', midsForApplication);
		gr.query();

        var midServerRangesDB = SncMIDServerRangesDB;

		while (gr.next()) {
			var agentId = gr.getValue('sys_id');
			if (only_mids_with_ranges) {
				if (midServerRangesDB.inRanges(target, agentId))
					midIdsWithRanges.push(gr.getValue('name') + " : " + agentId);
			} else {
				if (!this.isEmpty(allIpRangeSysId) && this.isMidHasALLipRange(agentId, allIpRangeSysId))
					midIdsWithNoRanges.push(gr.getValue('name') + " : " + agentId);
				else if (midServerRangesDB.noRanges(agentId))
					midIdsWithNoRanges.push(gr.getValue('name') + " : " + agentId);
			}
		}

		if (midIdsWithRanges.length > 0)
			return this.mm.convertMidCandidatesToJsonMap(midIdsWithRanges);

		// If there is a default MID, return this MID
		var mid = this.findDefaultMid();
		if (mid){
			var midArr = [];
			midArr.push(default_sm_mid + " : " + mid);
			return this.mm.convertMidCandidatesToJsonMap(midIdsWithRanges);
		}

		// If there is no default mid and all the MIDs have no IP ranges, pick one MID randomly
		if (midIdsWithNoRanges.length > 0)
			return this.mm.convertMidCandidatesToJsonMap(midIdsWithNoRanges);

		return null;

	},

	getALLipRangeSysId : function () {
		var gr = new GlideRecord('ecc_agent_ip_range');
		gr.addQuery('name', 'ALL');
		gr.query();
		return gr.next() ? gr.getUniqueValue() : '';
	},

	isMidHasALLipRange : function (agent, allIpRangeSysId) {
		var gr = new GlideRecord('ecc_agent_ip_range_m2m');
		gr.addQuery('agent', agent);
		gr.addQuery('ip_range', allIpRangeSysId);
		gr.query();
		return gr.next();
	},

	getMidsWithALLipRange : function (allIpRangeSysId) {
		var res = [];
		var gr = new GlideRecord('ecc_agent_ip_range_m2m');
		gr.addQuery('ip_range', allIpRangeSysId);
		gr.query();
		while(gr.next())
		    res.push(gr.getValue('agent'));
		return res;
	},

	selectRandomMid: function(midIds) {
		var ms = new Date().getMilliseconds();
		var index = ms % midIds.length;
		var selectedMid = midIds[index];
		var gr = new GlideRecord("ecc_agent");
		gr.addQuery('sys_id', selectedMid);
		gr.query();
		if (gr.next())
			return gr.getValue('name');
	},

	getApplicationId: function(applicationName) {
		if (this.isEmpty(applicationName))
			return null;
		var gr = new GlideRecord('ecc_agent_application');
		gr.addQuery('name', applicationName);
		gr.query();
		if (gr.next())
			return gr.getValue('sys_id');
		return null;
	},

	getALLapplicationSysId : function () {
		var gr = new GlideRecord('ecc_agent_application');
		gr.addQuery('name', 'ALL');
		gr.query();
		return gr.next() ? gr.getUniqueValue() : '';
	},

	isMidAssignedToAllApplication : function(agent, allApplicationSysId) {
		var gr = new GlideRecord('ecc_agent_application_m2m');
		gr.addQuery('agent', agent);
		gr.addQuery('application', allApplicationSysId);
		gr.query();
		return gr.next();
	},

	getMidsWithoutAssignedApps: function() {
		var midsWithAssignedApps = [];
		var midsWithoutAssignedApps = [];
		var allApplicationSysId = this.getALLapplicationSysId();

		var gr = new GlideRecord('ecc_agent_application_m2m');
		gr.query();
		var curMidSysId;
		var curApplication;
		while(gr.next()) {
			curMidSysId = gr.getValue('agent');
			if (!this.isEmpty(allApplicationSysId) && this.isMidAssignedToAllApplication(curMidSysId, allApplicationSysId))
				midsWithoutAssignedApps.push(curMidSysId);
			else
				midsWithAssignedApps.push(curMidSysId);
		}
		gr = this.getEccAgentRecord();
		if (midsWithAssignedApps.length > 0)
			gr.addQuery('sys_id', 'NOT IN', midsWithAssignedApps);
		gr.query();
		while(gr.next())
			midsWithoutAssignedApps.push(gr.getUniqueValue());
		return midsWithoutAssignedApps;
	},

	findMidsForApplication: function(applicationId) {
		var midsForApplication = [];
		var midsWithoutAssignedApplication = this.getMidsWithoutAssignedApps();

		var gr = new GlideRecord('ecc_agent_application_m2m');
		gr.addQuery('application', applicationId);
		gr.query();
		while (gr.next()){
			var agent = gr.getValue('agent');
			midsForApplication.push(agent);
		}

		if (midsForApplication.length == 0)
			midsForApplication = midsWithoutAssignedApplication;

		// ecc_agent table is domain separated so all the mids we find in this table belong to the right domain
		var midsForApplicationForDomain = [];
		gr = this.getEccAgentRecord();
		if (midsForApplication.length > 0)
		    gr.addQuery('sys_id', 'IN' ,midsForApplication);
		gr.query();
		while(gr.next())
			midsForApplicationForDomain.push(gr.getValue('sys_id'));

		return midsForApplicationForDomain;
	},

	findMidsWithIpRange: function(midIdsWithALLrange) {
		var midServers = [];
		// ecc_agent table is domain separated so all the mids we find in this table belong to the right domain
		var gr = this.getEccAgentRecord();
		if (midIdsWithALLrange.length > 0)
			gr.addQuery('sys_id', 'NOT IN', midIdsWithALLrange);
		gr.query();
		while(gr.next()){
			var agent = gr.getValue('sys_id');
			midServers.push(agent);
		}

		gr = new GlideRecord('ecc_agent_ip_range_m2m');
		gr.addQuery('agent', midServers);
		gr.query();
		gr.limit(1);
		if (gr.hasNext())
			return true;
		return false;

	},

	findDefaultMid: function() {
		var defaultMidServer = GlideProperties.get("mid.server.sm_default");
		if (!JSUtil.nil(defaultMidServer)){
			var gr = this.getEccAgentRecord();
			gr.addQuery('name', defaultMidServer);
			gr.query();
			if (gr.next())
				return defaultMidServer;
			return null;
		}
	},

	getEccAgentRecord: function() {
		var gr = new GlideRecord('ecc_agent');
		gr.addQuery('status', 'Up');
		if (this.overrideValid == "false")
			gr.addQuery('validated', true);
		return gr;
	},

	isValidIPAddress: function(ipAddress) {
		var ipAddressUtil = GlideIPAddressUtil;
		if (ipAddressUtil.isValid(ipAddress))
			return true;

		return false;
	},

	// dummy api to be replaced with ldc model api

	isLdcMigrated: function() {
		try {
			return new sn_cmdb_ci_class.LDCMigrationHelper().isNewLdcModel() == true;
		} catch(e) {
			return false;
		}
	},


	/**
	 * Retrieves MID capabilities for a given region and invocation context.
	 * This method encapsulates the capability retrieval logic and maintains immutability.
	 * 
	 * @param {string} region - The region for which to retrieve MID capabilities
	 * @param {Object} invocationContext - The context object containing service account information
	 * @returns {MidCapability[]|null} Array of MID capabilities, or null if retrieval fails
	 * 
	 * @private
	 */
	_getMidCapabilitiesForRegion: function(region, invocationContext) {
		gs.debug("CommonMidServerSelector._getMidCapabilitiesForRegion: Calling CloudMidSelectionApi for region {0}", region);
		
		const cloudMidSelectionApi = new global.CloudMidSelectionApi();
		
		try {
			const midCapabilities = cloudMidSelectionApi.getMidCapabilities(null, region, JSON.stringify(invocationContext));
			
			if (!midCapabilities || midCapabilities.length === 0) {
				gs.warn('No available MID capabilities found by CloudMidSelectionApi.getMidCapabilities for region {0}', region);
				return null;
			}
			
			gs.debug("CommonMidServerSelector._getMidCapabilitiesForRegion: Retrieved {0} MID capabilities for region {1}", midCapabilities.length, region);
			return midCapabilities;
			
		} catch (e) {
			gs.error("CommonMidServerSelector._getMidCapabilitiesForRegion: Error getting MID capabilities for region {0}: {1}", region, e.message);
			return null;
		}
	},

	/**
	 * Retrieves the MID server name from the ecc_agent table using the MID server sys_id.
	 * 
	 * @param {SysId} midServerId
	 * @returns {string | null}
	 * @private
	 */
	_getMidServerName: function(midServerId) {
		const midGr = new GlideRecord('ecc_agent');
		if (!midGr.get(midServerId)) {
			gs.warn('MID server with ID {0} not found in ecc_agent table', midServerId);
			return null;
		}
		gs.debug("CommonMidServerSelector._getMidServerName: Retrieved MID server name {0} for ID {1}", midGr.name, midServerId);
		return midGr.name;
	},

	/**
	* @private
	* @param {object} cmdMidSelector
	* @param {string} applicationName
	* @param {MidCapability[]} midCapabilities
	* @returns {SysId[]}
	*/
	_selectUpMidServersWithFallback: function(cmdMidSelector, applicationName, midCapabilities) {
	    try {
	        return cmdMidSelector.selectUpMidServers(applicationName, null, midCapabilities);
	    } catch (err) {
	        var capabilitiesWithoutValues = midCapabilities.map(function(capability) {
	            return {
	                capability: capability.capability
	            };
	        });
	        return cmdMidSelector.selectUpMidServers(applicationName, null, capabilitiesWithoutValues);
	    }
	},


	/**
	 * @param {SysId} hostId
	 * @param {string} applicationName - The name of the application requiring MID server access
	 * @returns {string|null} The name of the selected MID server, or null if no suitable MID server is found
	 * 
	 * @throws {Error} May throw errors during MID capability retrieval or MID selection process
	 * 
	 */
	findMidForCloud : function(hostId, applicationName) {
		gs.debug("CommonMidServerSelector.findMidForCloud: HostId {0}, Application {1}", hostId, applicationName);
		
		var cmdbGr = new GlideRecord('cmdb_ci');
		if (!cmdbGr.get(hostId)) {
			gs.warn('Host ' + hostId + ' not found in the CMDB');
			return null;
		}
		
		var hostClass = cmdbGr.sys_class_name;
		var ldc;
		if (GlideDBObjectManager.get().isInstanceOf(hostClass,'cmdb_ci_logical_datacenter'))
			ldc = hostId;
		else {
			var relGr = new GlideRecord('cmdb_rel_ci');
			relGr.addQuery('parent', hostId);
			relGr.addQuery('type', '5f985e0ec0a8010e00a9714f2a172815'); // Hosted-on
			relGr.query();
			if (relGr.next())
				ldc = relGr.child;
		}
		
		if (!ldc) {
			gs.warn('Failed to locate the logical datacenter of CI ' + hostId);
			return null;
		}
		
		gs.debug("CommonMidServerSelector.findMidForCloud: found LDC {0}", ldc);
		
		var ldcGr = new GlideRecord('cmdb_ci_logical_datacenter');
		if (!ldcGr.get(ldc)) {
			gs.warn('ldc ' + ldc + ' not found in table cmdb_ci_logical_datacenter');
			return null;
		}

		gs.debug("CommonMidServerSelector.findMidForCloud: LDC {0} is valid", ldc);
		var serviceAccountSysId = '';

		if (this.isLdcMigrated()) {
			serviceAccountSysId = cmdbGr.getValue('cloud_owner');
		} else {
			var relGr = new GlideRecord('cmdb_rel_ci');
			relGr.addQuery('parent', ldc);
			relGr.addQuery('type', '5f985e0ec0a8010e00a9714f2a172815'); // Hosted on:: Hosts
			relGr.query();

			while (relGr.next()) {
				serviceAccountSysId = relGr.getValue('child');
				if (!JSUtil.nil(serviceAccountSysId))
					break;
			}
		}

		var serviceAccountId = '';
		var serviceAccountGr = new GlideRecord('cmdb_ci_cloud_service_account');

		if (serviceAccountGr.get(serviceAccountSysId)) {
			serviceAccountId = serviceAccountGr.getValue('account_id');
		} else {
			gs.warn('Could not find a service account : ' + serviceAccountSysId);
		}

		var invocationContext = {};
		invocationContext['service_account_id'] = serviceAccountId;

		var midCapabilities = this._getMidCapabilitiesForRegion(ldcGr.region + '', invocationContext);
		if (!midCapabilities) {
			return null;
		}

		try {
			var cmdMidSelector = new SNC.MidSelector();
			
			/** @type {SysId[]} */
			var upMidServerIds = this._selectUpMidServersWithFallback(cmdMidSelector, applicationName, midCapabilities);
			
			if (!upMidServerIds || upMidServerIds.length === 0) {
				gs.warn('No UP MID servers found for application {0}', applicationName);
				return null;
			}

	        var selectedMidId = cmdMidSelector.selectMidFromList(applicationName, null, midCapabilities, null, upMidServerIds);
	        if (!selectedMidId) {
	        	gs.warn('No available MID found by MidSelector for application {0}', applicationName);
	                return null;
	        }

	        gs.debug("CommonMidServerSelector.findMidForCloud: Found MID {0}. Verifying...", selectedMidId);
	        var midServerName = this._getMidServerName(selectedMidId);
	        if (!midServerName) {
	                return null;
	        }

	        gs.debug("CommonMidServerSelector.findMidForCloud: Returned MID {0}", midServerName);
	        return midServerName;

	        } catch (e) {
	            gs.error("CommonMidServerSelector.findMidForCloud: Exception occurred during MID selection: " + e.message);
	            return null;
	        }
	    },

	type: 'CommonMIDServerSelector'
};

//#region type definitions
/**
 * @typedef {object} MidCapability
 * @property {string} capability
 * @property {string} [value]
 * 
 * @typedef {string} SysId
 */
//#endregion type definitions
