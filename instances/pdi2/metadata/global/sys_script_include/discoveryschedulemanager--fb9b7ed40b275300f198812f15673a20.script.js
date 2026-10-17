var DiscoveryScheduleManager = Class.create();
var CloudDiscoveryScheduleConfig = new CloudDiscoveryScheduleConfig();
DiscoveryScheduleManager.prototype = {
	initialize: function() {
		this.SCHEDULES_PER_PAGE = 10; // max # of schedule records to pull for each page (sorted alphabetically)
		this.DISCOVERY_APP = 'd5069fe9e70332001a310a6103f6a94b';
		this.CLOUD_SCHEDULE = 'cloud_schedules';
		this.IP_SCHEDULE = 'ip_based_schedules';
		this.CLOUD_RESOURCES = 'Cloud Resources';
		this.CIs = 'CIs';
		this.USE_ERROR_FRAMEWORK = DiscoveryErrorsUtilities.useErrorFramework();

		//Dropdown default options for IP Based schedule
		this.ALL_LOCATIONS_DEFAULT_OPTION = {
			sysId: '',
			name: gs.getMessage('All Locations')
		};
		this.UNASSIGNED_LOCATIONS_OPTION = {
			sysId: 'unassigned',
			name: gs.getMessage('Unassigned Location')
		};

		//Dropdown default options for cloud schedule
		this.ALL_SERVICE_ACCOUNT_DEFAULT_OPTION = {
			sysId: '',
			name: gs.getMessage('All Service Accounts')
		};
	},

	/** API to filter discovery schedules based on the type of schedule specified and search criteria.
	*
	* @scheduleType - Defines the type of the schedule. 'all / cloud_schedules/ IP_based_schedule'
	* @serviceAccount - Defines the sub category for cloud_Schedule
	* @location - Defines the sub category for IP_based_schedule
	* @searchTerm - Filters the schedules based on the text provided in searchBox.
	* @sortBy - Sorts schedules based on 4 different filters specified (Alphabetical / All Running Schedules / Errors / UnIdentified IPs
	* @startIndex - fetches only specified no. of records from the startIndex specified in the current window based on constant SCHEDULES_PER_PAGE.
	*
	* Sample API calls for different type of schedule
	*
	* 1) Filter all schedules irrespective of the schedule type.
	*
	* --------- getSchedules ('all', '', searchTerm, sortBy, startIndex); ----------
	*
	* 2) Filter Cloud Schedules
	*
	* Filter schedules based on service account ---- getSchedules ('cloud_schedules', 'serviceAccountId', searchTerm, sortBy, startIndex); ----
	*
	* Filter all cloud schedules ---- getSchedules ('cloud_schedules', '', searchTerm, sortBy, startIndex); -----
	*
	* 3) Filter IP Based Schedule
	*
	* Filter schedules based on location ---- getSchedules ('IP_based_schedules', 'locationId/unassigned location', searchTerm, sortBy, startIndex); ----
	*
	* Filter all IP Based Schedules ---- getSchedules ('IP_based_schedules', '', searchTerm, sortBy, startIndex); ----
	*/

	getSchedules: function(scheduleType, serviceAccount, location, searchTerm, sortBy, startIndex, providerClass, activeProviders) {
		var scheduleGr = new GlideRecord('discovery_schedule');
		var lastResult;
		var sortedSchedules;
		var matchedSchedules = [];

		if (scheduleType == this.CLOUD_SCHEDULE)
			matchedSchedules = this.filterCloudSchedules(scheduleGr, serviceAccount, providerClass, activeProviders);
		else if (scheduleType == this.IP_SCHEDULE)
			matchedSchedules = this.filterIPSchedules(scheduleGr, location);
		else
			matchedSchedules = this.filterCIAndCloudSchedules();

		// set up schedule query with initial filtering
		if (!gs.nil(searchTerm))
			scheduleGr.addQuery('name', 'CONTAINS', searchTerm);

		//add query to match schedules if the schedule type is cloud_schedule or all and if the sort type is not running
		if (sortBy != 'running')
			scheduleGr.addQuery('sys_id', 'IN', matchedSchedules);

		// add sorting for the filtered schedules
		if (!sortBy || sortBy == 'alphabetical')
			scheduleGr.orderBy('name');
		else if (sortBy == 'unidentified') {
			//we should not show cloud resources in unidentified section if schedule type is all
			if (scheduleType == 'all')
				scheduleGr.addQuery('discover', this.CIs);
		} else if (sortBy == 'running') {
			var runningSchedulesList = this.getRunningSchedulesList(scheduleType, matchedSchedules);
			scheduleGr.addQuery('sys_id', 'IN', runningSchedulesList);
			scheduleGr.orderByDesc('sys_updated_on');
		}

		scheduleGr.chooseWindow(startIndex, parseInt(startIndex) + this.SCHEDULES_PER_PAGE);
		scheduleGr.query();

		var result = {
			schedulesPerPage: this.SCHEDULES_PER_PAGE,
			total: scheduleGr.getRowCount(),
			schedules: this._getSchedulesAsList(scheduleGr, sortBy)
		};

		return result;
	},

	/**
	* Filters Cloud Schedules based on the given service account
	*/
	filterCloudSchedules: function(scheduleGr, serviceAccount, providerClass, activeProviders) {
        scheduleGr.addQuery('discover', this.CLOUD_RESOURCES);

        var matchedSchedules = [];
        var providers = [];
        if (activeProviders)
            providers = this.getActiveProviders();

        var ldcConfigGA = new GlideAggregate('cmp_discovery_ldc_config');
        ldcConfigGA.addNotNullQuery('discovery_schedule');
        ldcConfigGA.groupBy('discovery_schedule');
        ldcConfigGA.query();
        while (ldcConfigGA.next()) {
            var ldcConfigGR = new GlideRecord('cmp_discovery_ldc_config');
            ldcConfigGR.addQuery('discovery_schedule', ldcConfigGA.getValue('discovery_schedule'));
            if (serviceAccount)
                ldcConfigGR.addQuery('service_account', serviceAccount);

            //Provider datacenter class
            if (!gs.nil(providerClass) && providerClass != 'all')
                ldcConfigGR.addQuery('service_account.datacenter_type', providerClass);

            ldcConfigGR.addNotNullQuery('service_account');
            ldcConfigGR.orderByDesc('sys_created_on');
            ldcConfigGR.chooseWindow(0, 1);
            ldcConfigGR.query();

            if (ldcConfigGR.next()) {
                if (activeProviders) {
                    if (providers.length && new ArrayUtil().indexOf(providers, ldcConfigGR.service_account.datacenter_type.getDisplayValue()) >= 0)
                        matchedSchedules.push(ldcConfigGR.getValue('discovery_schedule'));
                } else
                    matchedSchedules.push(ldcConfigGR.getValue('discovery_schedule'));

            }
        }

        if (matchedSchedules.length)
            return matchedSchedules;

    },

    /**
     * Get array of datacenter classes of active providers
     */
    getActiveProviders: function() {
        var providers = [];

        // Intersection of discovery_cloud_provider and sn_capi_provider tables to get the active providers.
        var gr = new GlideRecord('discovery_cloud_provider');
        gr.query();
        while (gr.next()) {
            var provider = new GlideRecord('sn_capi_provider');
            provider.addQuery('active', true);
            provider.query();
            while (provider.next()) {
                if (gr.getValue('provider') == provider.getValue('name')) {
                    // providers array stores the active providers datacenter class
                    providers.push(provider.getValue('datacenter_class'));
                }
            }
        }
        return providers;
    },

	/**
	* Filters IP Schedules based on the given location
	*/
	filterIPSchedules : function(scheduleGr, location){
		scheduleGr.addQuery('discover', this.CIs);

		var matchedSchedules = [];
		var matchedScheduleGR = new GlideRecord('discovery_schedule');
		if (location) {
			if (location == 'unassigned')
				matchedScheduleGR.addNullQuery('location');
			else
				matchedScheduleGR.addQuery('location', location);
		}

		matchedScheduleGR.query();

		while (matchedScheduleGR.next())
			matchedSchedules.push(matchedScheduleGR.getUniqueValue());

		if (matchedSchedules.length) {
			this.removeVMSchedulesFromList(matchedSchedules);
			return matchedSchedules;
		}
	},

	/**
	* Filters all scedules of type Cloud Resources and CIs & Remove VM Schedules if any
	*/
	filterCIAndCloudSchedules : function() {
		/*
		* Fetch cloud resource schedules first. If the cloud resource schedule has a CI type schedule(vm_run) configured,
		* add it to excluded list. When iterating over CI schedules, don't add the schedule if it's part of excluded list.
		*/
		var matchedSchedules = [];
		var schedulesToBeExcluded = [];

		var discoveryScheduleGr = new GlideRecord('discovery_schedule');
		discoveryScheduleGr.addActiveQuery();
		discoveryScheduleGr.addQuery('discover', 'Cloud Resources');
		discoveryScheduleGr.query();

		while (discoveryScheduleGr.next()) {
			matchedSchedules.push(discoveryScheduleGr.getValue('sys_id'));
			if (JSUtil.notNil(discoveryScheduleGr.getValue('vm_run')))
				schedulesToBeExcluded.push(discoveryScheduleGr.getValue('vm_run'));
		}

		discoveryScheduleGr = new GlideRecord('discovery_schedule');
		discoveryScheduleGr.addActiveQuery();
		discoveryScheduleGr.addQuery('discover', 'CIs');
		discoveryScheduleGr.addQuery('sys_id', 'NOT IN', schedulesToBeExcluded.join());
		discoveryScheduleGr.query();

		while (discoveryScheduleGr.next())
		    matchedSchedules.push(discoveryScheduleGr.getValue('sys_id'));

		return matchedSchedules;
	},

	removeVMSchedulesFromList : function(matchedSchedules) {
		var scheduleGR = new GlideRecord('discovery_schedule');
		scheduleGR.addQuery('discover', this.CLOUD_RESOURCES);
		scheduleGR.addNotNullQuery('vm_run');
		scheduleGR.query();
		while (scheduleGR.next()) {
			var matchedIndex = matchedSchedules.indexOf(scheduleGR.getValue('vm_run'));
			if (matchedIndex != -1)
				matchedSchedules.splice(matchedIndex, 1);
		}
	},

	getScheduleErrorCount: function(schedule) {
		var json = new JSON();
		// TODO: this is used for sorting the schedules by error count.  This needs
		// to be replaced by a query on one of the instance tables.
		// UPDATE 10/09 - Not providing replacement function for new Error Framework
		// as underlying API call still looks unimplemented. See STRY61583905
		var count = SNC.DiscoveryErrorMessage.queryScheduleErrorCount(schedule) + '';
		return parseInt(count, this.SCHEDULES_PER_PAGE);
	},

	_getSchedulesAsList: function(scheduleGr, sortBy) {
		var scheduleList = [];
		var schedule;
		while (scheduleGr.next()) {
			var scheduleId = scheduleGr.getValue('sys_id');
			schedule = {};
			schedule.sysID = scheduleId;
			schedule.name = scheduleGr.name +'';
			schedule.type = scheduleGr.discover.getDisplayValue() +'';
			schedule.discoRunType = scheduleGr.disco_run_type +'';
			if (schedule.discoRunType == 'after_discovery' && JSUtil.notNil(scheduleGr.run_after))
				schedule.runAfter = scheduleGr.run_after.name;
			schedule.runDayOfMonth = scheduleGr.run_dayofmonth +'';
			schedule.runDayOfWeek = scheduleGr.run_dayofweek +'';
			schedule.runPeriod = scheduleGr.run_period +'';
			schedule.runTime = scheduleGr.run_time.getValue() +'';
			schedule.runStart = scheduleGr.run_start.getValue() +'';
			schedule.locationID = scheduleGr.location +'';
			schedule.location = scheduleGr.location.name +'';
			schedule.active = !!scheduleGr.active;
			schedule.discoverType = scheduleGr.discover.getDisplayValue()+'';
			schedule.discoverTypeIdentifier = this.getDiscoverTypeIdentifier(scheduleGr.discover);
			schedule.isRunning = this.scheduleRunning(scheduleId);
			schedule.errorCount = this.getErrorCountForStatus(scheduleId);
			schedule.ended = this.getScheduleEndDate(scheduleGr.discover, scheduleId);

			if (scheduleGr.discover == this.CIs)
				schedule.results = new DiscoveryResultManager().getResultsForSchedule(scheduleId, this.SCHEDULES_PER_PAGE);

			scheduleList.push(schedule);
		}

		if (sortBy == "errors" || sortBy == "unidentified")
			return this.sortSchedulesBasedOnSortType(scheduleList, sortBy);

		return scheduleList;
	},

	sortSchedulesBasedOnSortType: function(scheduleList, sortType) {
		var schedulesToCountMap = {};
		var sortedSchedules;
		var sortedScheduleList = [];

		for (var schedule in scheduleList) {
			var scheduleId = scheduleList[schedule].sysID;
			if (sortType == "errors") {
				var errCount = this.getErrorCountForStatus(scheduleId);
				schedulesToCountMap[scheduleId] = errCount;
			}else if (sortType == "unidentified") {
				var lastResult = this.getLastResultForSchedule(scheduleId);
				schedulesToCountMap[scheduleId] = ((lastResult && parseInt(lastResult.n_active_nc_ips+'')) || 0);
			}
		}

		// sort in descending order
		sortedSchedules = Object.keys(schedulesToCountMap).sort(function(a, b) {
			return schedulesToCountMap[b] - schedulesToCountMap[a];
		});

		for (var i in sortedSchedules) {
			var matchedIndex = scheduleList.map(function(e) { return e.sysID; }).indexOf(sortedSchedules[i]);
			if (matchedIndex != -1) {
				sortedScheduleList.push(scheduleList[matchedIndex]);
			}
		}

		return sortedScheduleList;
	},

	/** Get error count from latest schedule status **/
	getErrorCountForStatus: function(scheduleId) {
		var statusGr = new GlideRecord('discovery_status');
		statusGr.addQuery('dscheduler', scheduleId);
		statusGr.chooseWindow(0, 1);
		statusGr.orderByDesc('sys_created_on');
		statusGr.query();
		while (statusGr.next()) {
			var errors = this.getAllErrorsForStatus(statusGr.getValue('sys_id'));
			return errors.count;
		}

		return 0;
	},

	scheduleRunning: function(scheduleId) {
		var statusGr = new GlideRecord('discovery_status');
		statusGr.addQuery('dscheduler', scheduleId);
		var stateGr = statusGr.addQuery('state', 'Active');
		stateGr.addOrCondition('state', 'Starting');
		statusGr.orderByDesc('sys_created_on');
		statusGr.query();

		if (statusGr.next())
			return true;

		return false;
	},

	getScheduleEndDate : function(discoveryType, scheduleId) {
		var gr = new GlideRecord('discovery_result');

		if (discoveryType == this.CIs)
			gr.addQuery('schedule', scheduleId);
		else if (discoveryType == this.CLOUD_RESOURCES) {
			gr = new GlideRecord('discovery_status');
			gr.addQuery('dscheduler', scheduleId);
		}

		gr.orderByDesc('sys_created_on');
		gr.setLimit(1);
		gr.query();

		if (gr.next()) {
			if (discoveryType == this.CIs)
				return gr.ended.getDisplayValue() + '';
			else if (discoveryType == this.CLOUD_RESOURCES)
				return gr.sys_updated_on.getDisplayValue() + '';
		}

		return null;
	},

	getLastResultForSchedule: function(scheduleId) {
		var resultGr = new GlideRecord('discovery_result');
		resultGr.addQuery('schedule', scheduleId);
		resultGr.addQuery('state', 'Completed');
		resultGr.orderByDesc('sys_created_on');
		resultGr.setLimit(1);
		resultGr.query();

		if (resultGr.next())
			return resultGr;

		return null;
	},

	getRunningSchedulesList: function(scheduleType, matchedSchedules) {
		var runningSchedulesMap = {};
		var runningSchedulesList = [];
		var scheduleSysId;

		var discoveryStatusGA = new GlideAggregate('discovery_status');
		discoveryStatusGA.addQuery('state', 'IN', 'starting,active');
		//get running schedules based on the schedule type. Filter from macthedschedules if schedule type is cloud resources or all
		if (scheduleType == this.IP_SCHEDULE)
			discoveryStatusGA.addQuery('discover', this.CIs);
		else if (scheduleType == this.CLOUD_SCHEDULE)
			discoveryStatusGA.addQuery('discover', this.CLOUD_RESOURCES);
		discoveryStatusGA.addQuery('dscheduler', 'IN', matchedSchedules);
		discoveryStatusGA.groupBy('dscheduler');
		discoveryStatusGA.query();

		while (discoveryStatusGA.next()) {
			scheduleSysId = discoveryStatusGA.dscheduler+'';
			if (!runningSchedulesMap[scheduleSysId]) {
				runningSchedulesMap[scheduleSysId] = true;
				runningSchedulesList.push(scheduleSysId);
			}
		}

		return runningSchedulesList;
	},

	/**
	* API fetches all the active service accounts with schedule
	*
	* Returns service account list from the cmp_discovery_ldc_config
	*/
	getServiceAccountList: function() {
		var serviceAccountList = [];
		var discoverLdcConfigGA = new GlideAggregate('cmp_discovery_ldc_config');
		discoverLdcConfigGA.addNotNullQuery('service_account');
		discoverLdcConfigGA.orderBy('service_account.name');
		discoverLdcConfigGA.groupBy('discovery_schedule');
		discoverLdcConfigGA.query();

		/** Note: 'cmp_discovery_ldc_config' table is not domain seperated and 'discovery_schedule' table is domain seperated. In default addJoinQuery not matched with domain separated records. so checking the 'cmp_discovery_ldc_config' schedule sysId is available in the discovery_schedule table. If schedule sysId not found in the discovery schedule table, not included for other domain service accounts **/
		while (discoverLdcConfigGA.next()) {
			var discoveryScheduleGr = new GlideRecord("discovery_schedule");
			discoveryScheduleGr.addQuery('sys_id', discoverLdcConfigGA.getValue('discovery_schedule'));
			discoveryScheduleGr.addActiveQuery();
			discoveryScheduleGr.query();
			if (discoveryScheduleGr.hasNext()) {
				var discoveryLdcGr = new GlideRecord("cmp_discovery_ldc_config");
				if (discoveryLdcGr.get('discovery_schedule', discoverLdcConfigGA.getValue('discovery_schedule'))) {
					if (!gs.nil(discoveryLdcGr.getDisplayValue("service_account"))) {
						var serviceAccObj = { sysId: discoveryLdcGr.getValue("service_account") , name: discoveryLdcGr.getDisplayValue("service_account")};
						var serviceAccountIndex = serviceAccountList.map(function (item) { return item.sysId; }).indexOf(discoveryLdcGr.getValue("service_account"));
						if (serviceAccountIndex == -1)
							serviceAccountList.push(serviceAccObj);
					}
				}
			}
		}
		return serviceAccountList;
	},

	getServiceAccountsFilterList: function() {
		var getServiceAccounts = this.getServiceAccountList();
		if (getServiceAccounts.length)
			getServiceAccounts.unshift(this.ALL_SERVICE_ACCOUNT_DEFAULT_OPTION);

		return getServiceAccounts;
	},

	getSchedulesPerLocation: function() {
		var result, scheduleLocationList = [], gr, unassignedSchedule = false;
		gr = new GlideAggregate('discovery_schedule');
		gr.addQuery('discover', this.CIs);
		gr.orderBy('location.name');
		gr.addAggregate('COUNT');
		gr.addActiveQuery();
		gr.groupBy('location');
		gr.query();

		while (gr.next()) {
			if (!gs.nil(gr.location.name)) {
				scheduleLocationList.push({
					sysId: gr.location+'',
					name: gr.location.name+'',
					count: gr.getAggregate('COUNT')
				});
			} else
				unassignedSchedule = true;
		}

		return {
			scheduleLocationList: scheduleLocationList,
			unassignedSchedule: unassignedSchedule
		};
	},

	getScheduleLocationsFilterList: function() {
        var scheduleLocationList = this.getSchedulesPerLocation().scheduleLocationList;
        if (this.getSchedulesPerLocation().unassignedSchedule)
            scheduleLocationList.unshift(this.UNASSIGNED_LOCATIONS_OPTION);

        if (scheduleLocationList.length)
            scheduleLocationList.unshift(this.ALL_LOCATIONS_DEFAULT_OPTION);
        return scheduleLocationList;
    },

	getDiscoverTypeIdentifier: function(discoverType) {
		if (discoverType == this.CLOUD_RESOURCES)
			return this.CLOUD_SCHEDULE;
		if (discoverType == this.CIs)
			return this.IP_SCHEDULE;
	},

   /**
   * API fetches schedule info for the given schedule and last 10 discovery runs of the schedule
   *
   * @scheduleId – A Cloud Schedule identifier for which we need to get the results
   *
   * Sample JSON
   * -----------------
      {
         "sysId": "557e81450b2f1300f198812f15673ab7",
         "name": "Cloud Service Account - Schedule1",
         "status": "Active",
         "location": null,
         "type": "Cloud Resources",
         "serviceAccount": "AWS Service Account",
         "discoveryStatusList": [{
            "sysId": "b29cc6d90b635300f198812f15673a7e",
            "name": "DIS0010001",
            "state": "Completed",
            "started": "180",
            "ended": "180",
            "card1": {
				name: "",
				count:0
			},
			"card2": {
				name: "",
				count:0
			},
            "card3": {
				name: "",
				count:0
			},
			"card4": {
				name: "",
				count:0
			},
			"errors":{}
         }]
      }
   *
   *
   * Sending all the discovery status details in descending order of created date.
   */
	getScheduleResults : function(scheduleId) {
		var scheduleGr = new GlideRecord('discovery_schedule');

		if (scheduleGr.get(scheduleId)) {
			var scheduleResults = {};
			scheduleResults['sysId'] = scheduleId;
			scheduleResults['name'] = scheduleGr.getValue('name');
			scheduleResults['status'] = scheduleGr.getValue('active') == 1 ? "Active" : "InActive";

			if (!gs.nil(scheduleGr.location))
				scheduleResults['location'] = scheduleGr.getValue('location');

			scheduleResults['type'] = scheduleGr.getValue('discover');
			scheduleResults['discoRunType'] = scheduleGr.getValue('disco_run_type');
			scheduleResults['runTime'] = scheduleGr.run_time.getValue() + '';
			scheduleResults['runStart'] = scheduleGr.run_start.getValue() +'';
			scheduleResults['runDayOfMonth'] = scheduleGr.getValue('run_dayofmonth');
			scheduleResults['runDayOfWeek'] = scheduleGr.getValue('run_dayofweek');
			scheduleResults['runPeriod'] = scheduleGr.getValue('run_period');

			if (scheduleGr.discoRunType == 'after_discovery' && JSUtil.notNil(scheduleGr.run_after))
				scheduleResults['runAfter'] = scheduleGr.run_after.name;

			scheduleResults['serviceAccount'] = new CloudResourceDiscoveryUtil().fetchServiceAccountFromSchedule(scheduleId).serviceAccountName;

			scheduleResults['discoveryStatusList'] = this.getDiscoveryStatus(scheduleId);

			var vmScheduleId = this.getVMScheduleIdIfExists(scheduleId);

			if (!JSUtil.nil(vmScheduleId)) {
				scheduleResults['backedByVMSchedule'] = true;
				scheduleResults['vmScheduleId'] = vmScheduleId;

				var vmScheduleGR = new GlideRecord('discovery_schedule');
				vmScheduleGR.query('sys_id', vmScheduleId);
				scheduleResults['vmScheduleInfo'] = this._getSchedulesAsList(vmScheduleGR, '')[0];
			} else
				scheduleResults['backedByVMSchedule'] = false;

			return scheduleResults;
		}
	},

	getVMScheduleIdIfExists: function(scheduleId) {
		var result = {};
		var scheduleGR = new GlideRecord('discovery_schedule');
		scheduleGR.addQuery('sys_id', scheduleId);
		scheduleGR.addNotNullQuery('vm_run');
		scheduleGR.query();
		if (scheduleGR.next())
			return scheduleGR.getValue('vm_run');

		return null;
	},

   /**
   * API fetches all the discovery status for the given schedule provided the scheduleId
   *
   * @scheduleId – A Cloud Schedule identifier from which the discovery status details has to be fetched
   *
   * API returns the count of cloud resources, errors ,no. of datacenters in the service account.
   */
   getDiscoveryStatus : function(scheduleId) {
      var discoveryStatus= [];

      var statusGr = new GlideRecord('discovery_status');
      statusGr.addQuery('dscheduler', scheduleId);
      statusGr.chooseWindow(0, this.SCHEDULES_PER_PAGE);
      statusGr.orderByDesc('sys_created_on');
      statusGr.query();

	  var datacenterType = new CloudResourceDiscoveryUtil().fetchDatacenterTypeFromSchedule(scheduleId);

      while (statusGr.next()) {
		  var card1 = {};
		  var card2 = {
			  'name': gs.getMessage('Virtual Machines'),
			  'count': this.getResourceInfo(statusGr.sys_id, 'cmdb_ci_vm_instance').totalcount
		  };

		  var card3 = {
			  'name': gs.getMessage('Errors'),
			  'count': this.getAllErrorsForStatus(statusGr.getValue('sys_id')).count
		  };

		  var card4 = {
			  'name': gs.getMessage('Datacenters'),
			  'count': this.getResourceInfo(statusGr.sys_id,  'cmdb_ci_logical_datacenter').totalcount
		  };

		  if (datacenterType.equals('cmdb_ci_vcenter_datacenter')) {
			  card1 = {
				  'name': gs.getMessage('ESX Servers'),
				  'count': this.getResourceInfo(statusGr.sys_id,  'cmdb_ci_esx_server').totalcount
			  };
		  } else {
			  card1 = {
				  'name': gs.getMessage('Cloud Resources'),
				  'count': this.getResourceInfo(statusGr.sys_id).totalcount
			  };
		  }
		  discoveryStatus.push ({
			  sysId : statusGr.getValue('sys_id'),
			  name: statusGr.getValue('number'),
			  description: statusGr.getValue('description'),
			  state: statusGr.getValue('state'),
			  started: statusGr.getDisplayValue('sys_created_on'),
			  ended: statusGr.getDisplayValue('sys_updated_on'),
			  probesStarted: statusGr.getValue('started'),
			  probesCompleted: statusGr.getValue('completed'),
			  discover: statusGr.getValue('discover'),
			  maxRun: statusGr.getValue('max_run'),
			  logStateChanges: statusGr.getValue('log_state_changes'),
			  absentDevices: {
				  'name' : gs.getMessage('Absent from last'),
				  'count': this.getDiscoveredDevicesCountByStatus(statusGr.getUniqueValue(), 'absent')
			  },
			  newDevices: {
				  'name' : gs.getMessage('Newly discovered'),
				  'count': this.getDiscoveredDevicesCountByStatus(statusGr.getUniqueValue(), 'new')
			  },
			  createdOn: statusGr.getValue('sys_created_on'),
			  updatedOn: statusGr.getValue('sys_updated_on'),
			  discoStatusDuration: this.discoStatusDuration(statusGr),
			  card1: card1,
			  card2: card2,
			  card3: card3,
			  card4: card4,
			  errors: this.getAllErrorsForStatus(statusGr.getValue('sys_id'))
		  });
      }

      return discoveryStatus;
   },

	/**
	* API fetches the no. of datacenters associated with the given schedule for the given status
	*
	* @scheduleId – A Cloud Schedule identifier for the dataceter count has to be fetched
	*/
	getDatacenterCountForSchedule: function (scheduleId) {
		var totalcount = 0;

		var configGR = new GlideRecord('cmp_discovery_ldc_config');
		configGR.addQuery('discovery_schedule', scheduleId);
		configGR.query();
		while (configGR.next()) {
			if (!configGR.service_account || configGR.service_account.exclude_from_discovery == true)
				continue;

			totalcount += (configGR.getValue('ldc') ? 1 : this.getDatacenterCount(configGR.service_account+''));
		}

		return totalcount;
   	},

	getDatacenterCount : function(serviceAccountId) {
		var ldcGR = new GlideRecord('cmdb_ci_logical_datacenter');
		var relGR = ldcGR.addJoinQuery('cmdb_rel_ci', 'sys_id', 'parent');
		relGR.addCondition('child', serviceAccountId);
		relGR.addCondition('type', new CloudResourceDiscoveryUtil().getRelTypeId('Hosted on::Hosts'));
		ldcGR.query();

		return ldcGR.getRowCount();
	},

	getSpecificDCsForSchedule : function(serviceAccountId, scheduleId) {
		var ldcConfigGR = new GlideRecord('cmp_discovery_ldc_config');
		ldcConfigGR.addQuery('discovery_schedule',scheduleId);
		ldcConfigGR.addQuery('service_account',serviceAccountId);
		var relCIGR = ldcConfigGR.addJoinQuery('cmdb_rel_ci', 'service_account', 'child');
		relCIGR.addCondition('type', new CloudResourceDiscoveryUtil().getRelTypeId('Hosted on::Hosts'));
		ldcConfigGR.query();

		return ldcConfigGR.getRowCount();
	},

   /**
   * API fetches count of each resource type for the given discovery status and resource name
   *
   * @discoveryStatusId – Identifies the discovery status uniquely
   *
   * Sample JSON
   * -----------------
      {
         "count": 135,
         "resourceInfo": [{
            "resourceTable": "cmdb_ci_vm_instance",
            "resourceName": "Virtual Machine Instance",
            "count": "30"
         }]
      }
   *
   */
   getResourceInfo : function(discoveryStatusId, resourceTableName) {
      var resourceTypeList = [];
      var cloudResultsGR = new GlideRecord('discovery_cloud_results');

      // Add filter for hidding logical datacenter data in discovery visualization page
      if (JSUtil.nil(resourceTableName) || (resourceTableName != 'cmdb_ci_logical_datacenter'))
        cloudResultsGR.addQuery('cloud_resource_name', '!=', 'cmdb_ci_logical_datacenter');

      // Hidding azure subscription data in discovery visualization page, all the time
      cloudResultsGR.addQuery('cloud_resource_name', '!=', 'cmdb_ci_azure_subscription');


	  if (JSUtil.notNil(resourceTableName))
		  cloudResultsGR.addQuery('cloud_resource_name', resourceTableName);

      cloudResultsGR.addQuery('cloud_resource_count', '!=', 0);
	  cloudResultsGR.orderByDesc('cloud_resource_count');

      var statusGR = cloudResultsGR.addJoinQuery('discovery_status', 'status' ,'sys_id');
      statusGR.addCondition('sys_id', discoveryStatusId);

      cloudResultsGR.query();

      var totalcount = 0;
      while (cloudResultsGR.next()) {
        //gs.tableExists(cloudResultsGR.getValue('cloud_resource_name')) -> Checking the cloud resource table exists due to sometime time invalid cloud resource name(e.g. Lable[null]) inserted in the 'discovery_cloud_results'.
         if (gs.tableExists(cloudResultsGR.getValue('cloud_resource_name')) && cloudResultsGR.getValue('cloud_resource_name')) {
            totalcount = parseInt(totalcount) + parseInt(cloudResultsGR.getValue('cloud_resource_count'));
            resourceTypeList.push({
               resourceTable: cloudResultsGR.getValue('cloud_resource_name'),
               resourceName: new GlideRecord(cloudResultsGR.getValue('cloud_resource_name')).getLabel(),
               count: cloudResultsGR.getValue('cloud_resource_count')
            });
         }
      }

      var result = {
         totalcount : totalcount,
         resourceInfo: resourceTypeList
      };
      return result;
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

    aggregateCount: function(categories) {
		var count = 0;
		categories.forEach(function(category) {count += category.errorNumber;});
		return count;
	},

	getDiscoveredDevicesCountByStatus: function(discoStatusId, deviceType) {
		var deviceCount = 0;
		if(gs.tableExists('tracking_devices_by_disco_status')) {
			//tracking_devices_by_disco_status table is available, if cloud workspace plugin was installed
			var grDevices = new GlideRecord('tracking_devices_by_disco_status');
			grDevices.addQuery('disco_status', discoStatusId);
			grDevices.addQuery('device_type', deviceType);//new or absent
			grDevices.query();
			deviceCount = grDevices.getRowCount();
		}
		return deviceCount;
	},

	discoStatusDuration: function (discoStatusGr) {
		if(discoStatusGr.getValue('state') == 'Completed' || discoStatusGr.getValue('state') == 'Canceled')
			return discoStatusGr.getDisplayValue('duration');
		else {
			var startTime = new GlideDateTime(discoStatusGr.getValue('sys_created_on'));
			var currentTime = new GlideDateTime();
			var duration = GlideDateTime.subtract(startTime, currentTime); //the difference between startTime and currentTime
			return duration.getDisplayValue();
		}
	},

	type: 'DiscoveryScheduleManager'
};
