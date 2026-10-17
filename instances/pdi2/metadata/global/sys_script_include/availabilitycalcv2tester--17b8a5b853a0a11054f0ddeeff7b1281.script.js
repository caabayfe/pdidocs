var AvailabilityCalcV2Tester = Class.create();
AvailabilityCalcV2Tester.prototype = {
	initialize: function() {
		this.SCENARIO;
		this.LOGS = true;
		this.PLANNED_OUTAGES = true;
	},
	/**
	 * Prints outages in user-friendly (session tz format) from numeric values
	 * @param {Array} outages
	 */
	_printOutages: function(outages) {
		this._gslog('### RESULTS ###');
		var outageCount = 0;
		var begin = new GlideDateTime();
		var end = new GlideDateTime();
		for (var i = 0; i < outages.length; i++) {
			if (this.PLANNED_OUTAGES || outages[i].type == 'outage') {
				this._gslog('Outage '+(i+1) + ' - Type: '+outages[i].type);
				begin.setNumericValue(outages[i].begin);
				this._gslog('Begin: '+begin.getDisplayValue());
				end.setNumericValue(outages[i].end);
				this._gslog('End: '+end.getDisplayValue());
				outageCount++;
			}
		}
		this._gslog('Total Outages: '+outageCount);
	},
	/**
	 * Wrapper around gs.info
	 * @param {*} message
	 */
	_gslog: function(message) {
		if (this.LOGS)
			gs.info(message);
	},
	/**
	 * Method that contains set scenarios for testing
	 * Format of scenario:
	 * {
	 * 	begin: {String} Date in ISO format,
	 * 	end: {String} Date in ISO format,
	 * 	type: {String} Outage type as
	 * }
	 * @param {Number|String} scenario
	 * @returns {Array} Returns array containing either all scenarios or a specific scenario
	 */
	_mdsScenarios: function(scenario) {
		// Dataset is in order, meaning first element in array will be scenario 1, and so on
		var dataSet = [
			// Scenario 1 - 1 Outage. No Planned outages
			{
				workingData: [
					{begin: '2023-01-25 18:00:00', end: '2023-01-25 22:00:00', type: 'outage'}, // 10AM to 2PM PST
				],
				expectedData: [
					{begin: '2023-01-25 18:00:00', end: '2023-01-25 22:00:00', type: 'outage'}, // 10AM to 2PM PST
				]
			},
			// Scenario 2 - 0 Outages. 1 Planned outages
			{
				workingData:[
					{begin: '2023-01-25 18:00:00', end: '2023-01-25 22:00:00', type: 'planned'}, // 10 AM to 2PM PST
				],
				expectedData:[
					{begin: '2023-01-25 18:00:00', end: '2023-01-25 22:00:00', type: 'planned'}, // 10 AM to 2PM PST
				]
			},
			// Scenario 3 - 1 Outages. 1 Planned outages
			{
				workingData:[
					{begin: '2023-01-25 18:00:00', end: '2023-01-25 22:00:00', type: 'outage'}, // 10 AM to 2PM PST
					{begin: '2023-01-25 18:00:00', end: '2023-01-25 22:00:00', type: 'planned'}, // 11 AM to 2PM PST
				],
				expectedData:[
					// Empty array
				]
			},
			// Scenario 4 - 1 Outages. 1 Planned outages
			{
				workingData:[
					{begin: '2023-01-25 18:00:00', end: '2023-01-25 22:00:00', type: 'outage'}, // 10 AM to 2PM PST
					{begin: '2023-01-25 19:00:00', end: '2023-01-25 22:00:00', type: 'planned'}, // 11 AM to 2PM PST
				],
				expectedData:[
					{begin: '2023-01-25 18:00:00', end: '2023-01-25 19:00:00', type: 'outage'}, // 10 AM to 11AM PST
				]
			},
			// Scenario 5 - 1 Outages. 1 Planned outages
			{
				workingData:[
					{begin: '2023-01-25 18:00:00', end: '2023-01-25 22:00:00', type: 'outage'}, // 10 AM to 2PM PST
					{begin: '2023-01-25 20:00:00', end: '2023-01-25 22:00:00', type: 'planned'}, // 12 PM to 2PM PST
				],
				expectedData:[
					{begin: '2023-01-25 18:00:00', end: '2023-01-25 20:00:00', type: 'outage'}, // 10 AM to 12PM PST
				]
			},
		];

		if (scenario === 'all')
			return dataSet;
		else
			return [dataSet[scenario - 1]];
	},
	/**
	 * Selects scenario
	 * @param {Number|String} scenario Returns selected scenario to process. Number for specific scenario. String 'all' for all scenarios
	 * @returns {Array}
	 */
	_mdsGetDataSet: function(scenario) {
		this._gslog('SCENARIO'+JSON.stringify(this._mdsScenarios(scenario))+' - scenario:'+scenario);
		if (this._mdsScenarios(scenario))
			return this._mdsScenarios(scenario);
		else
			throw 'Not a valid data set';
	},
	/**
	 * Generates short description given a scenario to run
	 * @param {Number} scenario
	 * @returns
	 */
	_mdsGenerateOutageShortDesc: function(scenario) {
		return '@@@ [NewAv] Scenario #'+scenario+' Outage';
	},
	/**
	 * Creates demo CI
	 * @param {String} ciClass service_offering | cmdb_ci_service_auto
	 * @param {*} index
	 * @returns
	 */
	_mdsCreateCi: function(ciClass, index) {
		var ci = new GlideRecord(ciClass);
		var ciData = this._mdsGetCiFieldValues(ciClass, index);
		if (!ciData)
			throw '[_mdsCreateCi]: Invalid ciClass';
		var dataKeys = Object.keys(ciData);
		for (var i = 0; i < dataKeys.length; i++) {
			ci.setValue(dataKeys[i], ciData[dataKeys[i]]);
		}
		return ci.insert();
	},
	/**
	 * Creates a service_commitment for demo data
	 * @returns {String} sys_id of the created commitment
	 */
	_mdsCreateCommitment: function() {
		var commit = new GlideRecord('service_commitment');
		commit.setValue('availability', '99.9');
		commit.setValue('name', '[AV] 99.9% Availability 24x7');
		commit.setValue('breach_penalty_amount', '100');
		commit.setValue('schedule', '38fa64edc0a8016400f4a5724b0434b8'); //Existing ref to 24x7 schedule
		commit.setValue('type', 'availability');
		return commit.insert();
	},
	/**
	 * Rounds specified scenario and populates in DB (outages/ci/commitment)
	 * @param {Number|String} scenario Either number of scenario to create or 'all' to populate all data
	 * @param {String} ciClass service_offering | cmdb_ci_service_auto
	 * @param {GlideDateTime} dateGDT date to override
	 * @returns
	 */
	_mdsRunDataSet: function(scenario, ciClass, dateGDT) {
		var dataSet = this._mdsGetDataSet(scenario);
		var createdOutages = this._mdsCreateOutageRecords(scenario, ciClass, dataSet, dateGDT);
		// Convert outage to a format _processOutage can read
		return createdOutages;
	},
	/**
	 * Adds specific number to run
	 * @param {String} ciClass service_offering | cmdb_ci_service_auto
	 * @param {Number} index
	 * @returns
	 */
	_mdsGetCiFieldValues: function(ciClass, index) {
		function generateValues(values, index) {
			if (!index)
				index = new GlideDateTime() + ''; // Convert GDT to string date
			var valueKeys = Object.keys(values);
			for(var i = 0; i < valueKeys.length; i++) {
				if (values[valueKeys[i]].numerated)
					values[valueKeys[i]] = values[valueKeys[i]].value +' '+ index;
				else
					values[valueKeys[i]] = values[valueKeys[i]].value;
			}
			return values;
		}
		var valueSet = {
			'service_offering': {
				'parent': {value: '28c15c94c0a8000b003c7f9cdbd4b5f0'}, // "Retail" (cmdb_ci_service)
				'name': {value: '[AV] Demo Service Offering', numerated: true}
			},
			'cmdb_ci_auto': {} // TODO
		};
		return generateValues(valueSet[ciClass], index);
	},
	/**
	 * Creates outages with specified data set
	 * @param {Number} scenario
	 * @param {String} ciClass service_offering | cmdb_ci_service_auto
	 * @param {Array} outageData
	 * @returns
	 */
	_mdsCreateOutageRecords: function(scenario, ciClass, outageData) {
		this._gslog('@@@ passedData'+JSON.stringify(outageData));
		if (!outageData)
			throw '[_mdsCreateOutageRecord]: No outageData passed';

		var cmdbCi = this._mdsCreateCi(ciClass);
		if (!cmdbCi)
			throw '[_mdsCreateOutageRecord]: Could not create ci';

		var scenariosOutages = [];
		// Loop over all selected scenarios to create
		for(var i = 0; i < outageData.length; i++) {
			// Array where we store created GR outages
			var transformedOutages = [];
			var currentOutageData = outageData[i].workingData; // Holds scenario outage objects to create
			// Loop through each outage object in current scenario and create record
			for (var j = 0; j < currentOutageData.length; j++) {
				var localBegin = new GlideDateTime(currentOutageData[j].begin);
				var localEnd = new GlideDateTime(currentOutageData[j].end);
				var outageGr = new GlideRecord('cmdb_ci_outage');
				outageGr.setValue('begin', localBegin);
				outageGr.setValue('end', localEnd);
				outageGr.setValue('cmdb_ci', cmdbCi);
				outageGr.setValue('type', currentOutageData[j].type);
				outageGr.setValue('short_description', this._mdsGenerateOutageShortDesc(scenario));
				if (outageGr.insert())
					transformedOutages.push({
						// Get outages numeric values (in millis) for further processing
						createdOutage: this._mdsTransformOutageToTimestampFormat(outageGr),
						dateTimes: {begin: localBegin, end: localEnd}
					});
			}
			scenariosOutages.push(transformedOutages);
		}
		return scenariosOutages;
	},
	/**
	 * Gets UNIX timestamp representation of GlideDateTime
	 * @param {GlideRecord} outageGr extracts UNIX timestamp in millis
	 * @returns {Object}
	 */
	_mdsTransformOutageToTimestampFormat: function(outageGr) {
		return {
			begin: outageGr.begin.getGlideObject().getNumericValue(),
			end: outageGr.end.getGlideObject().getNumericValue(),
			type: outageGr.getValue('type')
		};
	},
	/**
	 * Prints outages in array
	 * @param {Array} outages
	 * @param {Boolean} typeOutageOnly if true only prints outages of type "outage"
	 */
	_mdsPrintOutOutages: function(outages, typeOutageOnly) {
		for (var i = 0 ; i < outages.length; i++){
			if (typeOutageOnly && outages[i].type !== 'outage')
				continue;
			var begin = new GlideDateTime();
			var end = new GlideDateTime();
			begin.setNumericValue(outages[i].begin);
			end.setNumericValue(outages[i].end);
			this._gslog('Outage #'+i+' - Begin: '+begin.getDisplayValue()+' | End: '+end.getDisplayValue()+' | Type: '+outages[i].type);
		}
	},
	/**
	 * Prints outages from object {begin,end,type} form to user-friendly dates
	 * @param {Array} outages
	 * @returns
	 */
	_mdsPrintOutagesInReadableFormat: function(outages) {
		var convertedOutages = [];
		for (var i = 0; i < outages.length; i++) {
			var begin = new GlideDateTime();
			begin.setNumericValue(outages[i].begin);
			this._gslog(begin.getDisplayValue());
			var end = new GlideDateTime();
			end.setNumericValue(outages[i].end);
			this._gslog(end.getDisplayValue());
			convertedOutages.push({begin: begin, end: end, type: outages[i].type});
		}
		return convertedOutages;
	},
	/**
	 * Runs specific data generation or all
	 * @param {Number|String} scenario Number of scenario or 'all'
	 * @param {String} ciClass service_offering | cmdb_ci_service_auto
	 * @param {GlideDateTime} dateGDT date to override
	 * @returns
	 */
	mockDatasetGenerator: function(scenario, ciClass, dateGDT) {
		this.SCENARIO = scenario;
		this._gslog('@SCENARIO:' +this.SCENARIO);
		try {
			var oldTZ = gs.getSession().getTimeZoneName();
			var defaultTZ = GlideUser.getSysTimeZone();
			gs.getSession().setTimeZoneName(defaultTZ);
			// Check a date was passed else default to today;
			dateGDT = dateGDT || new GlideDateTime();
			var outages = this._mdsRunDataSet(scenario, ciClass, dateGDT);
			this._gslog('@@ RETURN OUTAGES:' +JSON.stringify(outages));
			return outages;
		} catch(e) {
			this._gslog('[AV2 DemoData] Error: '+e);
		} finally {
			gs.getSession().setTimeZoneName(oldTZ);
		}
	},
	/*
	UTILS
	*/
	/**
	 * Deletes outages to have a clean run
	 * @param {Boolean} all Delete all outages in cmdb_ci_outage table
	 */
	_utDeleteAllOutages: function(all) {
		var gr = new GlideRecord('cmdb_ci_outage');
		if (!all)
			gr.addEncodedQuery('cmdb_ci.nameLIKE[AV]');
		gr.deleteMultiple();
	},
	/**
	 * Deletes offerings to have a clean run
	 * @param {Boolean} all Delete all offerings in service_offering table
	 */
	_utDeleteOfferings: function(all) {
		var gr = new GlideRecord('service_offering');
		if (!all)
			gr.addEncodedQuery('cmdb_ci.nameLIKE[AV]');
		gr.deleteMultiple();
	},
	type: 'AvailabilityCalcV2Tester',
};
