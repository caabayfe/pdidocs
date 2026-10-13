var CloudResourceDiscoveryUtil = Class.create();
CloudResourceDiscoveryUtil.prototype = {
    initialize: function() {
        this.CLOUD_RESOURCES = 'Cloud Resources';
        this.CMDB_CI_GOOGLE_DATACENTER = 'cmdb_ci_google_datacenter';
        this.GOOGLE_PROVIDER = gs.getMessage('Google');
        this.GCP_PULL_EVENT_SUPPORT_ITOM_PATTERN_VERSION = '1.0.42';
        this.ITOM_PATTERN_PLUGIN_NAME = 'sn_itom_pattern';
        this.formFieldsValidationFormats = {
            serviceAccURLFormat: "^(?:http(s)?:\\/\\/)?[\\#\\$\\w.-]+(?:\\.[\\#\\$\\w\\.-]+)+[\\#\\$\\w\\-\\._~:/?#[\\]@!\\$&'\\(\\)\\*\\+,;=.]+$",
            serviceAccIdFormat: this.serviceAccIdFormat = {
                aws: '^[0-9]{12}$',
                vmware: '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$',
            }
        };
        this.FORM_FIELD_PREFIX = 'form_field_';
    },

    getCloudServiceAccountFormFieldsMetadata: function() {
        var formFieldsColumnNames = [];
        var gr = new GlideRecord('sys_dictionary');
        gr.addQuery('name', 'cmdb_ci_cloud_service_account');
        gr.addQuery('element', 'STARTSWITH', this.FORM_FIELD_PREFIX);
        gr.query();
        while (gr.next())
            formFieldsColumnNames.push(gr.getValue('element'));
        return formFieldsColumnNames;
    },

    wipeRespectiveIPSchedule: function(ipScheduleSysID) {
        var scheduleGR = new GlideRecord('discovery_schedule');
        if (scheduleGR.get(ipScheduleSysID))
            scheduleGR.deleteRecord();
    },

    checkDiscoveryRunsOfSchedule: function(discoveryScheduleSysId) {
        var discoveryRunGR, gr;
        // Check for any discovery status that is either in Starting or Active State
        discoveryRunGR = new GlideRecord('discovery_status');
        discoveryRunGR.addQuery('dscheduler', discoveryScheduleSysId);
        gr = discoveryRunGR.addQuery('state', 'Starting');
        gr.addOrCondition('state', 'Active');
        discoveryRunGR.query();
        return discoveryRunGR.next();
    },

    getRelTypeId: function(relType) {
        var relTypeGR = new GlideRecord('cmdb_rel_type');
        if (relTypeGR.get('name', relType))
            return relTypeGR.getUniqueValue();
    },

    hasParentCloudSchedule: function(vmScheduleId) {
        var scheduleGR = new GlideRecord('discovery_schedule');
        scheduleGR.addQuery('vm_run', vmScheduleId);
        scheduleGR.addQuery('discover', 'Cloud Resources');
        scheduleGR.query();

        if (scheduleGR.next())
            return true;
    },

    fetchDatacenterTypeFromSchedule: function(discoveryScheduleId) {
        var ldcConfigGR = new GlideRecord('cmp_discovery_ldc_config');
        if (discoveryScheduleId && ldcConfigGR.get('discovery_schedule', discoveryScheduleId)) {
            var serviceAccountGR = new GlideRecord('cmdb_ci_cloud_service_account');

            if (serviceAccountGR.get(ldcConfigGR.service_account)) {
                return serviceAccountGR.datacenter_type;
            }
        }
    },

    fetchSelectedAccountsBySchedule: function(scheduleId) {
        var cloudDiscoveryConfigGlideRecord = new GlideRecord('cmp_discovery_ldc_config'),
            selectedAccounts = [];

        cloudDiscoveryConfigGlideRecord.addQuery('discovery_schedule', scheduleId);
        cloudDiscoveryConfigGlideRecord.addQuery('active', true);
        cloudDiscoveryConfigGlideRecord.query();

        while (cloudDiscoveryConfigGlideRecord.next()) {
            var accountId = (cloudDiscoveryConfigGlideRecord.service_account.account_id ||
                cloudDiscoveryConfigGlideRecord.service_account.object_id) + '';

            if (accountId && (selectedAccounts.indexOf(accountId) == -1))
                selectedAccounts.push(accountId);
        }

        return selectedAccounts;
    },

    fetchSelectedRegionsBySchedule: function(scheduleId) {
        var cloudDiscoveryConfigGlideRecord = new GlideRecord('cmp_discovery_ldc_config'),
            selectedRegions = [];

        cloudDiscoveryConfigGlideRecord.addQuery('discovery_schedule', scheduleId);
        cloudDiscoveryConfigGlideRecord.addQuery('active', true);
        cloudDiscoveryConfigGlideRecord.query();

        while (cloudDiscoveryConfigGlideRecord.next()) {
            var regionName = (cloudDiscoveryConfigGlideRecord.ldc.region || cloudDiscoveryConfigGlideRecord.ldc.name) + '';

            if (regionName && (selectedRegions.indexOf(regionName) == -1))
                selectedRegions.push(regionName);
        }

        return selectedRegions;
    },

    fetchServiceAccountFromSchedule: function(discoveryScheduleId) {
        var ldcConfigGR = new GlideRecord('cmp_discovery_ldc_config');
        if (ldcConfigGR.get('discovery_schedule', discoveryScheduleId)) {
            var serviceAccountGR = new GlideRecord('cmdb_ci_cloud_service_account');

            if (serviceAccountGR.get(ldcConfigGR.service_account)) {
                var result = {};

                //if it is master account, we'll be having multiple rows in the ldc config for the selected member and master accounts.
                var isMemberAccount = ((ldcConfigGR.getRowCount() > 1) && (!gs.nil(serviceAccountGR.getValue('parent_account'))));
                result['serviceAccountId'] = (isMemberAccount) ? serviceAccountGR.getValue('parent_account') : serviceAccountGR.getValue('sys_id');
                result['serviceAccountName'] = (isMemberAccount) ? serviceAccountGR.parent_account.name + '' : serviceAccountGR.getValue('name');

                return result;
            }
        }
    },

    isSingleAccountDiscoveredFromSchedule: function(discoveryScheduleId) {
        var ldcConfigGR = new GlideRecord('cmp_discovery_ldc_config');
        if (ldcConfigGR.get('discovery_schedule', discoveryScheduleId)) {
            var serviceAccountGR = new GlideRecord('cmdb_ci_cloud_service_account');
            var msg = '';
            if (serviceAccountGR.get('sys_id', ldcConfigGR.service_account + '')) {
                //if it is master account, we'll be having multiple rows in the ldc config for the selected member and master accounts.
                var isSingleAccount = ((ldcConfigGR.getRowCount() == 1) && (gs.nil(serviceAccountGR.getValue('parent_account'))));
                return isSingleAccount;
            } else {
                msg = 'Service account ' + ldcConfigGR.service_account + ' mentioned for discovery schedule ' + discoveryScheduleId + ' in cmp_discovery_ldc_config does not exist';
            }
        } else {
            msg = 'No record found with discovery schedule ' + discoveryScheduleId + ' in cmp_discovery_ldc_config table';
        }
        throw new Error(msg, {
            cause: msg
        });
    },

    getServiceAccountDetailsById: function(serviceAccountId) {
        if (serviceAccountId) {
            var serviceAccountGlideRecord = new GlideRecord('cmdb_ci_cloud_service_account');

            if (serviceAccountGlideRecord.get(serviceAccountId)) {
                return {
                    accountId: serviceAccountGlideRecord.account_id + '',
                    credentialSysId: serviceAccountGlideRecord.discovery_credentials + '',
                    datacenterType: serviceAccountGlideRecord.datacenter_type + '',
                    objectId: serviceAccountGlideRecord.object_id + '',
                    name: serviceAccountGlideRecord.name + '',
                    datacenterURL: serviceAccountGlideRecord.datacenter_url + '',
                    isMasterAccount: serviceAccountGlideRecord.is_master_account + ''
                };
            }
        }

        return null;
    },

    fetchConfiguredServiceAccountDetailsBySchedule: function(scheduleId) {
        var cloudDiscoveryConfigGlideRecord = new GlideAggregate('cmp_discovery_ldc_config');

        cloudDiscoveryConfigGlideRecord.addQuery('discovery_schedule', scheduleId);
        cloudDiscoveryConfigGlideRecord.addQuery('active', true);
        cloudDiscoveryConfigGlideRecord.addNotNullQuery('service_account');
        cloudDiscoveryConfigGlideRecord.groupBy('service_account');
        cloudDiscoveryConfigGlideRecord.query();

        if (!cloudDiscoveryConfigGlideRecord.hasNext())
            return null;
        cloudDiscoveryConfigGlideRecord.next();

        // If we have 1 result, just get the account found
        // It doesn't matter if it is master\member
        if (cloudDiscoveryConfigGlideRecord.getRowCount() == 1)
            return this.getServiceAccountDetailsById(cloudDiscoveryConfigGlideRecord.service_account + '');

        // More than 1 record - Check for a master account field
        var isMasterAccount = cloudDiscoveryConfigGlideRecord.service_account.is_master_account + '';


        if (isMasterAccount == 'true')
            return this.getServiceAccountDetailsById(cloudDiscoveryConfigGlideRecord.service_account + '');

        /* 
         * If we are in this section of code, it means 1 of the following options:
         *    1. This is a member account
         *    2. The cloud doesn't support master\member account concept and we have multiple records
         *       in 'cmp_discovery_ldc_config', because multiple LDCs were chosen
         */
        var parentAccount = cloudDiscoveryConfigGlideRecord.service_account.parent_account + '';

        if (parentAccount)
            return this.getServiceAccountDetailsById(parentAccount);

        return this.getServiceAccountDetailsById(cloudDiscoveryConfigGlideRecord.service_account + '');
    },

    fetchLabelForServiceAccountColumnInConfigUI: function(columnName, datacenterType) {
        var capiProviderGR = new GlideRecord('sn_capi_provider');
        var discoveryCloudProviderGR = new GlideRecord('discovery_cloud_provider');
        var fieldLabelGR = new GlideRecord('service_account_field_options');

        if (!(capiProviderGR.get('datacenter_class', datacenterType)))
            return 'Account Id';

        fieldLabelGR.addQuery('name', columnName);
        fieldLabelGR.addQuery('provider_type.provider', capiProviderGR.getValue('name'));
        fieldLabelGR.query();
        return fieldLabelGR.next() ? fieldLabelGR.getValue('label') : 'Account Id';
    },

    persistDiscoveryStatusToLDC: function(serviceAccountId, ldcId, discoveryStatusId) {
        var serviceAccountGR = this.getServiceAccount(serviceAccountId);
        var ldcGR = new GlideRecord(serviceAccountGR.datacenter_type);
        ldcGR.get(ldcId);
        ldcGR.discovery_status = discoveryStatusId;
        ldcGR.update();
    },

    fetchIPFromURL: function(url) {
        var ipAddress;
        if (url.indexOf("://") > -1) {
            ipAddress = url.split('/')[2];
        } else {
            ipAddress = url.split('/')[0];
        }
        return ipAddress;
    },

    getProviderUseCloudPatternProperty: function(service_account_sys_id) {
        var serviceAccInfo = new CloudDiscoveryScheduleConfig().getServiceAccountDetails(service_account_sys_id + '');
        var providerClass = serviceAccInfo.datacenterClass;

        //We don't have provider specific property for VMWare as it is CAPI always
        if (providerClass.equals('cmdb_ci_vcenter_datacenter'))
            return false;

        return gs.getProperty('sn_cmp.use_pattern_discovery.' + providerClass, 'true').equals('true');
    },

    getServiceAccount: function(service_account) {
        var serviceAccountGR = new GlideRecord('cmdb_ci_cloud_service_account');
        if (serviceAccountGR.get(service_account))
            return serviceAccountGR;
        return null;
    },

    getSelectedMidFromSchedule: function(scheduleId) {
        var midServer = '';
        if (!scheduleId)
            return midServer;
        var discoveryScheduleGR = new GlideRecord('discovery_schedule');
        if (discoveryScheduleGR.get(scheduleId)) {
            var midSelectionMethod = discoveryScheduleGR.mid_select_method;
            if ('specific_mid' == midSelectionMethod)
                midServer = discoveryScheduleGR.mid_server.name;
            else if ('specific_cluster' == midSelectionMethod) {
                var gr = new GlideRecord('ecc_agent_cluster_member_m2m');
                gr.addQuery("cluster", discoveryScheduleGR.mid_cluster + '');
                gr.addQuery("agent.status", "up");
                gr.addQuery("agent.validated", "true");
                gr.query();
                var random = Math.floor((Math.random() * gr.getRowCount()) + 1);
                while (random-- && gr.next())
                    midServer = gr.agent.name + '';
            }
        }
        return midServer;
    },

    getRandomMidFromCluster: function(midClusterSysId) {
        var midServer = '';
        if (!midClusterSysId)
            return midServer;
        var gr = new GlideRecord('ecc_agent_cluster_member_m2m');
        gr.addQuery("cluster", midClusterSysId);
        gr.addQuery("agent.status", "up");
        gr.addQuery("agent.validated", "true");
        gr.query();
        var random = Math.floor((Math.random() * gr.getRowCount()) + 1);
        while (random-- && gr.next())
            midServer = gr.agent.name + '';

        return midServer;
    },

    /**
    	This method is used in Cloud Discovery Scheduled Job. It validates that a desired MID is avaiable for Discovery or Not
    */
    validateMIDCondition: function(scheduleId) {
        if (!scheduleId)
            return false;
        var discoveryScheduleGR = new GlideRecord('discovery_schedule');
        if (discoveryScheduleGR.get(scheduleId)) {
            var midSelectionMethod = discoveryScheduleGR.mid_select_method;
            if ('specific_mid' == midSelectionMethod && !discoveryScheduleGR.mid_server)
                return true;
            else if ('specific_mid' == midSelectionMethod && discoveryScheduleGR.mid_server && discoveryScheduleGR.mid_server.status == "Up")
                return true;
            else if ('specific_cluster' == midSelectionMethod) {
                var gr = new GlideRecord('ecc_agent_cluster_member_m2m');
                gr.addQuery("cluster", discoveryScheduleGR.mid_cluster + '');
                gr.addQuery("agent.status", "up");
                gr.addQuery("agent.validated", "true");
                gr.query();
                // If at least one server is up and validated in the cluster, return true
                return (gr.getRowCount() > 0);
            } else if ('auto_select' == midSelectionMethod) {
                var discoveryConfigGR = new GlideRecord('cmp_discovery_ldc_config');
                discoveryConfigGR.addQuery('discovery_schedule', scheduleId);
                discoveryConfigGR.query();
                if (discoveryConfigGR.next()) {
                    var serviceAccountGR = new GlideRecord('cmdb_ci_cloud_service_account');
                    var serviceAccountId = null;
                    if (serviceAccountGR.get(discoveryConfigGR.getValue('service_account'))) {
                        var datacenter_type = serviceAccountGR.getValue('datacenter_type'); // Getting datacenter_type. Ex. cmdb_ci_aws_datacenter
                        var providerGlideRecord = new GlideRecord('sn_capi_provider');
                        providerGlideRecord.get('datacenter_class', datacenter_type);

                        var provider = providerGlideRecord.getValue('name'); // Get the Provider name

                        var midServerGR = new GlideRecord('ecc_agent');
                        midServerGR.addQuery('status', 'up');
                        midServerGR.addQuery('validated', 'true');
                        midServerGR.query();

                        var midServerFound = false;
                        while (midServerGR.next()) {
                            var capabilityGR = new GlideRecord('ecc_agent_capability_m2m');
                            capabilityGR.addQuery('agent', midServerGR.getValue('sys_id'));
                            capabilityGR.addQuery('capability.capability', 'IN', provider + ',ALL,Cloud Management');
                            capabilityGR.query();

                            if (capabilityGR.getRowCount() > 0) {
                                midServerFound = true;
                                break;
                            }
                        }
                        return midServerFound;
                    }
                }
            }
        }
        return false;
    },

    getServiceAccountByAccountID: function(service_account_id) {
        var serviceAccountGR = new GlideRecord('cmdb_ci_cloud_service_account');
        if (serviceAccountGR.get('account_id', service_account_id))
            return serviceAccountGR;
        return null;
    },

    getChildServiceAccountsByParentsAccountID: function(parent_service_account_id) {
        var serviceAccountGR = this.getServiceAccountByAccountID(parent_service_account_id);
        if (serviceAccountGR.getValue('datacenter_type') == 'cmdb_ci_google_datacenter' && serviceAccountGR.getValue('organization_id'))
            return this.getChildServiceAccountsByOrganizationID(serviceAccountGR.getValue('organization_id'), serviceAccountGR.getUniqueValue());
        else
            return this.getChildServiceAccountsByParentsSysID(serviceAccountGR.getUniqueValue());
    },

    getChildServiceAccountsByParentsSysID: function(parent_service_account_sys_id) {
        var serviceAccountGR = new GlideRecord('cmdb_ci_cloud_service_account');
        serviceAccountGR.addQuery('parent_account', parent_service_account_sys_id);
        serviceAccountGR.addQuery('exclude_from_discovery', false);
        serviceAccountGR.query();
        if (serviceAccountGR.getRowCount() > 0)
            return serviceAccountGR;
        return null;
    },

    getChildServiceAccountsByOrganizationID: function(organization_id, parent_service_account_sys_id) {
        var serviceAccountGR = new GlideRecord('cmdb_ci_cloud_service_account');
        serviceAccountGR.addQuery('organization_id', organization_id);
        serviceAccountGR.addQuery('sys_id', '!=', parent_service_account_sys_id);
        serviceAccountGR.addQuery('exclude_from_discovery', false);
        serviceAccountGR.query();
        if (serviceAccountGR.getRowCount() > 0)
            return serviceAccountGR;
        return null;
    },

    getCloudScheduleRecordByName: function(scheduleName, scheduleId) {
        var scheduleGlideRecord = new GlideRecord('discovery_schedule');
        if (JSUtil.notNil(scheduleName))
            scheduleGlideRecord.addQuery('name', scheduleName);
        if (JSUtil.notNil(scheduleId))
            scheduleGlideRecord.addQuery('sys_id', '!=', scheduleId);
        scheduleGlideRecord.addQuery('discover', this.CLOUD_RESOURCES);
        scheduleGlideRecord.query();

        if (scheduleGlideRecord.next())
            return scheduleGlideRecord;

        return null;
    },

    getAcceleratorConfigRecord: function(sys_id) {
        var accelGlideRecord = new GlideRecord('discovery_accel_config');
        if (accelGlideRecord.get(sys_id))
            return accelGlideRecord;
        return null;
    },

    getProviderByDatacenterType: function(datacenterType) {
        var capiProviderMapGlideRecord = new GlideRecord('sn_capi_provider');
        capiProviderMapGlideRecord.addQuery('datacenter_class', datacenterType);
        capiProviderMapGlideRecord.setLimit(1);
        capiProviderMapGlideRecord.query();

        if (capiProviderMapGlideRecord.next())
            return capiProviderMapGlideRecord.name + '';

        return '';
    },

    getProviderByServiceAccount: function(serviceAccountId) {
        var serviceAccountGR = this.getServiceAccount(serviceAccountId);
        var datacenter_type = serviceAccountGR.getValue('datacenter_type');
        var providerGlideRecord = new GlideRecord('sn_capi_provider');
        if (providerGlideRecord.get('datacenter_class', datacenter_type))
            return providerGlideRecord.getValue('name');
        return null;
    },

    getCloudScheduleRecord: function(scheduleId) {
        var scheduleGlideRecord = new GlideRecord('discovery_schedule');
        if (scheduleGlideRecord.get(scheduleId))
            return scheduleGlideRecord;
        return null;
    },

    getLogicalDatacentersByNameAndServiceAccount: function(serviceAccount, name) {
        var ldc = "";
        var accountGR = new GlideRecord('cmdb_ci_cloud_service_account');
        if (accountGR.get(serviceAccount)) {
            var ldcGR = new GlideRecord('cmdb_ci_logical_datacenter');
            ldcGR.addQuery("name", name);
            var relGR = ldcGR.addJoinQuery('cmdb_rel_ci', 'sys_id', 'parent');
            relGR.addCondition('child', serviceAccount);
            relGR.addCondition('type', '5f985e0ec0a8010e00a9714f2a172815'); //sysId of Hosts::Hosted On
            ldcGR.query();
            if (ldcGR.next())
                ldc = ldcGR.getUniqueValue();
        }
        return ldc;
    },

    getDiscoveryStatusNumber: function(statusId) {
        var statusGR = new GlideRecord('discovery_status');
        statusGR.get(statusId);
        return statusGR.number;
    },

    queryRelCIBasedOnChild: function(childSysId, relationName, vmGR) {
        var relGR = vmGR.addJoinQuery('cmdb_rel_ci', 'sys_id', 'parent');
        relGR.addCondition('child', childSysId);
        relGR.addCondition('type', this.getRelTypeId(relationName));
    },

    queryRelCIBasedOnParent: function(parentSysId, relationName, vmGR) {
        var relGR = vmGR.addJoinQuery('cmdb_rel_ci', 'sys_id', 'child');
        relGR.addCondition('parent', parentSysId);
        relGR.addCondition('type', this.getRelTypeId(relationName));
    },
    /**
      Checking that plugin is installed in the store app OR sytem plugin table(e.g ITOM pattern)
      return plugin version, if it's installed
    **/
    getPluginVersion: function(pluginName) {
        var grObject = this.findPluginInstalled(pluginName);
        if (JSUtil.notNil(grObject))
            return grObject.getValue('version') + '';
        return null;
    },

    /**
      Checking that plugin installed in the store app OR sytem plugin table
    **/
    pluginInstalled: function(pluginName) {
        if (JSUtil.notNil(this.findPluginInstalled(pluginName)))
            return true;
        return false;
    },

    findPluginInstalled: function(pluginName) {
        var storeAppPluginGR = new GlideRecord('sys_store_app');
        if (JSUtil.notNil(pluginName)) {
            storeAppPluginGR.addQuery('scope', pluginName);
            storeAppPluginGR.query();

            if (storeAppPluginGR.next())
                return storeAppPluginGR;
            else {
                var systemPluginGR = new GlideRecord('v_plugin');
                systemPluginGR.addQuery('id', pluginName);
                systemPluginGR.query();

                if (systemPluginGR.next())
                    return systemPluginGR;
            }
        }
        return null;
    },

    //Checking that Supported version is installed/not(ITOM pattern).
    checkSupportedPluginVersionInstalled: function(pluginName, pluginVersion) {
        if (JSUtil.notNil(pluginName) && JSUtil.notNil(pluginVersion)) {
            var itomPatternPluginVersion = this.getPluginVersion(pluginName);
            if (JSUtil.notNil(itomPatternPluginVersion)) {
                var isValidPuginVersion = this.comparePluginVersion(itomPatternPluginVersion, pluginVersion);
                return isValidPuginVersion;
            }
        }
        return false;
    },

    //Fetching the latest version plugin
    getLatestReleasedPluginInfo: function(pluginName) {
        var appVersionPluginGR = new GlideRecord('sys_app_version');
        appVersionPluginGR.addQuery('scope', pluginName);
        appVersionPluginGR.addQuery('language', 'en');
        appVersionPluginGR.orderByDesc('publish_date');
        appVersionPluginGR.setLimit(1);
        appVersionPluginGR.query();

        return (appVersionPluginGR.next()) ? appVersionPluginGR : null;
    },

    //To display an upgrade message in the discovery home page if a new version is available for a plugin and an install message if the plugin is not installed.
    upgradeMessage: function() {
        var upgradeStoreAppList = [],
            installStoreAppList = [],
            pluginList = ['sn_disco_certmgmt', 'sn_itom_pattern', 'sn_cmdb_ci_class'];

        for (var pluginIndex = 0; pluginIndex < pluginList.length; pluginIndex++) {
            var installedPluginGR = this.findPluginInstalled(pluginList[pluginIndex]);
            var latestVersionPluginGR = this.getLatestReleasedPluginInfo(pluginList[pluginIndex]);

            if (!latestVersionPluginGR)
                continue;

            if (!installedPluginGR || installedPluginGR.active == false) {
                var latestVersionPluginInfoArray = [latestVersionPluginGR.getValue('name')];
                var storeAppInstallMessage = {
                    "message": gs.getMessage("{0} is not installed. To install the store application", latestVersionPluginInfoArray),
                    "storeAppId": latestVersionPluginGR.getValue('scope')
                };

                installStoreAppList.push(storeAppInstallMessage);

            } else {
                var isLatestVersionAvailable = (installedPluginGR.getValue('version')).localeCompare(latestVersionPluginGR.getValue('version'));

                if (isLatestVersionAvailable) {
                    var installedPluginInfoArray = [installedPluginGR.getValue("name"), installedPluginGR.getValue("version"), latestVersionPluginGR.getValue("version")];
                    var storeAppUpgradeMessage = {
                        "message": gs.getMessage("A new version for {0} is available. Current version is {1} and the new version is {2}. To update the store application", installedPluginInfoArray),
                        "storeAppId": installedPluginGR.getValue("scope")
                    };

                    upgradeStoreAppList.push(storeAppUpgradeMessage);
                }
            }
        }

        return {
            installStoreAppList: installStoreAppList,
            upgradeStoreAppList: upgradeStoreAppList
        };

    },

    /**
    	Checking the current and compare plugin version
    	Return Value: If current plugin version greater than/equal to compare plugin version -> return to true, otherwise its return to false
    	@Arg1: Currently installed plugin version.
    	@Arg2: Compare plugin version. Eg. Few feature would be supported for this plugin version onward.
    **/

    comparePluginVersion: function(currentPluginVersion, comparePluginVersion) {
        var currentPluginVersionArray = currentPluginVersion.split('.');
        var comparePluginVersionArray = comparePluginVersion.split('.');

        //if both array are not equal size => Array extend with zero values
        if (currentPluginVersionArray.length != comparePluginVersionArray.length) {
            while (currentPluginVersionArray.length < comparePluginVersionArray.length) currentPluginVersionArray.push("0");
            while (comparePluginVersionArray.length < currentPluginVersionArray.length) comparePluginVersionArray.push("0");
        }

        for (var i = 0; i < currentPluginVersionArray.length; ++i) {
            if ((currentPluginVersionArray[i] == comparePluginVersionArray[i]) && (i == (currentPluginVersionArray.length - 1)))
                return true;
            else if (currentPluginVersionArray[i] > comparePluginVersionArray[i])
                return true;
        }
        return false;
    },

    getFormFieldsValidationFormats: function() {
        return {
            formFieldsValidationFormats: this.formFieldsValidationFormats
        };
    },

    deleteStaleAccountRecords: function(existingMemberAccs, allMembersInformation, refreshCDU, filterParam, scheduleSysID) {
        //Check for System Property to enable this feature for making stale account retired
        if (!gs.getProperty('glide.discovery.retire_stale_accounts') || gs.getProperty('glide.discovery.retire_stale_accounts', 'false') != 'true')
            return;
        //Mark stale sub-accounts as retired and delete from discovery-schedule by comparing latest sub-accounts and existing ones
        var staleSubAccounts = [];
        staleSubAccounts = existingMemberAccs.filter(function(staleAcc) {
            return !(allMembersInformation.some(function(accObj) {
                return (accObj[filterParam] === staleAcc[filterParam]);
            }));
        });
        staleSubAccounts = staleSubAccounts.map(function(object) {
            return object[filterParam];
        });
        staleSubAccounts = new global.ArrayUtil().unique(staleSubAccounts);
        staleSubAccounts.forEach(function(staleAcc) {
            //Mark SA retired
            var serviceAccountGr = new GlideRecord('cmdb_ci_cloud_service_account');
            serviceAccountGr.addQuery('sys_id', staleAcc);
            serviceAccountGr.query();
            if (serviceAccountGr.next()) {
                serviceAccountGr.setValue('install_status', '7');
                serviceAccountGr.update();
            }

        });
        /**
         * Delete based on scheduleSysID from discovery-schedule [cmp_discovery_ldc_config] only while syncing and updating LDC config ..... delete by querying [cmdb_ci_cloud_service_account]
         * table for Retired account which might be marked by delete strategy or just are stale accounts
         **/
        if (!refreshCDU) {
            var retiredServiceAccount = new GlideRecord('cmdb_ci_cloud_service_account');
            retiredServiceAccount.addQuery('install_status', '7');
            retiredServiceAccount.query();
            while (retiredServiceAccount.next()) {
                var discoveryScheduleGr = new GlideRecord('cmp_discovery_ldc_config');
                discoveryScheduleGr.addQuery('service_account', retiredServiceAccount.sys_id);
                discoveryScheduleGr.addQuery('discovery_schedule', scheduleSysID);
                discoveryScheduleGr.query();
                discoveryScheduleGr.deleteMultiple();
            }
        }
    },
    //If old stale account records are rediscovered again with same sysId, change the install Status to 'Installed' (1)
    markOldStaleInstalled: function(accObj, filterParam) {
        var serviceAccountGR = new GlideRecord('cmdb_ci_cloud_service_account');
        serviceAccountGR.addQuery('sys_id', accObj[filterParam]);
        serviceAccountGR.query();
        if (serviceAccountGR.next()) {
            serviceAccountGR.setValue('install_status', '1');
            serviceAccountGR.update();
        }
    },

    type: 'CloudResourceDiscoveryUtil'
};
