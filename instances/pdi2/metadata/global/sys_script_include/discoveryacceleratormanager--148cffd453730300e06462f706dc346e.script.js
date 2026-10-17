var DiscoveryAcceleratorManager = Class.create();
DiscoveryAcceleratorManager.prototype = {

    initialize: function() {
		this.discoveryCredentialTypes = '';
    },

	_getAcceleratorRunFlowRecord: function(accelConfigSysId) {
		var accelRunGlideRecord = new GlideRecord('discovery_accel_config');
		if (accelConfigSysId) {
			if (accelRunGlideRecord.get('sys_id', accelConfigSysId))
				return accelRunGlideRecord;
			return null;
		}

		accelRunGlideRecord.query();
		accelRunGlideRecord.next();
		return accelRunGlideRecord;
	},

	_createAcceleratorRunFlowRecord: function(scheduleData) {
		var accelRunGlideRecord = new GlideRecord('discovery_accel_config');
		accelRunGlideRecord.setValue('active', scheduleData.active);
		accelRunGlideRecord.setValue('run_type',scheduleData.runType);
		accelRunGlideRecord.setValue('location_based',scheduleData.locationBased);

		if (JSUtil.notNil(scheduleData.runTime))
			accelRunGlideRecord.setValue('run_time', scheduleData.runTime);

		if (JSUtil.notNil(scheduleData.runPeriod))
			accelRunGlideRecord.setValue('run_period', new GlideDateTime(scheduleData.runPeriod));
		else
			accelRunGlideRecord.setValue('run_period', "");

		if (JSUtil.notNil(scheduleData.runStart))
			accelRunGlideRecord.setValue('run_start', scheduleData.runStart);

		if (JSUtil.notNil(scheduleData.runDayOfWeek))
			accelRunGlideRecord.setValue('run_dayofweek', scheduleData.runDayOfWeek);

		if (JSUtil.notNil(scheduleData.runDayOfMonth))
			accelRunGlideRecord.setValue('run_dayofmonth', scheduleData.runDayOfMonth);

		if (JSUtil.notNil(scheduleData.maxRun))
			accelRunGlideRecord.setValue('max_run', new GlideDateTime(scheduleData.maxRun));
		else
			// Empty max_run will result the following error in Discovery Log: Failed to parse max_run into a Date object
			// This is why we put a new date
			accelRunGlideRecord.setValue('max_run', new GlideDateTime(new Date(0)));

		accelRunGlideRecord.insert();
		return accelRunGlideRecord;
	},

	getFlowData: function() {
		return {
			credentialTypes: this._getDiscoveryCredentialTypes(),
			credentials: this._getDiscoveryCredentials(),
			preferredSelectedCredential: 'windows_credentials',
			schedule: {},
			routerLocations: this._getLocationsData()
		};
	},

	//_getDiscoveryCredentialTypes needs to be called first before this function is being called
	//make sure discoveryCredentialTypes are populated so only discovery relavent credentials are returned
	_getDiscoveryCredentials: function() {
		var creds = [];
		var credGlideRecord = new GlideRecord('discovery_credentials');
		credGlideRecord.addQuery('sys_class_name','IN', this.discoveryCredentialTypes);
		credGlideRecord.query();

		while (credGlideRecord.next()) {
			var cred = {};

			cred.sysId = credGlideRecord.getUniqueValue() + '';
			cred.type = credGlideRecord.type + '';
			cred.name = credGlideRecord.name + '';
			cred.userName = credGlideRecord.user_name + '';
			cred.sysClassName = credGlideRecord.sys_class_name + '';
			cred.active = !!credGlideRecord.active;

			creds.push(cred);
		}

		return creds;
	},

	_getDiscoveryCredentialTypes: function() {
		var credTypes = [];
		this.discoveryCredentialTypes = '';
		var gr = new GlideRecord("credential_type_metadata");
		gr.addQuery("applies_to","ip");
		gr.query();
		while(gr.next()) {
			var credType = {};
			credType.label = gr.credential_type + '';
			credType.type = gr.credential_type + '';

			//Get table label
			var grDb = new GlideRecord("sys_db_object");
			grDb.addQuery("name",gr.credential_type + '');
			grDb.query();
			if(grDb.next())
				credType.label = grDb.label + '';
			credTypes.push(credType);


			this.discoveryCredentialTypes += credType.type;
			if(gr.hasNext())
				this.discoveryCredentialTypes += ',';

		}
		return credTypes;
	},

	saveSchedule: function(scheduleData) {
		return this._saveSchedule(scheduleData);
	},

	_saveSchedule: function(scheduleData) {
		if (scheduleData.runType == 'periodically' && JSUtil.nil(scheduleData.runPeriod)) {
			return {
				success: false,
				message: 'Run period must not be empty'
			};
		}

		var errorMessage = '';
		var accelConfigSysId;

		var accelRunGlideRecord = this._createAcceleratorRunFlowRecord(scheduleData);
		success = accelRunGlideRecord.isValidRecord();
		errorMessage = success ? '' : 'Error while updating schedule config record. Please check System Log for more information';

		if (success) {
			accelConfigSysId = accelRunGlideRecord.getValue('sys_id');
			success = this._createOrUpdateDiscoverySchedules(accelConfigSysId);
			errorMessage = success ? '' : 'Error while creating/updating Discovery Schedule. Please check System Log for more information';
		}

		return {
			success: success,
			accelConfigSysId: accelConfigSysId,
			message: errorMessage
		};

	},

	assignLocationToRouters: function(assignmentData) {
		var networkDevicesGlideRecord = new GlideRecord('cmdb_ci_netgear'),
			locationGlideRecord = new GlideRecord('cmn_location'),
			errorMessage = '',
			numRoutersCantBeUpdated = 0,
			numUpdatedRouters = 0,
			locationSysId = assignmentData.location,
			routers = assignmentData.routers;

		if (!locationSysId || !locationGlideRecord.get('sys_id', locationSysId)) {
			errorMessage = 'Location doesn\'t exist';
		} else if ( !routers ) {
			errorMessage = 'No routers selected';
		} else {
			networkDevicesGlideRecord.addQuery('sys_id', 'IN', routers);
			networkDevicesGlideRecord.query();
			numUpdatedRouters = networkDevicesGlideRecord.getRowCount();
			numRoutersCantBeUpdated = routers.split(',').length - numUpdatedRouters;

			if (numRoutersCantBeUpdated > 0)
				errorMessage = numRoutersCantBeUpdated + ' router(s) out of ' + routers.length + ' can\'t be updated';
			networkDevicesGlideRecord.setWorkflow(true);
			networkDevicesGlideRecord.setValue('location', locationSysId);
			networkDevicesGlideRecord.updateMultiple();
		}

		return {
			success: (errorMessage == '') ? true : false,
			message: errorMessage,
			count: numUpdatedRouters
		};
	},

	unassignLocationToRouters: function( routerData ) {
		var routers = routerData.routers;
		var networkDevicesGlideRecord = new GlideRecord('cmdb_ci_netgear'),
			numUpdatedRouters = 0;

		networkDevicesGlideRecord.addQuery('sys_id', 'IN', routers);
		networkDevicesGlideRecord.query();

		while (networkDevicesGlideRecord.next()) {
			networkDevicesGlideRecord.location = '';

			if (networkDevicesGlideRecord.update())
				numUpdatedRouters++;
		}

		return {
			success: true,
			message: '',
			count: numUpdatedRouters
		};
	},

	_getLocationsData: function() {
		var locationsData = {},
			currentTraveresedRouterLocation,
			networkDevicesGlideRecord = new GlideRecord('cmdb_ci_netgear');

		networkDevicesGlideRecord.addQuery('can_route', true);
		networkDevicesGlideRecord.query();

		while (networkDevicesGlideRecord.next()) {
			currentTraveresedRouterLocation = networkDevicesGlideRecord.location + '';
			currentTraveresedRouterLocation = currentTraveresedRouterLocation ? currentTraveresedRouterLocation : 'unassigned';

			if (!locationsData[currentTraveresedRouterLocation]) {
				locationsData[currentTraveresedRouterLocation] = {
					name: (networkDevicesGlideRecord.location) ? networkDevicesGlideRecord.location.name + '' : currentTraveresedRouterLocation,
					routers: [],
					timezone: (networkDevicesGlideRecord.location) ? networkDevicesGlideRecord.location.time_zone + '' : ''
				};
			}

			locationsData[currentTraveresedRouterLocation].routers.push(networkDevicesGlideRecord.getUniqueValue() + '');
		}

		return locationsData;
	},

	_getLocations: function() {
		var locations = [];

		var gr = new GlideAggregate("cmdb_ci_netgear");
		gr.addNotNullQuery("location");
		gr.addQuery('can_route', true);
		gr.groupBy("location");
		gr.query();
		while(gr.next()) {
			locations.push(gr.location + "");
		}

		return locations;
	},


	// Helper method to set all values from accelConfig to the discovery_schedule
	_setScheduleValues: function(scheduleGr,  accelConfigGr, locationSysId) {
		scheduleGr.setValue('max_run', accelConfigGr.max_run);
		scheduleGr.setValue('run_type', accelConfigGr.run_type);
		scheduleGr.setValue('disco_run_type', accelConfigGr.run_type);
		scheduleGr.setValue('run_dayofweek', accelConfigGr.run_dayofweek);
		scheduleGr.setValue('run_dayofmonth', accelConfigGr.run_dayofmonth);
		scheduleGr.setValue('run_period', accelConfigGr.run_period);
		scheduleGr.setValue('active', accelConfigGr.active);
		scheduleGr.setValue('accel_config', accelConfigGr.sys_id);
		scheduleGr.setValue('mid_select_method', 'auto_select');

		// Now do the location based timezone magic.
		var runTime = accelConfigGr.run_time;
		var startTime = accelConfigGr.run_start;
		if (JSUtil.notNil(locationSysId)) {

			// Get timezone of the location
			var locGr = new GlideRecord("cmn_location");
			if (locationSysId)
				locGr.get('sys_id', locationSysId);
			var timeZone = locGr.time_zone;

			// If timezone - set location by timezone otherwise - just proceed
			// We are getting the time in the userLocalTime in UTC. So if the user puts in 1PM
			// and the user is in PTC timezone - you will get run_time of 1PM + 8 hours for UTC - So 21:00:00
			// Here we want to find the difference between the usertimezone and the location time zone and use that
			// as the offset to set the time of when things to run.
			// So that's what we do.
			if (JSUtil.notNil(timeZone)) {

				// Adjust the time accordingly for run_time
				runTime = new GlideDateTime(accelConfigGr.run_time);
				this._convertTime(runTime, timeZone, false);

				// Adjust the time accordingly for startTime
				if (!JSUtil.nil(startTime)) {
					startTime = new GlideDateTime(accelConfigGr.run_start);
					this._convertTime(startTime, timeZone, true);
				}
			}
		}

		scheduleGr.setValue('run_time', runTime);
		scheduleGr.setValue('run_start', startTime);
	},

	// Convert time from current timezone to location timezone
	_convertTime: function(time, timeZone, useTimeForOffset) {

	    /*
		 * This function responsible for converting schedule's time, configured by user's time zone, to the exact same time but on different locations
		 * All calculations are done using winter clock. GlideDateTime class will detect DST time zone, and reduce an hour if needed
		 * Since GlideDateTime supports DTS, we have to take it into consideration when calculating the time for the schedule
		 *
		 * For example:
		 * Pacific user creates a discovery to run at 12am, and he has 3 routers in: San Diego, Hong Kong & London
		 * Schedules should be created as follows:
		 *    a. San Diego schedule should show 12am (8am UTC) - Same as user's time zone
		 *    b. Hong Long schedule should show 8am (4pm UTC) - 8am PST is 12am in Hong Kong
		 *    c. London schedule should show 4pm (12am UTC) - 4pm PST is 12am in London
		 *
		 * Remember, all times calculated are in winter clock: London is GMT, Hong Kong stays the same (no DST all year) & Pacific is PST (not PDT)
		 */
		var gdtOffset,
			dstOffsetInMs = 0;
		if (useTimeForOffset)
			gdtOffset = time;
		else
			gdtOffset = new GlideDateTime();

		// In case a time zone is currently DST, we need to save DST offset
		// In this case it is user's time zone DST offset
		dstOffsetInMs = gdtOffset.getDSTOffset();

		// "userOffset" will be -8 hours for PST
		// When we are in winter clock, the calculatio will be: -8h - 0h DST offset
		// When we are in DST, the calculatio will be: -7h - 1h DST offset
		userOffset = gdtOffset.getTZOffset() - dstOffsetInMs;

		// Set GlideDateTime time zone to be location's time zone - For example London
		var tz = Packages.java.util.TimeZone.getTimeZone(timeZone);
		gdtOffset.setTZ(tz);

		// In case a time zone is currently DST, we need to save DST offset
		// In this case it is location's time zone DST offset
		dstOffsetInMs = gdtOffset.getDSTOffset();

		// "locationOffset" will be 0 hours for London
		// When we are in winter clock, the calculatio will be: 0h - 0h DST offset
		// When we are in DST, the calculatio will be: 1h - 1h DST offset
		var locationOffset = gdtOffset.getTZOffset() - dstOffsetInMs;

		// Subtract the 2 - so above example it will be -8 hours
		var offset = userOffset - locationOffset;

		// Final calculation for London -
		// 12am PST = 8am UTC + (-8h offset) = 12am UTC = 4pm PST = 12am GMT (London's winter time)
		time.setNumericValue(time.getNumericValue() + offset);
	},

	// Update the discovery_schedule record with new accelerator config changes.
	_updateDiscoverySchedule: function(scheduleGr, accelConfigGr, locationSysId) {
		this._setScheduleValues(scheduleGr, accelConfigGr, locationSysId);
		scheduleGr.update();
	},

	// Create the discovery_schedule record with the accleartor config changes
	_createDiscoverySchedule: function(accelConfigGr, locationSysId) {
		var gr = new GlideRecord("discovery_schedule");
		gr.initialize();

		//
		// Set location, schedule name, and rest of values
		//
		if (JSUtil.notNil(locationSysId)) {
			gr.setValue('location', locationSysId);
		}

		gr.setValue('name', this._getScheduleName(locationSysId));
		this._setScheduleValues(gr, accelConfigGr, locationSysId);

		// go ahead and insert
		gr.insert();
	},

	// Set the name of the schedule
	_getScheduleName: function(locationSysId) {
		// If location there - then try to get location name
		if (JSUtil.notNil(locationSysId)) {

			var locationGr = new GlideRecord("cmn_location");
			if (locationSysId && locationGr.get('sys_id', locationSysId))
				return "Auto schedule " + locationGr.name;
			else
				return "Auto schedule " + locationSysId;
		}

		return "Auto schedule";
	},

	// Inactivate system schedule created in K
	_inactivateSystemSchedule: function() {
		var gr = new GlideRecord("discovery_schedule");
		gr.addQuery("was_created_by_system", true);
		gr.query();
		if (gr.next()) {
			gr.setValue("active", false);
			gr.update();
		}
	},

	// create or update the discovery schedules
	_createOrUpdateDiscoverySchedules: function(accelConfigSysId) {
		// Get the discovery_accel_config config, init, and getLocations we need to create schedules for.
		var accelConfigGr = this._getAcceleratorRunFlowRecord(accelConfigSysId);
		if (accelConfigGr == null)
			return false;

		var gr = new GlideRecord("discovery_schedule");
		gr.addQuery("accel_config", accelConfigGr.sys_id);
		gr.query();

		// Handle if location
		if (!!accelConfigGr.location_based) {
			var locationsToCreate = this._getLocations();

			//
			// Go through all the schedules already created and see if we need to update them or delete them
			//
			while (gr.next()) {
				var locationSysId = gr.location + '';

				// delete record if we don't have any routers in this location anymore else update it
				var index = locationsToCreate.indexOf(locationSysId);
				if (index == -1) {
					gr.deleteRecord();
				}
				else {
					// remove it from the list
					locationsToCreate.splice(index, 1);
					this._updateDiscoverySchedule(gr, accelConfigGr, locationSysId);
				}
			}

			//
			// Let's create any that we have not updated
			//
			for (var i=0; i < locationsToCreate.length; i++) {
				this._createDiscoverySchedule(accelConfigGr, locationsToCreate[i]);
			}
		}
		else { // No location schedule

			// Did we update the schedule?
			var scheduleUpdated = false;

			//
			// Go through all the schedules already created and see if we need to update them or delete them
			//
			while (gr.next()) {


				if (JSUtil.nil(gr.location + '')) {
						this._updateDiscoverySchedule(gr, accelConfigGr);
						scheduleUpdated = true;
				}
				else
					gr.deleteRecord();
			}

			// Create schedule if there are none for non-location
			if (!scheduleUpdated)
				this._createDiscoverySchedule(accelConfigGr);
		}

		this._inactivateSystemSchedule();
		return true;
	},

	triggerDiscoveryNow: function() {
		var accelConfigGr = this._getAcceleratorRunFlowRecord();
	    	if (!accelConfigGr || !accelConfigGr.sys_id)
	    		return;
	    
		var disco = new Discovery();
	    
		var gr = new GlideRecord("discovery_schedule");
		gr.addQuery("accel_config", accelConfigGr.sys_id);
		gr.query();
		while (gr.next())
			disco.discoverNow(gr);
	},

	saveAndRunDiscovery: function(scheduleData) {
		var result = this._saveSchedule(scheduleData);
		if (!result.success)
			return result;

		var accelConfigGr = this._getAcceleratorRunFlowRecord(result.accelConfigSysId);
		if (accelConfigGr == null)
			return {
				success: false,
				message: "Couldn't find expected discovery_accel_config record. Please check System Log for more details."
			};

		var disco = new Discovery();

		var gr = new GlideRecord("discovery_schedule");
		gr.addQuery("accel_config", accelConfigGr.sys_id);
		gr.query();

		while(gr.next()) {
			disco.discoverNow(gr);
		}

		return {
			success: true,
            message: ''
		};
	},

    type: 'DiscoveryAcceleratorManager'
};
