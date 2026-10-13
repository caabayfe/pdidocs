var DiscoveryCloudConfig = Class.create();
DiscoveryCloudConfig.prototype = {
	initialize: function() {
	},
	
	/*
 	* getting Cloud Discovery Logical Data Center Config Information by scheduleId.
 	* To support cloud discovery master and it's all members accounts.
 	*
 	* @param scheduleId
 	* @return config object, This holds service accounts (master account and all its member accounts), logical data center Information.
 	*/
	
	getConfig: function(scheduleId) {
		var configData = {};
			var is_master_account = false;
			var parent_account = null;
			var member_accounts = [];
			var all_datacenters = false;
			var datacenters=[];
			var service_account = this._getParentScheduleAccount(scheduleId);
			if (!service_account)
				return configData;
			var ldcConfigGR = this._getDiscoveryConfigByServiceAccount(scheduleId, service_account);
		
			if (ldcConfigGR != null) {
				var all_accounts_for_master = (ldcConfigGR.getValue('all_accounts_for_master') == 1);
				if (!ldcConfigGR.getValue('ldc'))
					all_datacenters = true;
				var serviceAccountGR = this._getServiceAccount(service_account); // to get config service account
				var discovery_credentials = serviceAccountGR.getValue('discovery_credentials');
				var service_account_data = {
					sys_id: serviceAccountGR.getUniqueValue() + '',
					name: serviceAccountGR.getValue('name'),
					account_id: serviceAccountGR.getValue('account_id'),
					discovery_credentials: discovery_credentials,
					datacenter_url: serviceAccountGR.getValue('datacenter_url'),
					datacenter_type: serviceAccountGR.getValue('datacenter_type'),
					is_master_account : (serviceAccountGR.getValue('is_master_account') == 1),
					parent_account: serviceAccountGR.getValue('parent_account'),
					is_validated: (serviceAccountGR.getValue('is_validated') == '1'),
					sys_updated_on: serviceAccountGR.getValue('sys_updated_on'),
					organization_id: serviceAccountGR.getValue('organization_id') ? serviceAccountGR.getValue('organization_id') + '' : '',
					exclude_from_discovery: (serviceAccountGR.getValue('exclude_from_discovery') == 1),
					operational: (serviceAccountGR.getValue('operational_status') == 1)
				};
				
				var cloudServiceAccountFormFields = new CloudResourceDiscoveryUtil().getCloudServiceAccountFormFieldsMetadata();
				if (cloudServiceAccountFormFields instanceof Array)
					cloudServiceAccountFormFields.forEach(function(fieldName) {
						service_account_data[fieldName] = serviceAccountGR.getValue(fieldName);
					});

				//should_pull_events only applicable for GCP provider and ITOM pattern verion is equal/greater than 42
				var cloudResourceDiscoveryUtilObj = new CloudResourceDiscoveryUtil();
				var validITOMPatternVersion = cloudResourceDiscoveryUtilObj.checkSupportedPluginVersionInstalled(cloudResourceDiscoveryUtilObj.ITOM_PATTERN_PLUGIN_NAME, cloudResourceDiscoveryUtilObj.GCP_PULL_EVENT_SUPPORT_ITOM_PATTERN_VERSION);
				if (serviceAccountGR.getValue('datacenter_type') == cloudResourceDiscoveryUtilObj.CMDB_CI_GOOGLE_DATACENTER && validITOMPatternVersion)
					service_account_data.should_pull_events = (serviceAccountGR.getValue('should_pull_events') == '1');

				is_master_account = (serviceAccountGR.getValue('is_master_account') == 1);
				
				if (is_master_account == false && discovery_credentials == null) {
					parent_account = serviceAccountGR.getValue('parent_account');  // to get parent account sys_id for member
				}

				if ( (is_master_account == true && !all_accounts_for_master) || (service_account_data.datacenter_type == 'cmdb_ci_google_datacenter' && service_account_data.organization_id)) {
					member_accounts = this._getMemberAccountsBySchedule(service_account,scheduleId, service_account_data);  // to get all member accounts by parent
				}

				if (!all_datacenters)
					datacenters = datacenters.concat(this._getDatacenters(scheduleId, is_master_account, service_account_data)); // to get datacenters
				
				configData = {           // building config object
					service_account: service_account_data,
					is_master_account: is_master_account,
					parent_account: parent_account,
					all_datacenters: all_datacenters,
					all_accounts_for_master: all_accounts_for_master,
					member_accounts:member_accounts,
					datacenters: datacenters,
				};
				return configData;
			}
		},
		
		/* _getDiscoveryConfigBySchedule - purpose: to get Discovery LDC Config info by schedule
 		*
 		*  @param - Schedule Sys_Id
 		*  @return - Cloud discovery config glide record
 		*/
		
		_getDiscoveryConfigBySchedule: function(scheduleId) {
			var ldcConfigGR = new GlideRecord("cmp_discovery_ldc_config");
			ldcConfigGR.addQuery('discovery_schedule', scheduleId);
			ldcConfigGR.query();
			return ldcConfigGR;
		},
		
		/* _getDiscoveryConfigByServiceAccount - purpose: get Discovery LDC Config info by service account
 		*
 		*  @param - Service Account Sys_Id and Schedule Sys_Id
 		*  @return - Cloud discovery config glide record
 		*/
		
		_getDiscoveryConfigByServiceAccount: function(scheduleId, service_account ) {
			var ldcConfigGR = new GlideRecord("cmp_discovery_ldc_config");
			ldcConfigGR.addQuery('discovery_schedule', scheduleId);
			ldcConfigGR.addQuery('service_account', service_account);
			ldcConfigGR.query();
			if (ldcConfigGR.next())
				return ldcConfigGR;
			return null;
		},
		
		/* _getServiceAccount - purpose: to get service accounts info
 		*
 		*  @param - Service Account Id
 		*  @return - Service Account Glide Record
 		*/
		
		_getServiceAccount: function(service_account) {
			var serviceAccountGR = new GlideRecord("cmdb_ci_cloud_service_account");
			if (serviceAccountGR.get(service_account))
				return serviceAccountGR;
			return null;
		},
		
		
		/* _getMemberAccountsBySchedule - purpose: to get all member service accounts
 		*
 		*  @param - Service Account Sys_Id, Schedule Sys_Id and service_account_data
 		*  @return - Member Service Account List
 		*/
		
		_getMemberAccountsBySchedule: function(service_account, scheduleId, service_account_data) {
			var member_accounts = [];
			var serviceAccountGR = new GlideAggregate("cmdb_ci_cloud_service_account");
			var joinGR = serviceAccountGR.addJoinQuery("cmp_discovery_ldc_config", "sys_id", "service_account");
			joinGR.addCondition('discovery_schedule',scheduleId);
			serviceAccountGR.addQuery('is_master_account',0);
			serviceAccountGR.addQuery('exclude_from_discovery', false);
			if (service_account_data && service_account_data.datacenter_type == 'cmdb_ci_google_datacenter' && service_account_data.organization_id)
				serviceAccountGR.addQuery('sys_id', '!=', service_account_data.sys_id );
			serviceAccountGR.query();
			while (serviceAccountGR.next()) {
				member_accounts.push({
					sys_id: serviceAccountGR.getUniqueValue() + '',
					name: serviceAccountGR.getValue('name'),
					account_id: serviceAccountGR.getValue('account_id'),
					discovery_credentials: serviceAccountGR.getValue('discovery_credentials'),
					datacenter_url: serviceAccountGR.getValue('datacenter_url'),
					datacenter_type: serviceAccountGR.getValue('datacenter_type'),
					is_master_account : (serviceAccountGR.getValue('is_master_account') == 1),
					parent_account: serviceAccountGR.getValue('parent_account'),
					is_validated: (serviceAccountGR.getValue('is_validated') == '1'),
					sys_updated_on: serviceAccountGR.getValue('sys_updated_on'),
					organization_id: serviceAccountGR.getValue('organization_id') + '',
					exclude_from_discovery: (serviceAccountGR.getValue('exclude_from_discovery') == 1)
				});
			}
			return member_accounts;
		},
		
		
		/* _getDatacenters - purpose: to get schedule datacenter list
 		*
 		*  @param - Service Account Sys_Id, is_master_account and service_account_data
 		*  @return - Logical Datacenter List
 		*/
		
		_getDatacenters: function(scheduleId, is_master_account, service_account_data) {
			var datacenters = [];
			var datacentergr = new GlideAggregate("cmp_discovery_ldc_config");
			datacentergr.addQuery('discovery_schedule', scheduleId);
            		datacentergr.addQuery('active', true);
			if (is_master_account || ((service_account_data.datacenter_type == 'cmdb_ci_google_datacenter') && service_account_data.organization_id))
				datacentergr.addQuery('service_account', service_account_data.sys_id);	
			datacentergr.groupBy("ldc");
			datacentergr.query();
			while (datacentergr.next()) {
				var ldcgr = new GlideRecord("cmdb_ci_logical_datacenter");
				var sysId = datacentergr.getValue('ldc');
				if (sysId && ldcgr.get('sys_id', sysId)) {
					datacenters.push({
						sys_id: ldcgr.getUniqueValue() + '',
						name: ldcgr.getValue('name'),
						region: ldcgr.getValue('region')
					});
				}
			}
			return datacenters;
		},
	
		_getDatacenterInformation: function(datacenterSysID) {
			var ldcConfigGR = new GlideRecord("cmdb_ci_logical_datacenter");
			if (ldcConfigGR.get(datacenterSysID))
				return {sys_id: ldcConfigGR.getValue('sys_id'),
						name: ldcConfigGR.getValue('name'),
						region: ldcConfigGR.getValue('region'),
						object_id: ldcConfigGR.getValue('object_id')};
			else
				return null;
		},
		
		/* _getParentScheduleAccount - purpose: to get master schedule service account
 		*
 		*  @param - Schedule Sys_Id
 		*  @return - Service Account Sys_Id
 		*/
		
		_getParentScheduleAccount: function(scheduleId) {
			var service_account = null;
			var ldcConfigGR = this._getDiscoveryConfigBySchedule(scheduleId);
			if (ldcConfigGR.next()) {
				var configCount = ldcConfigGR.getRowCount();
				if (configCount > 1) {
					service_account = ldcConfigGR.getValue('service_account');
					
					// Return the service account sys_id for the Normal Cloud Service Accounts for all providers
					var configGR = new GlideRecord("cmp_discovery_ldc_config");
					configGR.addQuery('discovery_schedule', scheduleId);
					configGR.addQuery('service_account', service_account);
					configGR.query();
					if (configGR.getRowCount() == configCount )
						return service_account;
					
					// Return the main service account sys_id for the Cloud Service Accounts following the Master-Member framework for all providers
					var serviceAccountGR = this._getServiceAccount(service_account);
					if (!((serviceAccountGR.getValue('datacenter_type') == 'cmdb_ci_google_datacenter') && serviceAccountGR.getValue('organization_id'))) {
						var is_master_account = (serviceAccountGR.getValue('is_master_account') == 1);
						if (is_master_account)
							return service_account;
						else
							return serviceAccountGR.getValue('parent_account');
					}
					
					// Below check is specific to GCP Cloud Service Account belonging to Organization specifc so the LDC null query glide record count is same
					// as the ldc config records then it means we can pick any account as main account to show in the form of CDU UI.
					var gcpSpecificldcConfig = new GlideRecord("cmp_discovery_ldc_config");
					gcpSpecificldcConfig.addQuery('discovery_schedule', scheduleId);
					gcpSpecificldcConfig.addNullQuery('ldc');
					gcpSpecificldcConfig.query();
					if (gcpSpecificldcConfig.getRowCount() == configCount)
						return service_account;
					
					// Below check is specific to GCP Cloud Service Account belonging to Organization specifc so the LDC not null query glide record exists then
					// it means user has selected All/Few related projects but specific LDCs so we need just take the LDC takes to select as main account to
					// show in the form of CDU UI
					var filteredServiceAccountSysIDs, mainAccount = null, tempCount = 0, obj = {};
					gcpSpecificldcConfig = new GlideRecord("cmp_discovery_ldc_config");
					gcpSpecificldcConfig.addQuery('discovery_schedule', scheduleId);
					gcpSpecificldcConfig.addNotNullQuery('ldc');
					gcpSpecificldcConfig.query();
					while (gcpSpecificldcConfig.next()) {
						if (obj[gcpSpecificldcConfig.getValue('service_account')])
							(obj[gcpSpecificldcConfig.getValue('service_account')]).push(gcpSpecificldcConfig.getValue('ldc'));
						else
							obj[gcpSpecificldcConfig.getValue('service_account')] = [gcpSpecificldcConfig.getValue('ldc')];
					}
					filteredServiceAccountSysIDs = Object.keys(obj);
					for (var i = 0; i < filteredServiceAccountSysIDs.length; i++) {
						var currentServiceAccountSysID = filteredServiceAccountSysIDs[i];
						var currentLDCCountSize = (obj[currentServiceAccountSysID]).length;
						// If any service accounts has more number of LDCs selected then it means thats a proper account and other's might be missing those LDCs
						// so we try to find that proper account to show in the CDU UI.
						if (currentLDCCountSize > tempCount) {
							tempCount = currentLDCCountSize;
							mainAccount = currentServiceAccountSysID;
						}
					}
					return mainAccount;
				}
				
				service_account = ldcConfigGR.getValue('service_account');
			}
			return service_account;
		},
		
		type: 'DiscoveryCloudConfig'
	};
