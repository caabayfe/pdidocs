var DiscoveryResultManager = Class.create();
DiscoveryResultManager.prototype = {
	initialize: function() {
		this.MAX_RESULTS = 10; // max # of results to pull for each schedule (sorted desc)
		this.SCHEDULE_WINDOW = 10; // how many schedules to query at a time
		this.DISCOVERY_APP = 'd5069fe9e70332001a310a6103f6a94b';
		this.USE_ERROR_FRAMEWORK = DiscoveryErrorsUtilities.useErrorFramework();
		this.cloudResourceChartInfo = [
			{
				'id': 'awsCloudResourcesTab',
				'tabContentId': 'awsCloudResourcesTabContent',
				'name': gs.getMessage("AWS"),
				'disabled': false,
				'reportSysId': '96603bad3b6500108774cedf34efc480'
			},
			{
				'id': 'azureCloudResourcesTab',
				'tabContentId': 'azureCloudResourcesTabContent',
				'name': gs.getMessage("Azure"),
				'disabled': false,
				'reportSysId': '47d37f213ba500108774cedf34efc4fe'
			},
			{
				'id': 'vmwareCloudResourcesTab',
				'tabContentId': 'vmwareCloudResourcesTabContent',
				'name': gs.getMessage("VMware"),
				'disabled': false,
				'reportSysId': '6d6977253ba500108774cedf34efc48b'
			},
			{
				'id': 'googleCloudResourcesTab',
				'tabContentId': 'googleCloudResourcesTabContent',
				'name': gs.getMessage("Google"),
				'disabled': false,
				'reportSysId': '092321483b5200108774cedf34efc417'
			},
			{
				'id': 'ibmCloudResourcesTab',
				'tabContentId': 'ibmCloudResourcesTabContent',
				'name': gs.getMessage("IBM"),
				'disabled': false,
				'reportSysId': '39e5e5883b5200108774cedf34efc467'
			}
		];
	},

	getInProgressDiscoveries: function() {
		var inProgressDiscoveries = [];
		var statusGr = new GlideRecord("discovery_status");
		statusGr.addQuery('state', 'IN', 'starting,active');
		statusGr.query();

		var scheduleGr = new GlideRecord('discovery_schedule');
		while (statusGr.next()) {
			// make sure the schedule that spawned the status still exists ...
			if (statusGr.dscheduler && scheduleGr.get(statusGr.dscheduler)) {
				// we only care about Configuration Item discoveries
				if (scheduleGr.discover+'' == 'CIs') {
					inProgressDiscoveries.push({
						statusSysId: statusGr.sys_id +'',
						scheduleSysId: scheduleGr.sys_id +'',
						scheduleName: scheduleGr.name +'',
						statusNumber: statusGr.number +'',
						createdOn: statusGr.sys_created_on +'',
						started: statusGr.started.getDisplayValue() +'',
						startedDate: statusGr.started.getValue() +'',
						completed: statusGr.completed.getDisplayValue() +'',
						progress: statusGr.progress +''
					});
				}
			}
		}

		return inProgressDiscoveries;
	},

	// Returns the number of devices that extend cmdb_ci_hardware
	// discovered in the last 30 days
	_getNumDiscoveredDevices: function() {
		var hardwareGr = new GlideRecord('cmdb_ci_hardware');
		hardwareGr.addQuery('last_discovered', '>=', gs.daysAgo(30));
		var srcQry = hardwareGr.addQuery('discovery_source', 'ServiceNow');
		srcQry.addOrCondition('discovery_source', 'CredentiallessDiscovery');
		hardwareGr.query();

		return hardwareGr.getRowCount();
	},

	discoveryRunsExceed: function(scheduleId){
		var statusGr = new GlideRecord('discovery_status');
		statusGr.addQuery('dscheduler',scheduleId);
		statusGr.addQuery('state','Active');
		statusGr.query();
		var maxNumOfDiscRunsPerSchedule = parseInt(gs.getProperty('glide.discovery.max_concurrent_invocations_per_schedule', 3), 10);
		if(statusGr.getRowCount() >= maxNumOfDiscRunsPerSchedule){
			statusGr.next();
			var scheduleName = statusGr.dscheduler.getDisplayValue();
			var message = gs.getMessage("Max limit of discovery runs reached for schedule: {0}",scheduleName);
			return {
				success: true,
				message: message
			};
		}
		return {
			success: false,
		};
	},
	

	runSchedule: function(scheduleId) {
		var result = {};
		var scheduleGr = new GlideRecord("discovery_schedule");
		if (!scheduleGr.get(scheduleId)) {
			result.error = gs.getMessage("Could not find schedule with sys_id: {0}",scheduleId);
			return result;
		}

		var discoveryRunsExceedObj =  this.discoveryRunsExceed(scheduleId);
		if(discoveryRunsExceedObj.success) {
			result.error = discoveryRunsExceedObj.message;
			return result;
		}

		var disco = new Discovery();
		if (!disco.isValidDiscoverySchedule(scheduleGr)) {
			result.error = gs.getMessage("Discovery schedule is not valid - no active range or necessary parameters are specified");
			return result;
		}

		var jobSysId = SncTriggerSynchronizer.executeNow(scheduleGr);

		// The below fix is based on the PRB1325898 and PR #2848 in app-automation repo
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

		result.status = status.getValue('sys_id');
		result.number = status.getValue('number');

		return result;
	},

	//Returns service account list from the cmp_discovery_ldc_config
	//Based on schedule checking from the discovery_schedule
	getServiceAccount: function() {
		var discoverLdcConfigGr = new GlideRecord("cmp_discovery_ldc_config");
		var discoveryScheduleGr = discoverLdcConfigGr.addJoinQuery("discovery_schedule", "discovery_schedule", "sys_id");
		discoverLdcConfigGr.addNotNullQuery('service_account');
		discoverLdcConfigGr.query();
		var serviceAccountList = [];
		while (discoverLdcConfigGr.next()) {
			var serviceAccObj = { sys_id: discoverLdcConfigGr.getValue("service_account") , name: discoverLdcConfigGr.getDisplayValue("service_account")};
			var serviceAccountIndex = serviceAccountList.map(function (item) { return item.sys_id; }).indexOf(discoverLdcConfigGr.getValue("service_account"));
			if (serviceAccountIndex == -1)
				serviceAccountList.push(serviceAccObj);
		}
		return serviceAccountList;
	},

	//Returns number of cloud resource schedule from the discovery_schedule and filtering based on discover type is Cloud Resources
	//And validating whether the schedule is active and contains service account other than "ansible and chef" from the cmp_discovery_ldc_config
	getCloudResourceScheduleCount: function() {
		var scheduleGr = new GlideRecord("discovery_schedule");
		scheduleGr.addQuery('discover', 'Cloud Resources');
		scheduleGr.addCondition("active", true);
		var ldcConfigGr = scheduleGr.addJoinQuery("cmp_discovery_ldc_config", "sys_id", "discovery_schedule");
		ldcConfigGr.addCondition("service_account", "!=", null);
		scheduleGr.addActiveQuery();
		scheduleGr.query();
		return scheduleGr.getRowCount();
	},

	//Returns number of datacenter list from the cmdb_ci_logical_datacenter table. Once discovery is start for service account
	//All the discovered datacenter are populate in cmdb_ci_logical_datacenter table.
	getDataCentersCount: function() {
		var logicalDatacenterCount =new GlideAggregate('cmdb_ci_logical_datacenter');
		logicalDatacenterCount.addAggregate('COUNT');
		logicalDatacenterCount.query();
		var dataCenterCount = 0;
		if(logicalDatacenterCount.next())
		   dataCenterCount = logicalDatacenterCount.getAggregate('COUNT');
		return dataCenterCount;
	},

	/*
	* Returns number of disocvered cloud resources based on the CIs that extend "cmdb_ci" and not among the ignored list
	* Using fetched CIs, discovered resources count will be calculated.
	* 
	* NOTE: List of CIs added in ignoredList are based on the Report Source.
	*       Report Source with 'Visualise Cloud Discovery Results' name and '2f2ffc406725230022646c706785efe2' sys_id
	*       Conditions added below should be in sync with the conditions used in respective Report Source.
	*/
	getCloudResources: function() {
		var count = 0;
		var cloudResourceDiscoHandler = new global.CloudResourceDiscoveryCountHandler();
		
		var ignoredList = ['cmdb_ci_spkg', 'cmdb_ci_computer', 'cmdb_ci_service', 'cmdb_ci_printer', 'cmdb_ci_win_cluster_node', 'cmdb_ci_database', 'cmdb_ci_web_server', 'cmdb_ci_server', 'cmdb_ci_win_server', 'cmdb_ci_unix_server', 'cmdb_ci_ups', 'cmdb_ci_email_server', 'cmdb_ci_netgear', 'cmdb_ci_rack', 'cmdb_ci_zone', 'cmdb_ci_linux_server', 'cmdb_ci_win_cluster', 'cmdb_ci_cluster_node', 'cmdb_ci_ip_router', 'cmdb_ci_msd', 'cmdb_ci_network_adapter', 'cmdb_ci_aix_server', 'cmdb_ci_computer_room', 'cmdb_ci_disk', 'cmdb_ci_peripheral', 'cmdb_ci_appl', 'cmdb_ci_app_server_java', 'cmdb_ci_cluster', 'cmdb_ci_datacenter', 'cmdb_ci_db_mysql_catalog', 'cmdb_ci_db_ora_catalog', 'cmdb_ci_ip_switch', 'cmdb_ci_service_group', 'cmdb_ci_storage_switch', 'cmdb_ci_translation_rule', 'cmdb_ci_aws_datacenter', 'cmdb_ci_azure_datacenter', 'cmdb_ci_vcenter_datacenter', 'cmdb_ci_cloud_service_account', 'cmdb_ci_infra_service', 'cmdb_ci_hardware', 'cmdb_ci_storage_device', 'cmdb_ci_app_server', 'cmdb_ci_db_catalog', 'cmdb_ci_endpoint_acl', 'cmdb_ci_endpoint_block', 'cmdb_ci_endpoint_comp_security', 'cmdb_ci_endpoint_cust_gateway', 'cmdb_ci_endpoint_intgateway', 'cmdb_ci_endpoint_nat', 'cmdb_ci_endpoint_route_table', 'cmdb_ci_endpoint_subnet', 'cmdb_ci_endpoint_vnic', 'cmdb_ci_endpoint_vpg', 'cmdb_ci_customer_gateway', 'cmdb_ci_iscsi_disk', 'cmdb_ci_vpn_connection', 'cmdb_ci_vm_object', 'cmdb_ci_vcenter_object', 'cmdb_ci_db_instance'];
		
		//Fetching all the childs and grand-childs that extend implicitly or explicitly from 'cmdb_ci' table
		var tables = cloudResourceDiscoHandler.fetchAllChildCIsForParentCI("cmdb_ci");
		
		//Removing the ignored CIs from the fetched list
		for (var j in ignoredList) {
			var index = tables.indexOf(ignoredList[j]);
			if (index > -1)
				tables.splice(index, 1);
		}
		
		for (var i in tables) {
			var resourceTableGr = new GlideAggregate(tables[i]+'');
			resourceTableGr.addAggregate('COUNT');
			resourceTableGr.query();
			if (resourceTableGr.next())
				count = count + parseInt(resourceTableGr.getAggregate('COUNT'));
		}
		return count;
	},

	getVMScheduleCount: function() {
		var scheduleGR = new GlideRecord('discovery_schedule');
		scheduleGR.addNotNullQuery('vm_run');
		scheduleGR.addActiveQuery();
		scheduleGR.query();
		return scheduleGR.getRowCount();
	},
	
	getSuggestedApplicationsCount: function(){
		var processGroupGR = new GlideRecord("cmdb_process_groups");
		processGroupGR.addNullQuery('classifier');
		processGroupGR.query();
		return processGroupGR.getRowCount();

	},
	isPredictivePluginInstalled : function(){
		if (GlidePluginManager.isActive("com.glide.platform_ml")){
			return 1;
		}else{
			return 0;
		}
	},
	isDomainMaint : function(){
		if ((gs.getUser().getDomainID() == null || gs.getUser().getDomainID() == "global") && gs.hasRole('discovery_admin')){
			return 1;
		} else {
			return 0;
		}
	},
	getDiscoveredDevicesStats: function () {
		var result = {
			'devices': this._getNumDiscoveredDevices(),
		};
		this.getScheduleLocations(result);
		return result;
	},
	getHomepageStats: function() {
		var result = {
			// 'devices': this._getNumDiscoveredDevices(),
			'errors': 0,
			'totalIps': 0,
			'unexploredIps': 0,
			'unexploredIpSchedules': 0,
			'errorsSchedules': 0,
			'totalSchedules': 0,
			'locations': 0,
			'suggestedApplications':this.getSuggestedApplicationsCount(),
			'predictivePluginInstalled':this.isPredictivePluginInstalled(),
			'isDomainMaint':this.isDomainMaint(),
			'serviceAccounts' : this.getServiceAccount().length,
			'datacenters': this.getDataCentersCount()
		};
		
		// get last completed result for each schedule for total count calc
		var scheduleGr = new GlideRecord("discovery_schedule");
		scheduleGr.addQuery('discover', 'CIs');
		scheduleGr.addActiveQuery();
		scheduleGr.query();
		result.totalSchedules = scheduleGr.getRowCount() + this.getCloudResourceScheduleCount() - this.getVMScheduleCount();
		var scheduleSysIds = [];
		var unexplored;
		// flag to check if we ever came across a schedule without an assigned location
		var foundUnassignedSchedule = false;

		// TODO: return error if no results ...

		this.getScheduleLocations(result);
		this.getIpAddressInfo(result);

		return result;
	},

	getIpAddressInfo: function(result) {
		// unexplored and total_ips for inactive results
		var resultGr = new GlideAggregate("discovery_result");
		resultGr.addEncodedQuery("sys_created_on>=javascript:gs.hoursAgo(24)");
		resultGr.addNotNullQuery("schedule");
		resultGr.addQuery("state","!=","active");
		resultGr.addAggregate('SUM', 'n_active_nc_ips');
		resultGr.addAggregate('SUM', 'n_total_ips');
		resultGr.setGroup(false);
		resultGr.query();

		if (resultGr.next()) {
		    // using a short-circuit || here to prevent returning NaN
			result.unexploredIps += parseInt(resultGr.getAggregate('SUM', 'n_active_nc_ips')) || 0;
			result.totalIps += parseInt(resultGr.getAggregate('SUM', 'n_total_ips')) || 0;
		}

		// unexplore and total_ips for active results
		resultGr = new GlideRecord("discovery_result");
		resultGr.addEncodedQuery("sys_created_on>=javascript:gs.hoursAgo(24)");
		resultGr.addNotNullQuery("schedule");
		resultGr.addQuery("state","active");
		resultGr.addEncodedQuery("sys_created_on>=javascript:gs.hoursAgo(24)");
		resultGr.query();

		while (resultGr.next()) {
			result.unexploredIps += parseInt(this.getInProgressStats(resultGr.getValue('sys_id')).unidentifiedIps) || 0;
			result.totalIps += parseInt(resultGr.getValue('n_total_ips')) || 0;
		}
	},

	getScheduleLocations: function(result) {
		var gr = new GlideAggregate('discovery_schedule');
		gr.addQuery('active', 'true');
		gr.addNotNullQuery('location');
		gr.addAggregate('COUNT(DISTINCT', 'location');
		gr.setGroup(false);
		gr.query();

		if (gr.next()) {
			result.locations = gr.getAggregate('COUNT(DISTINCT', 'location');
		}
	},

	discoveryInProgress: function(status) {
		if (!status)
			return false;

		var statusGr = new GlideRecord("discovery_status");
		// GlideRecord.get 1 arg form falls back to 'name' if not found by sys_id, 2 arg form throws exception if arg2 is null.
		statusGr.get('sys_id', status);
		if (!statusGr) // TODO: should return error back to caller
			return false;

		if (statusGr.state != 'Completed' || statusGr.state != 'Canceled')
			return true;

		return false;
	},

	aggregateCount: function(categories) {
		var count = 0;
		categories.forEach(function(category) {count += category.errorNumber;});
		return count;
	},

	getAllErrorsForStatus: function(status) {
		var errors = {};
		var result = {list:[]};

		if (this.USE_ERROR_FRAMEWORK) {
			// For new EF we need to change the underlying table to code instead of category
			// because this maps everything critical like severity and suppression.
			// No current callers care about anything in the data object except for the count.
			// So we can cleanly change the underlying data model for new EF.
			// This note is for anyone extending usage of this API data object to be aware of the nuance.
			var grCodeInstanceStats = new GlideRecord('sys_error_code_inst_stats');
			grCodeInstanceStats.addQuery('error_instance', status);
			grCodeInstanceStats.addQuery('error_code.severity_label', '!=', 'info');
			grCodeInstanceStats.addQuery('error_code.suppress', false);
			grCodeInstanceStats.query();

			while (grCodeInstanceStats.next()) {
				result.list.push({
					id:                  grCodeInstanceStats.getValue('error_code'),
					name:                grCodeInstanceStats.getDisplayValue('error_code'),
					errorNumber:         parseInt(grCodeInstanceStats.getValue('error_count'), 10) || 0,
					icon:                grCodeInstanceStats.error_category.icon + ''
				});
			}

			errors.categories = result.list;
			errors.count = this.aggregateCount(errors.categories);
		} else {
			var errManager = new sn_svcerr.ErrorMgrScript(this.DISCOVERY_APP);
			var errCategories = errManager.getInstanceCategories(status);
			errCategories.forEach(function(errCat) {
				result.list.push({
					id:                  errCat.getId(),
					name:                errCat.getName(),
					errorNumber:         errCat.getTotalErrors(),
					icon:                errCat.getIcon()
				});
			});
			errors.categories = result.list;
			errors.count = this.aggregateCount(errors.categories);
		}

		return errors;
	},

	getScheduleErrorCount: function(schedule) {
		var json = new JSON();
		// TODO: this is used for sorting the schedules by error count.  This needs
		// to be replaced by a query on one of the instance tables.
		// UPDATE 10/9/2025 - Not adding replacement for new ErrorFramework as
		// underlying call is still not implemented. See STRY61583905
		var count = SNC.DiscoveryErrorMessage.queryScheduleErrorCount(schedule) + '';
		return parseInt(count, 10);
	},

	getInProgressStats: function(status) {
		var dh = new GlideRecord("discovery_device_history");
		dh.addQuery('status', status);
		dh.query();

		var result = {
			'createdDevices': 0,
			'updatedDevices': 0,
			'unidentifiedIps': 0,
			'duplicateIps': 0
		};

		while (dh.next()) {
			switch ('' + dh.last_state) {
				case "Updated CI":
					result.updatedDevices += 1;
					break;
				case "Created CI":
					result.createdDevices += 1;
					break;
				case "Identified, ignored extra IP":
					result.duplicateIps += 1;
					break;
				default:
					result.unidentifiedIps += 1;
					break;
			}
		}

		return result;
	},

	getCountOfSchedulesPerLocation: function() {
		var scheduleLocationList = [];
		var result;

		var gr = new GlideAggregate('discovery_schedule');
		gr.addQuery('discover', 'CIs');
		gr.addAggregate('COUNT');
		gr.addActiveQuery();
		//gr.addNotNullQuery('location');
		gr.groupBy('location');
		gr.query();

		while(gr.next()) {
			scheduleLocationList.push({
				locationId: gr.location+'',
				location: gr.location.name+'',
				count: gr.getAggregate('COUNT')
			});
		}

		return scheduleLocationList;
	},

	getScheduleResults: function(scheduleType, searchTerm, sortBy, filteredSchedules) {
		var schedulesObj = this.getSchedules(scheduleType, searchTerm, sortBy, filteredSchedules);

		if (JSUtil.nil(schedulesObj) || JSUtil.nil(schedulesObj.schedules))
			return {};

		// grab up to last (this.MAX_RESULTS) results for each schedule
		var schedule;
		for (var i = 0; i < schedulesObj.schedules.length; i++) {
			schedule = schedulesObj.schedules[i];
			schedule.results = this.getResultsForSchedule(schedule.sysID, this.MAX_RESULTS);
		}

		// add the count of schedules per type info
		schedulesObj.scheduleLocations = this.getCountOfSchedulesPerLocation();
		schedulesObj.totalSchedulesCount = this.getTotalSchedulesCount();

		return schedulesObj;
	},
	
	getTotalSchedulesCount: function() {
		var gr = new GlideRecord('discovery_schedule');
		gr.query();
		
		return gr.getRowCount();
	},

	getSchedules: function(locationId, searchTerm, sortBy, filteredSchedules) {
		var scheduleGr = new GlideRecord('discovery_schedule');
		var lastResult;
		var sortedSchedules;
		
		// set up schedule query with initial filtering
		if (locationId) {
			if (locationId == 'unassigned')
				scheduleGr.addNullQuery('location');
			else
				scheduleGr.addQuery('location', locationId);
		}
		if (searchTerm)
			scheduleGr.addQuery('name', 'CONTAINS', searchTerm);
		if (filteredSchedules)
			scheduleGr.addQuery('sys_id', 'NOT IN', filteredSchedules);

		// we only care about 'Configuration Item' type discoveries
		scheduleGr.addQuery('discover', 'CIs');
		scheduleGr.addActiveQuery();
		// add sorting for the filtered schedules
		if (!sortBy || sortBy == 'alphabetical') {
			scheduleGr.orderBy('name');	
			scheduleGr.setLimit(this.SCHEDULE_WINDOW);
			scheduleGr.query();
		} else if (sortBy == 'errors') {
			scheduleGr.query();
			var schedulesToErrorMap = {};
			while (scheduleGr.next()) {
				var errCount = this.getScheduleErrorCount(scheduleGr.sys_id + '');
				schedulesToErrorMap[scheduleGr.sys_id +''] = errCount;
			}

			// sort in descending order
			sortedSchedules = Object.keys(schedulesToErrorMap).sort(function(a, b) {
				return schedulesToErrorMap[b] - schedulesToErrorMap[a];
			});

			scheduleGr = new GlideRecord('discovery_schedule');
			scheduleGr.addQuery('sys_id', 'IN', sortedSchedules.slice(0, this.SCHEDULE_WINDOW));
			scheduleGr.query();
		} else if (sortBy == 'unidentified') {
			scheduleGr.query();
			var schedulesToUnidentifiedMap = {};
			while (scheduleGr.next()) {
				lastResult = this.getLastResultForSchedule(scheduleGr);
				schedulesToUnidentifiedMap[scheduleGr.sys_id +''] = ((lastResult && parseInt(lastResult.n_active_nc_ips+'')) || 0);
			}

			// sort in descending order
			sortedSchedules = Object.keys(schedulesToUnidentifiedMap).sort(function(a, b) {
				return schedulesToUnidentifiedMap[b] - schedulesToUnidentifiedMap[a];
			});

			scheduleGr = new GlideRecord('discovery_schedule');
			scheduleGr.addQuery('sys_id', 'IN', sortedSchedules.slice(0, this.SCHEDULE_WINDOW));
			scheduleGr.query();
		} else if (sortBy == 'running') {
			var runningSchedulesList = this.getRunningSchedulesList();
			scheduleGr.addQuery('sys_id', 'IN', runningSchedulesList);
			scheduleGr.setLimit(this.SCHEDULE_WINDOW);
			scheduleGr.query();
		}

		var result = {
			total: scheduleGr.getRowCount(),
			schedules: this._getSchedulesAsList(scheduleGr)
		};

		return result;
	},
	
	getRunningSchedulesList: function() {
		var runningSchedulesMap = {};
		var runningSchedulesList = [];
		var scheduleSysId;

		var statusGr = new GlideRecord('discovery_status');
		statusGr.addQuery('state', 'IN', 'starting,active');
		statusGr.query();
		while (statusGr.next()) {
			scheduleSysId = statusGr.dscheduler+'';
			if (!runningSchedulesMap[scheduleSysId]) {
				runningSchedulesMap[scheduleSysId] = true;
				runningSchedulesList.push(scheduleSysId);
			}
		}

		return runningSchedulesList;
	},

	getLastResultForSchedule: function(schedule) {
		var resultGr = new GlideRecord('discovery_result');
		resultGr.addQuery('schedule', schedule.sys_id +'');
		resultGr.addQuery('state', 'Completed');
		resultGr.orderByDesc('sys_created_on');
		resultGr.setLimit(1);
		resultGr.query();

		if (!resultGr.hasNext())
			return null;
		
		resultGr.next();
		return resultGr;
	},

	getAllSchedules: function() {
		var scheduleGr = new GlideRecord("discovery_schedule");
		scheduleGr.orderByDesc("sys_created_on");
		scheduleGr.query();

		return this._getSchedulesAsList(scheduleGr);
	},
	
	refreshResults: function(schedules) {
		if (!schedules)
			return {};
		
		var result = {};
		for (var i = 0; i < schedules.length; i++) {
			result[schedules[i]] = this.getResultsForSchedule(schedules[i]);
		}

		return result;
	},

	getResultsForSchedule: function(scheduleId, limit) {
		var isInProgress = false;
		var resultGr = new GlideRecord("discovery_result");
		resultGr.addQuery("schedule", scheduleId);
		resultGr.orderByDesc("sys_created_on");
		limit = limit || this.MAX_RESULTS;
		resultGr.setLimit(limit);
		resultGr.query();

		var resultList = [];
		var result, createdDevices, updatedDevices,
			unidentifiedIps, duplicateIps, inProgResults;
		while (resultGr.next()) {
			// check if discovery in progress then grab data from device history
			if (resultGr.state+'' === 'Active') {
				isInProgress = true;
				inProgResults = this.getInProgressStats(resultGr.status +'');
				createdDevices = inProgResults.createdDevices;
				updatedDevices = inProgResults.updatedDevices;
				unidentifiedIps = inProgResults.unidentifiedIps;
				duplicateIps = inProgResults.duplicateIps;
			} else {
				createdDevices = resultGr.n_created_devices +'';
				updatedDevices = resultGr.n_updated_devices +'';
				unidentifiedIps = resultGr.n_active_nc_ips +'';
				duplicateIps = resultGr.n_duplicate_ips +'';
			}

			resultList.push({
				sysId: resultGr.sys_id +'',
				schedule: scheduleId,
				status:  resultGr.status +'',
				totalIps: resultGr.n_total_ips +'',
				aliveIps: resultGr.n_alive_ips +'',
				deadIps: resultGr.n_dead_ips +'',
				activeIps: resultGr.n_active_ips +'',
				unidentifiedIps: unidentifiedIps,
				duplicateIps: duplicateIps,
				createdDevices: createdDevices,
				updatedDevices:  updatedDevices,
				errors: this.getAllErrorsForStatus(resultGr.status +''),
				started: resultGr.getDisplayValue('sys_created_on'),
				startedDate: resultGr.started.getDisplayValue() +'',
				ended: this.getUpdatedTime(isInProgress, scheduleId, resultGr),
				state: resultGr.state +''
			});
		}

		return resultList;
	},
	
	getUpdatedTime: function(isInProgress, scheduleId, resultGr){
		if (isInProgress) {
			var statusGr = new GlideRecord('discovery_status');
			statusGr.addQuery('dscheduler', scheduleId);
			statusGr.addQuery('sys_id', resultGr.status +'');
			statusGr.query();
			if (statusGr.next())
				return statusGr.getDisplayValue('sys_updated_on');

		}
		return resultGr.getDisplayValue('sys_updated_on');
	},

	_getSchedulesAsList: function(scheduleGr) {
		var scheduleList = [];
		var schedule;
		while (scheduleGr.next()) {
			schedule = {};
			schedule.sysID = scheduleGr.sys_id +'';
			schedule.name = scheduleGr.name +'';
			schedule.type = scheduleGr.discover.getDisplayValue() +'';
			schedule.discoRunType = scheduleGr.disco_run_type +'';
			if (schedule.discoRunType == 'after_discovery' && JSUtil.notNil(scheduleGr.run_after))
				schedule.runAfter = scheduleGr.run_after.name;
			schedule.runDayOfMonth = scheduleGr.run_dayofmonth +'';
			schedule.runDayOfWeek = scheduleGr.run_dayofweek +'';
			schedule.runPeriod = scheduleGr.run_period +'';
			schedule.runTime = scheduleGr.run_time.getDisplayValue() +'';
			schedule.runStart = scheduleGr.run_start.getDisplayValue() +'';
			schedule.locationID = scheduleGr.location +'';
			schedule.location = scheduleGr.location.name +'';
			schedule.active = !!scheduleGr.active;

			scheduleList.push(schedule);
		}

		return scheduleList;
	},

	getCloudResourcesChartInfo: function() {
		return this.cloudResourceChartInfo;
	},

	type: 'DiscoveryResultManager'
};
