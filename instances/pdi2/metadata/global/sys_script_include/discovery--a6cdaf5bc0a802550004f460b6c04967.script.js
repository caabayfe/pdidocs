var Discovery = Class.create();

Discovery.throttlingInfoMessage = function() {
    if (gs.getProperty('glide.discovery.throttling.enabled', 'false') == 'true')
        gs.addInfoMessage(gs.getMessage('Discovery sensor throttling is currently enabled'));
};

Discovery.TYPE = {
    ConfigurationItems: 'CIs',
    IpAddresses: 'IPs',
    Networks: 'Nets',
    Service: 'Service',
    Serverless: 'Hostless',
    CloudApplication: 'Cloud',
    CloudResources: 'Cloud Resources',
    Certificates: 'Certificates'
};

Discovery.prototype = {
    initialize: function() {},

    discoveryStartJob: function() {
        if (!this.isValidDiscoverySchedule(current))
            return;

        // LDCs and Sub Accounts Discovery Patterns are triggered via the Script Include - "CloudWizardDiscovery"
        // In order to access the APIs of the Cloud Wizard Script Include, the current logged in (or) schedule's run_as user should have either 'mid_server' or 'discovery_admin' role
        // If none of those roles exists then user is not allowed to access the APIs thus resulting in the error and not creating the Discovery status thereby
        var hasRequiredRole = gs.hasRole('mid_server') || gs.hasRole('discovery_admin');
        if (current.hasOwnProperty('discover') && (current.discover + '' == 'Cloud Resources') && (current.sys_id + '') && hasRequiredRole && new CloudResourceDiscoveryUtil().validateMIDCondition(current.sys_id))
            this._syncAndUpdateLDCsAndSubAccountsForSchedule(current);

        gs.print('**********');
        gs.log('  STARTING DISCOVERY: ' + current.name);
        gs.print('**********');
        this.clearPreviousServiceJobsInStartingState(current, job);
        var sd = new StartDiscovery();
        sd.startFromSchedule(current, job);
    },

    discoverNow: function(scheduleGr) {
        if (!this.isValidDiscoverySchedule(scheduleGr))
            return "";

        // trigger this discovery...
        var jobSysId = SncTriggerSynchronizer.executeNow(scheduleGr);

        // Get the scheduler created discovery status, and update it with proper discover now description and source
        var status = new GlideRecord('discovery_status');
        status.addQuery('scheduler_job', jobSysId);
        var timeoutSeconds = gs.getProperty('glide.discovery.discover_now_timeout', 10);
        // Searches for max of timeoutSeconds seconds.
        for (var attempts = 0; attempts < timeoutSeconds * 4; attempts++) {
            status.query();
            if (status.hasNext())
                break;
            gs.sleep(250);
        }
        if (!status.next())
            return null;
        status.setValue('description', 'Discover Now');
        status.setValue('source', 'Discover_now_schedule');
        status.update();

        var datacenterType = new CloudResourceDiscoveryUtil().fetchDatacenterTypeFromSchedule(scheduleGr.getUniqueValue());
        var usePatternDiscovery = gs.getProperty('sn_cmp.use_pattern_discovery.' + datacenterType, 'true');
        if (usePatternDiscovery.equals('true') && !(datacenterType.equals('cmdb_ci_vcenter_datacenter')))
            this._persistStatusToLDCs(status);

        return status.sys_id;
    },


    _persistStatusToLDCs: function(status) {
        var configData = new DiscoveryCloudConfig().getConfig(status.scheduleID + '');
        var serviceAccountSysId = configData.service_account.sys_id + '';
        var dcType = configData.service_account.datacenter_type + '';
        var ldcSysIds = [];
        if (configData.all_datacenters) {
            var hostedOnRelationSysId = new CloudResourceDiscoveryUtil().getRelTypeId('Hosted on::Hosts');

            var relGR = new GlideRecord('cmdb_rel_ci');
            relGR.addQuery('child', serviceAccountSysId);
            relGR.addQuery('type', hostedOnRelationSysId);
            relGR.query();
            while (relGR.next()) {
                var parentClassName = relGR.parent.sys_class_name;
                if (parentClassName.equals(dcType))
                    ldcSysIds.push(relGR.getValue('parent'));
            }
        } else {
            var datacenterList = configData.datacenters;
            for (var i in datacenterList)
                ldcSysIds.push(datacenterList[i].sys_id + '');
        }

        for (var j in ldcSysIds) {
            var ldcGR = new GlideRecord(dcType);
            ldcGR.get(ldcSysIds[j]);
            ldcGR.discovery_status = status.sysID;
            ldcGR.update();
        }
    },


    /**
     * API meant to get the latest information about the sub-accounts and the LDC information automatically thereby
     * keeping always keeping the information upto date in Cloud Service Account and Provider-specific Datacenter
     * tables.
     * Major goals of this API is to
     * #1 Get and create the LDC config if any new Sub-Account is added in the Cloud
     * #2 Get the LDC information as well in order to sync up with missing or unavailale LDCs and update the LDC Config
     * #3 Delete the invalid LDC config entries
     **/
    _syncAndUpdateLDCsAndSubAccountsForSchedule: function(schedule) {
        var mainServiceAccountSysId, allMembersInformation,
            memberAccs = [],
            midServer = null,
            scheduleName = schedule.name + '',
            scheduleSysID = schedule.sys_id + '',
            scheduleType = schedule.discover + '',
            scheduleAccelratorConfig = schedule.accel_config + '',
            cloudWizardDiscovery = new CloudWizardDiscovery(),
            cloudResourceDiscoveryUtil = new CloudResourceDiscoveryUtil(),
            cloudDiscoveryScheduleConfig = new CloudDiscoveryScheduleConfig();

        try {
            /** Returns information about schedule. Example:
             *	{
             *		"service_account":{ "sys_id":"a1b12b1707fb0010ce5bf1bb4bd300a3", ........... , "datacenter_type":"cmdb_ci_aws_datacenter"},
             *		"is_master_account":true,
             *		"parent_account":null,
             *		"all_datacenters":false,
             *		"all_accounts_for_master":false,
             *		"member_accounts":[
             *			{ "sys_id":"40c1ab1707fb0010ce5bf1bb4bd3004c", ................ , "parent_account":"a1b12b1707fb0010ce5bf1bb4bd300a3" },
             *			{ "sys_id":"c8c1ab1707fb0010ce5bf1bb4bd3004d", .................., "parent_account":"a1b12b1707fb0010ce5bf1bb4bd300a3" }],
             *		"datacenters":[
             *			{ "sys_id":"47d1a35707fb0010ce5bf1bb4bd300fe", "name":"ap-northeast-1", "region":"ap-northeast-1" },
             *			{ "sys_id":"4fd1a35707fb0010ce5bf1bb4bd300fd", "name":"ap-northeast-2", "region":"ap-northeast-2" } ]
             *	}
             **/
            var configData = new DiscoveryCloudConfig().getConfig(scheduleSysID);

            // If no config data is returned
            if (!configData)
                return;

            // If the system property - "glide.discovery.cdu.auto_refresh_sub_accounts_and_ldcs" is not true means
            // user don't want to auto refresh the sub-accounts and LDCs so we just clean up the improper schedule
            // configuration and nothing else
            if (gs.getProperty('glide.discovery.cdu.auto_refresh_sub_accounts_and_ldcs', 'false') != 'true') {
                cleanUpInvalidLDCConfigData(scheduleSysID, configData);
                return;
            }

            mainServiceAccountSysId = configData.service_account.sys_id + '';

            // Lets get the existing selected sub-accounts in the system as per schedule configuration to refresh the LDC
            // information. This way we can take care if user bypasses the LDC discovery for any sub-accounts or new LDCs
            // are applicable for the account
            if (configData.all_accounts_for_master)
                memberAccs = getExistingMemberAccountsInSystem(configData.service_account, scheduleSysID);
            else
                memberAccs = configData.hasOwnProperty('member_accounts') ? configData.member_accounts : memberAccs;

            // We do the LDC refresh for the Master Member Accounts based on the schedule configuration retreived but not
            // for normal accounts because the LDCs for the normal regular accounts can be retrieved on demand by the user
            // via the UI action provided by the CDU UI under the Slush Bucket.
            if (!configData.is_master_account && !configData.all_accounts_for_master && !memberAccs.length)
                return;

            // A check to confirm whether we dealing with Non GCP Org specific account (GCP Cloud Service Account whose
            // Organization_id has some value). The reason why GCP org support is exceptional is cloud service account
            // doesn't align with is_master_account flag instead of that, it uses the organization_id.
            var discoverSubAccounts = true;
            if (!configData.is_master_account && (configData.service_account.datacenter_type != 'cmdb_ci_google_datacenter'))
                discoverSubAccounts = false;

            // If user has selected all accounts for master then it means if any new sub-account is discovered then we need to
            // create an LDC config for it also. There by syncing the new accounts automatically for the current discovery
            // schedule. We support related projects for GCP as well but making sure that current main service account belongs
            // to an organization.
            if ((configData.all_accounts_for_master && discoverSubAccounts) || (configData.service_account.datacenter_type == 'cmdb_ci_google_datacenter' && configData.all_accounts_for_master && (configData.service_account.organization_id + '' || configData.service_account.is_master_account))) {

                // Refresh the sub-accounts information to get the latest ones if anything added recently
                midServer = cloudResourceDiscoveryUtil.getSelectedMidFromSchedule(scheduleSysID);
                var statusId = cloudWizardDiscovery.refreshMemberAccounts(mainServiceAccountSysId, midServer, scheduleName);
                if (!statusId)
                    return;
                var statusResult = waitAndGetDiscoveryResult(String(statusId));

                // If pattern failed to retrieve sub accounts for some reason then let's not disturb the existing LDC config
                if (!statusResult.hasOwnProperty('ci_list') || statusResult.state == 'processing' || (statusResult.ci_list).length == 0)
                    return;

                allMembersInformation = statusResult.ci_list;
                allMembersInformation = allMembersInformation.filter(function(accObj) {
                    return (accObj.sys_id != mainServiceAccountSysId && !accObj.exclude_from_discovery);
                });

                //Mark stale sub-accounts as retired and delete from discovery-schedule by comparing latest sub-accounts and existing ones
                cloudResourceDiscoveryUtil.deleteStaleAccountRecords(memberAccs, allMembersInformation, false, 'sys_id', scheduleSysID);

                // Get all member accounts existing in the system and compare with newly discovered sub accounts if any new
                // member account(s) added
                var existingSubAccountsSysIDs = [];
                memberAccs.forEach(function(acc) {
                    existingSubAccountsSysIDs.push(acc.sys_id ? acc.sys_id : acc.sysId);
                });
                allMembersInformation = allMembersInformation.filter(function(accObj) {
                    return (existingSubAccountsSysIDs.indexOf(accObj.sys_id) == -1);
                });

                allMembersInformation.forEach(function(accObj) {
                    //If old stale account is rediscovered again, first mark them installed
                    cloudResourceDiscoveryUtil.markOldStaleInstalled(accObj, 'sys_id');
                    midServer = cloudResourceDiscoveryUtil.getSelectedMidFromSchedule(scheduleSysID);
                    var dcStatusId = cloudWizardDiscovery.refreshDatacenters(accObj.sys_id, midServer, [accObj.sys_id], scheduleName);
                    waitAndGetDiscoveryResult(dcStatusId);

                    // For the newer sub accounts discovered so we need to create the LDC config accordingly
                    if (configData.all_datacenters)
                        saveCloudDiscoveryLDCConfig(accObj.sys_id, scheduleSysID, '', configData.all_accounts_for_master);
                    else {
                        for (var ldc in configData.datacenters)
                            saveCloudDiscoveryLDCConfig(accObj.sys_id, scheduleSysID, configData.datacenters[ldc].name, configData.all_accounts_for_master);
                    }
                });
            }

            // Refresh the LDCs for member accounts or related projects (GCP) so that missing or deleted LDCs are restored
            // back in the system.
            midServer = cloudResourceDiscoveryUtil.getSelectedMidFromSchedule(scheduleSysID);
            if (gs.getProperty('cloud.discovery.refresh_datacenter_for_new_member_account', 'false') == 'false'){
                var statusId002 = cloudWizardDiscovery.refreshDatacenters(mainServiceAccountSysId, midServer, memberAccs, scheduleName);
                if (!statusId002)
                    return;
                var statusResult002 = waitAndGetDiscoveryResult(String(statusId002));
                if (!statusResult002.hasOwnProperty('ci_list') || statusResult002.state == 'processing')
                    gs.info('Discovery Status Information for refreshing the LDCs of Existing Accounts via Discovery Status (sys_id) - "' + statusId002 + '" is\t:\t' + JSON.stringify(statusResult002));
            }

            // As above, we refreshed the datacenters, we fix the current schedule configuration by mapping the missing LDCs
            // of the service accounts associated to the schedule but we do the check if the schedule is configurated to use
            // specific LDCs instead of all LDCs and then decide to modify .
            if (!configData.all_datacenters) {
                var serviceAccountGR = new GlideAggregate("cmdb_ci_cloud_service_account");
                var joinGR = serviceAccountGR.addJoinQuery("cmp_discovery_ldc_config", "sys_id", "service_account");
                joinGR.addCondition('discovery_schedule', scheduleSysID);
                serviceAccountGR.addQuery('is_master_account', 0);
                serviceAccountGR.addQuery('exclude_from_discovery', false);

                // GCP Org Support is a special case because it doesn't align with Master-Member framework available in
                // Cloud Service Account. Instead of that, it's respective related accounts are grouped via organization_id
                // so that's the reason we ignore the sys_id of the schedule's main service account and to look for other
                // GCP service accounts
                if (configData.service_account.datacenter_type == 'cmdb_ci_google_datacenter')
                    serviceAccountGR.addQuery('sys_id', '!=', configData.service_account.sys_id);
                serviceAccountGR.query();

                while (serviceAccountGR.next()) {
                    // we update the LDC config now for each sub account
                    configData.datacenters.forEach(function(ldcObj) {
                        if (!findCloudDiscoveryLDCConfig(serviceAccountGR.getValue('sys_id'), scheduleSysID, ldcObj.name, configData.all_accounts_for_master))
                            saveCloudDiscoveryLDCConfig(serviceAccountGR.getValue('sys_id'), scheduleSysID, ldcObj.name, configData.all_accounts_for_master);
                    });
                }
            }

            // By this point we've upgraded the LDC config for both existing cloud service account and newer accounts as
            // well, if discovered, so we need to delete the invalid LDC config entries.
            cleanUpInvalidLDCConfigData(scheduleSysID, configData);
        } catch (e) {
            return;
        }

        function getExistingMemberAccountsInSystem(serviceAccountInfo, scheduleSysID) {
            var existingMemberAccountsInSystem = [];
            // Making join with ldc config table to get the schedule data otherwise if the same account has two schedule it will not update the second schedule
            var serviceAccountGR = new GlideRecord('cmp_discovery_ldc_config');
            serviceAccountGR.addQuery('discovery_schedule', scheduleSysID);
            var joinGR = serviceAccountGR.addJoinQuery("cmdb_ci_cloud_service_account", "service_account", "sys_id");
            joinGR.addCondition('is_master_account', 0);
            joinGR.addCondition('exclude_from_discovery', false);
            if (serviceAccountInfo.datacenter_type == 'cmdb_ci_google_datacenter' && serviceAccountInfo.organization_id) {
            	joinGR.addCondition('organization_id', serviceAccountInfo.organization_id);
            	joinGR.addCondition('sys_id', '!=', serviceAccountInfo.sys_id + '');
            } else {
            	joinGR.addCondition('parent_account', serviceAccountInfo.sys_id + '');
            }
            serviceAccountGR.query();
            while (serviceAccountGR.next())
                existingMemberAccountsInSystem.push({
                    'sys_id': serviceAccountGR.getValue('service_account')
                });
            return existingMemberAccountsInSystem;
        }

        function waitAndGetDiscoveryResult(statusId) {
            var retries = 0;
            var resultObj = cloudWizardDiscovery.getDiscoveryResult(statusId);
            while (resultObj.state == 'processing' && retries < 30) {
                gs.sleep(15000); // Sleep 15 Secs
                resultObj = cloudWizardDiscovery.getDiscoveryResult(statusId);
                retries++;
            }
            return resultObj;
        }

        function findCloudDiscoveryLDCConfig(service_account, scheduleId, ldc, all_accounts_for_master) {
            var ldcId = cloudResourceDiscoveryUtil.getLogicalDatacentersByNameAndServiceAccount(service_account, ldc);
            var gr = new GlideRecord('cmp_discovery_ldc_config');
            gr.addQuery('service_account', service_account);
            gr.addQuery('discovery_schedule', scheduleId);
            gr.addQuery('ldc', ldcId);
            gr.addQuery('all_accounts_for_master', all_accounts_for_master);
            gr.query();
            return gr.next();
        }

        function saveCloudDiscoveryLDCConfig(service_account, scheduleId, ldc, all_accounts_for_master) {
            var ldcId = "";
            if (JSUtil.notNil(ldc))
                ldcId = cloudResourceDiscoveryUtil.getLogicalDatacentersByNameAndServiceAccount(service_account, ldc);
            var gr = new GlideRecord('cmp_discovery_ldc_config');
            gr.initialize();
            gr.setValue('service_account', service_account);
            gr.setValue('discovery_schedule', scheduleId);
            if (JSUtil.notNil(ldcId))
                gr.setValue('ldc', ldcId);
            if (JSUtil.notNil(all_accounts_for_master))
                gr.setValue('all_accounts_for_master', all_accounts_for_master);
            return gr.insert();
        }

        function cleanUpInvalidLDCConfigData(scheduleSysID, scheduleConfigData) {
            var gr = new GlideRecord('cmp_discovery_ldc_config');
            gr.addQuery('discovery_schedule', scheduleSysID);
            gr.addQuery('service_account.is_master_account', 0);
            gr.addQuery('all_accounts_for_master', scheduleConfigData.all_accounts_for_master);
            (scheduleConfigData.all_datacenters) ? gr.addNotNullQuery('ldc'): gr.addNullQuery('ldc');
            gr.query();
            gr.deleteMultiple();
        }
    },

    isValidDiscoverySchedule: function(schedule) {
        var title = 'Discovery schedule ' + schedule.name + ' is aborted';

        //Adding check for VM and Quick Start Schedules.
        //If an IP schedule has a parent cloud schedule or was created using Discovery Quick Start, then it is valid.
        if (schedule.discover.equals('CIs') && (new CloudResourceDiscoveryUtil().hasParentCloudSchedule(schedule.sys_id) || schedule.quick_start == true))
            return true;

        if (schedule.discover != 'Web Service') {
            if (this.isValidRange(schedule))
                return true;

            if (this.hasZeroRange) {
                this.warnMsg(title + ': There is a Discovery IP Range record using an invalid 0 or 0.0.0.0 netmask. Please address before re-running this schedule.');
                return false;
            }

            if (this.isValidServiceDiscovery(schedule) || this.isValidCloudResources(schedule) || this.isValidUrlCertificate(schedule))
                return true;
        }

        if (this.isValidWebService(schedule))
            return true;

        if (this.isValidPattern(schedule))
            return true;

        this.warnMsg(title + ': No active range or account specified for Discovery');
        return false;
    },

    warnMsg: function(msg) {
        var log = GlideLog;
        log.warn(msg);
    },

    isValidRange: function(schedule) {
        if (!schedule)
            return false;
        // If this is a Service schedule, verify it is valid and return true.
        // This is required in order to trigger "After Discovery" type Service schedules.
        if (this.isValidServiceDiscovery(schedule))
            return true;

        // IPAM auto schedules must have a valid IPAM IP/subnet mapping
        if (this.isValidIPAMSchedule(schedule.sys_id))
            return true;

        // Checking discovery IP ranges
        var gr = new GlideRecord('discovery_range_item');
        gr.addQuery('schedule', schedule.sys_id);
        gr.addQuery('active', 'true');
        gr.query();
        while (gr.next()) {
            if (!this.checkZeroMask(gr))
                return false;
        }

        // No need to check for range set if schedule type is only Basic
        if (schedule.discover == 'Devices')
            return false;

        //Checking discovery range sets
        var hasValidRangeSetItem = false;
        var dsgr = new GlideRecord('discovery_schedule_range');
        dsgr.addQuery('dscheduler', schedule.sys_id);
        dsgr.query();
        while (dsgr.next()) {
            var drgr = new GlideRecord('discovery_range');
            if (dsgr.range)
                drgr.get('sys_id', dsgr.range);
            if (drgr.active == false)
                continue;

            // Look at the range items to see if any of them are active...
            var drigr = new GlideRecord('discovery_range_item');
            drigr.addQuery('parent', dsgr.range);
            drigr.addQuery('active', 'true');
            drigr.query();
            while (drigr.next()) {
                if (!this.checkZeroMask(drigr))
                    return false;
                hasValidRangeSetItem = true;
            }
        }

        // Check if we have any valid discovery_range_item record for this schedule
        if (gr.getRowCount() > 0 || hasValidRangeSetItem)
            return true;
        return false;
    },

    checkZeroMask: function(rangeGr) {
        if (rangeGr.type == 'IP Network' && (rangeGr.netmask == "0" || rangeGr.netmask == "0.0.0.0")) {
            this.hasZeroRange = true;
            return false;
        }
        return true;
    },

    isValidServiceDiscovery: function(schedule) {
        if (schedule.discover != 'Service')
            return false;

        // Either ci_id or ci_type should be populated.
        if (!schedule.ci_id && !schedule.ci_type)
            return false;

        return true;
    },

    /*
     *	This function sets all previous jobs of the current schedule that are in Starting state
     *	to Canceled state in order to allow for a new attempt at running this schedule. If left at Starting state,
     *	new job will be canceled, and schedule will not run again.
     *   If status is stuck in Active state, check if no ECC queue records are being processed, otherwise cancel the job.
     *	@schedule: The discovery_schedule that is about to start.
     *	@job:  The sys_trigger record of the current schedule.
     */
    clearPreviousServiceJobsInStartingState: function(schedule, job) {
        if (schedule.discover == 'Service') {
            var gr = new GlideRecord('discovery_status');
            // if this is not a repeat job, then it was started using the "run now" UI action.
            // in this case we ignore the current job id, which is already in the DB.
            if (JSUtil.nil(job.repeat))
                gr.addQuery('scheduler_job', '!=', job.sys_id);
            gr.addQuery('dscheduler', schedule.sys_id);
            var qc = gr.addQuery('state', 'Starting');
            qc.addOrCondition('state', 'Active');
            gr.query();
            while (gr.next()) {
                if (gr.getValue('state') == 'Starting') {
                    gr.setValue('state', 'Canceled');
                    gr.update();
                    var msg = 'Canceled previously started schedule ' + gr.getValue('number') + ' stuck in Starting state';
                    gs.addErrorMessage(msg);
                }
                // If state is 'Active' check if all of its ECC queue records are in 'processed' or 'error' state
                // otherwise, cancel the job. we use SncDiscoveryCancel because a business rule on discovery_status prevents updating records directly
                // under certain conditions.
                else if (gr.getValue('state') == 'Active') {
                    var eccGr = new GlideRecord('ecc_queue');
                    eccGr.addQuery('agent_correlator', gr.getValue('sys_id'));
                    eccGr.query();
                    var inProgress = 'false';
                    while (eccGr.next()) {
                        if (eccGr.getValue('state') != 'processed' && eccGr.getValue('state') != 'error') {
                            inProgress = 'true';
                            break;
                        }
                    }
                    if (inProgress == 'false') {
                        gs.print('inProgress = ' + inProgress);
                        SncDiscoveryCancel().cancelAll(gr.getUniqueValue());
                        var msg = 'Canceled previously started schedule ' + gr.getValue('number') + ' stuck in Active state';
                        gs.addErrorMessage(msg);
                    }
                }
            }
        }
    },

    isValidWebService: function(schedule) {
        if (!schedule || (schedule.discover != 'Web Service'))
            return false;
        var s = new DiscoverySchedule(schedule);
        return s.valid;
    },

    isValidPattern: function(schedule) {
        if (!schedule)
            return false;
        var lchrGr = new GlideRecord('discovery_pattern_launcher');
        lchrGr.addQuery('schedule', schedule.sys_id);
        lchrGr.query();
        if (!lchrGr.hasNext())
            return false;
        var s = new DiscoverySchedule(schedule);
        return s.valid;
    },

    isValidCloudResources: function(schedule) {
        if (!schedule || schedule.discover != 'Cloud Resources')
            return false;
        var s = new DiscoverySchedule(schedule);
        return s.valid;
    },

    isValidUrlCertificate: function(schedule) {
        if (!schedule || schedule.discover != 'Certificates' || !schedule.isValidField('cert_discovery_type') || schedule.cert_discovery_type != 'url')
            return false;
        var s = new DiscoverySchedule(schedule);
        return s.valid;
    },

    /*
     * Starts a discovery of the CI with the given sysID, returning the sysID of the status record.  Returns null if the
     * CI could not be discovered.
     * @cmdb_ci: The sysID of the CI to be discovered.
     * @source:  Who calls this function (optional)
     * returns:  The sysID of the status record found or created, or null if the CI could not be discovered.
     */
    discoveryFromCI: function(cmdb_ci, source) {
        var ips = this.getIPsInCI(cmdb_ci);
        if (!ips)
            return null;

        var params = this.getScheduleContainingAnyIP(ips, cmdb_ci);
        if (!params)
            return null;

        var sd = new StartDiscovery(source);
        var statusID = sd.startFromIP(params.schedule, params.ip);

        return statusID;
    },

    /*
     * Starts a discovery based on an IP address. If defaultMID is specified, then use it. Otherwise look for it through MID server finder
     * @ip: a single IP address
     * @midserver: name of the MID server (without the mid.server prefix) (mandatory if source argument is not undefined)
     * @source: who runs discovery (optional)
     */
    discoveryFromIP: function(ip, midserver, source) {
        var midserver = midserver;
        var autoSelectMid = false;

        // We've got a MID server name, but we need to verify it.
        if (midserver) {
            var agentCache = new SNC.ECCAgentCache();
            var gr = agentCache.getByName(midserver);

            if (!gr) {
                gs.log("Invalid MID server sys_id " + midserver);
                return;
            } else
                midserver = gr.sys_id + ''; // in case the midserver argument was the name instead of sys_id
        } else {
            try {
                midserver = new SNC.MidSelector().selectAnyMidServer('Discovery', [ip], null);
            } catch (e) {
                gs.log(e);
                return;
            }

            autoSelectMid = true;
        }

        var globalIPExclusion = new GlobalIPExclusionUtil();
        if (SNC.IPAddress.isV4(ip) && globalIPExclusion.isIPExcluded(ip)) {
            var msg = 'Cannot Discover IP address <' + ip + '>, it is part of Global IP Exclusion List';
            gs.addErrorMessage(msg);
            return;
        } else {
            var schedule = new DiscoveryQuickSchedule(ip, midserver, autoSelectMid);

            var sd = new StartDiscovery(source);
            var statusID = sd.startFromIP(schedule);

            return statusID;
        }

    },


    discoveryFromDatacenter: function(datacenterSysId, serviceAccountSysId /* optional */ ) {
        var sd = new StartDiscovery();

        return sd.startCloudDiscoveryFromDatacenter(datacenterSysId, serviceAccountSysId);
    },

    discoveryFromDatacenterWithStatus: function(statusId, datacenterSysId, serviceAccountSysId /* optional */ ) {
        var sd = new StartDiscovery();

        return sd.startCloudDiscoveryFromDatacenterWithStatus(statusId, datacenterSysId, serviceAccountSysId);
    },

    /*
     * Runs a schedule that refreshes the processes and connections for a specified host.
     */
    refreshADM: function(ciId, osType, ip, source) {
        var recentRefreshAttempt = this.recentRefreshAttempt(ciId);
        if (recentRefreshAttempt == 'not_active') {
            gs.log('Recent ADM attempt was found for ' + ip);
            return null;
        } else if (recentRefreshAttempt == null) {
            var schedule = new ADMRefreshSchedule(ip, ciId);
            gs.log('RefreshADM: ' + schedule.name + ' ' + ciId + ' ' + osType + ' ' + ip + ' ' + source);

            var sd = new StartDiscovery(source);
            var statusID = sd.startAdmFromIP(schedule, ciId, osType, ip);
            return statusID;
        } else
            return recentRefreshAttempt;
    },

    /*
     * checks if a recent ADM refresh attempt was made on this host.
     */
    recentRefreshAttempt: function(ciId) {
        var updatedTime = new GlideDateTime(); // current time
        gs.log('update time = ' + updatedTime);
        var hostConnsRelevanceTime = GlideProperties.get("sa.cmdb_tcp_last_refresh_attempt_time_minutes", 1440);
        var timeToSubtract = hostConnsRelevanceTime * 60 * 1000;
        gs.log('timeToSubtract = ' + timeToSubtract);
        updatedTime.subtract(timeToSubtract);
        gs.log('new updateTime = ' + updatedTime);
        var gr = new GlideRecord('discovery_status');
        gr.addQuery('dscheduler', ciId);
        gr.addQuery('sys_updated_on', '>=', updatedTime.getValue());
        gr.orderByDesc('sys_updated_on');
        gr.setLimit(1);
        gr.query();
        if (gr.next()) {
            var state = gr.getValue('state');
            if (state == 'Active')
                return gr.getValue('sys_id');
            else
                return 'not_active';
        }
        return null;
    },

    /*
     * Returns an object with two properties: "schedule" that has a DiscoverySchedule instance for a schedule that contains
     * any IP address in the given array, and "ip" that has the IP address to be discovered. Returns null if no such schedule
     * could be found for any IP.
     */
    getScheduleContainingAnyIP: function(ips, cmdb_ci, dhOnly) {
        var gr, schedule,
            result = DiscoveryScheduleAPI.findScheduleWithIpFromCiUsingDeviceHistory(cmdb_ci, ips);

        if (result)
            return result;

        if (dhOnly)
            return;

        // see if any schedule contains one of these IP addresses...
        gr = new GlideRecord('discovery_schedule');
        gr.addQuery('discover', 'NOT IN', 'Networks,Cloud Resources');
        gr.orderByDesc('active');
        gr.orderByDesc('sys_updated_on');
        gr.query();
        while (gr.next()) {
            schedule = new DiscoverySchedule(gr);
            for (var i = 0; i < ips.length; i++) {
                var ip = ips[i];
                if (schedule.contains(ip)) {
                    return {
                        'ip': ip,
                        'schedule': schedule
                    };
                }
            }
        }
        return null;
    },

    /*
     * Returns an array of IP addresses in the CI with the given sysID.  Returns null if the CI doesn't exist.
     */
    getIPsInCI: function(ciSysId) {
        return DiscoveryFunctions.getIpsForCi(ciSysId);
    },

    // completed gets call when the completed business rule gets called
    // because the discovery_status started == completed
    completed: function() {
        // Check if "discovery.complete" event has been created for this status before
        if (this.checkDiscoveryCompleteEvent())
            return;

        var rl = new GlideSelfCleaningMutex('discovery_complete' + current.sys_id);
        if (rl.get()) {
            // Secondary check for "discovery.complete" event in case this mutex was created prior to the first mutex being completed
            if (this.checkDiscoveryCompleteEvent()) {
                rl.release();
                return;
            }

            gs.print('Discovery completed');

            var dl = new DiscoveryLogger(current.sys_id);
            dl.info('Discovery completed', 'Discovery');

            // Stop aggregating common error API stats
            var errorManager = new SNC.DiscoveryErrorManager();
            errorManager.finishInstance(current.sys_id);

            gs.eventQueue('discovery.complete', current, current.number, current.dscheduler.name);
            rl.release();

        } else {
            gs.log("Unable to lock on to discovery_complete" + current.sys_id);
        }
    },

    _clean: function(table) {
        var gr = new GlideRecord(table);
        gr.deleteMultiple();
    },

    _cleanUsingMD: function(table) {
        var md = new GlideMultipleDelete(table);
        md.execute();
    },

    checkDiscoveryCompleteEvent: function() {
        var gr = new GlideRecord('sysevent');
        gr.addQuery('instance', current.sys_id);
        gr.addQuery('sys_created_on', '>=', current.sys_created_on); // Avoids union of sharded tables
        gr.addQuery('name', 'discovery.complete');
        gr.query();
        return gr.hasNext();
    },

    isValidIPAMSchedule: function(scheduleId) {
        gs.log(' Checking isValidRange for IPAM schedule -' + scheduleId, 'IPAM');

        var gr = new GlideRecord('discovery_ipam_ip_address_mapping');
		if (!gr.isValid())
			return false;

        gr.addQuery('discovery_schedule', scheduleId);
        gr.addNotNullQuery('ip_address');
        gr.addActiveQuery();
        gr.setLimit(1);
        gr.query();

        if (gr.hasNext())
            return true;

        gr = new GlideRecord('discovery_ipam_subnet_mapping');
		if (!gr.isValid())
			return false;

        gr.addQuery('discovery_schedule', scheduleId);
        gr.addNotNullQuery('subnet');
        gr.addActiveQuery();
        gr.setLimit(1);
        gr.query();

        return gr.hasNext();
    },

    type: "Discovery"
};
