var AvailabilityOutageProcessorTester = Class.create();
AvailabilityOutageProcessorTester.prototype = {
	initialize: function() {
		this.LOGS = true;
		this.DESCRIPTION = true;
		this.VERSION = 'v2';
		this.OUTAGE_DATA = [
			// Same type outage cases. Merge/Ignore (for planned outages)
			{
				label: '10',
				labelNumber: 10,
				description: 'Single outage',
				workingData: [
					{begin: 10, end: 11, type: 'outage'},
				],
				expectedData: [
					{begin: 10, end: 11, type: 'outage'},
				],
			},
			{
				label: '11',
				labelNumber: 11,
				description: 'Single planned outage',
				workingData: [
					{begin: 10, end: 11, type: 'planned'},
				],
				expectedData: [],
			},
			{
				label: '20',
				labelNumber: 20,
				description: 'Overlapping (same start/end) planned outage',
				workingData: [
					{begin: 10, end: 11, type: 'planned'},
					{begin: 10, end: 11, type: 'planned'},
				],
				expectedData: [],
			},
			{
				label: '30',
				labelNumber: 30,
				description: 'Overlapping (end/begin) outages. Merge into 1 outage',
				workingData: [
					{begin: 10, end: 11, type: 'outage'},
					{begin: 11, end: 12, type: 'outage'},
				],
				expectedData: [
					{begin: 10, end: 12, type: 'outage'},
				],
			},
			{
				label: '40',
				labelNumber: 40,
				description: 'Overlapping. Merge into 1 outage',
				workingData: [
					{begin: 10, end: 13, type: 'outage'},
					{begin: 11, end: 12, type: 'outage'},
				],
				expectedData: [
					{begin: 10, end: 13, type: 'outage'},
				],
			},
			// Build longest planned outage tests
			{
				label: '50',
				labelNumber: 50,
				description: 'Overlapping planned outage',
				workingData: [
					{begin: 10, end: 13, type: 'planned'},
					{begin: 11, end: 12, type: 'planned'},
				],
				expectedData: [],
			},
			{
				label: '51',
				labelNumber: 51,
				description: 'Overlapping planned outage II', // Tests build longest planned outage
				workingData: [
					{begin: 10, end: 11, type: 'planned'},
					{begin: 11, end: 14, type: 'planned'},
					{begin: 13, end: 15, type: 'planned'},
				],
				expectedData: [],
			},
			{
				label: '52',
				labelNumber: 52,
				description: 'Overlapping planned outage III', // Tests build longest planned outage
				workingData: [
					{begin: 10, end: 11, type: 'planned'},
					{begin: 11, end: 14, type: 'planned'}, // Test begin and end (upper boundary) is same
					{begin: 14, end: 15, type: 'planned'},
				],
				expectedData: [],
			},
			{
				label: '53',
				labelNumber: 53,
				description: 'Overlapping planned outage IV', // Tests build longest planned outage
				workingData: [
					{begin: 10, end: 13, type: 'planned'}, // Test begin and end (upper boundary) is same
					{begin: 11, end: 14, type: 'planned'}, // Test begin and end (upper boundary) is same
					{begin: 14, end: 15, type: 'planned'},
				],
				expectedData: [],
			},
			{
				label: '54',
				labelNumber: 54,
				description: 'Overlapping planned outage V', // Tests build longest planned outage
				workingData: [
					{begin: 10, end: 11, type: 'planned'},
					{begin: 12, end: 14, type: 'planned'}, // Test outside range

				],
				expectedData: [],
			},
			{
				label: '60',
				labelNumber: 60,
				description: 'Planned outage splits outage',
				workingData: [
					{begin: 5, end: 10, type: 'outage'},
					{begin: 6, end: 7, type: 'planned'},
				],
				expectedData: [
					{begin: 5, end: 6, type: 'outage'},
					{begin: 7, end: 10, type: 'outage'},
				],
			},
			{
				label: '70',
				labelNumber: 70,
				description: 'Overlapping outages (diff type). Begin is same date',
				workingData: [
					{begin: 5, end: 10, type: 'outage'},
					{begin: 5, end: 7, type: 'planned'},
				],
				expectedData: [
					{begin: 7, end: 10, type: 'outage'},
				],
			},
			// Different type outage cases.
			{
				label: '100',
				labelNumber: 100,
				description: 'Same begin/end for outage and planned',
				workingData: [
					{begin: 10, end: 14, type: 'outage'},
					{begin: 10, end: 14, type: 'planned'},
				],
				expectedData: [],
			},
			{
				label: '101',
				labelNumber: 101,
				description: 'Same begin/end for outage and planned, order reversed',
				workingData: [
					{begin: 10, end: 14, type: 'planned'},
					{begin: 10, end: 14, type: 'outage'},
				],
				expectedData: [],
			},
			{
				label: '110',
				labelNumber: 110,
				description: 'Trim end. Overlapping outage by 1 hr',
				workingData: [
					{begin: 10, end: 14, type: 'outage'},
					{begin: 11, end: 14, type: 'planned'},
				],
				expectedData: [
					{begin: 10, end: 11, type: 'outage'},
				],
			},
			{
				label: '120 - #5',
				labelNumber: 120,
				description: 'Trim begin. Overlapping outage by 2 hrs',
				workingData: [
					{begin: 10, end: 14, type: 'outage'},
					{begin: 10, end: 12, type: 'planned'},
				],
				expectedData: [
					{begin: 12, end: 14, type: 'outage'},
				],
			},
			{
				label: '121 - #5 inv',
				labelNumber: 121,
				description: 'Trim begin. Overlapping outage by 2 hrs. Reverse order',
				workingData: [
					{begin: 10, end: 12, type: 'planned'},
					{begin: 10, end: 14, type: 'outage'},
				],
				expectedData: [
					{begin: 12, end: 14, type: 'outage'},
				],
			},
			{
				label: '130 - #6',
				labelNumber: 130,
				description: 'Split outage into 2 (Planned outage in the middle)',
				workingData: [
					{begin: 10, end: 14, type: 'outage'},
					{begin: 11, end: 13, type: 'planned'},
				],
				expectedData: [
					{begin: 10, end: 11, type: 'outage'},
					{begin: 13, end: 14, type: 'outage'},
				],
			},
			{
				label: '140 - #7',
				labelNumber: 140,
				description: 'Overlapping outages. Merge outages',
				workingData: [
					{begin: 10, end: 12, type: 'outage'},
					{begin: 11, end: 14, type: 'outage'},
				],
				expectedData: [
					{begin: 10, end: 14, type: 'outage'},
				],
			},
			{
				label: '150 - #8',
				labelNumber: 150,
				description: 'Non overlapping outages',
				workingData: [
					{begin: 10, end: 11, type: 'outage'},
					{begin: 12, end: 14, type: 'outage'},
				],
				expectedData: [
					{begin: 10, end: 11, type: 'outage'},
					{begin: 12, end: 14, type: 'outage'},
				],
			},
			{
				label: '160 - #9',
				labelNumber: 160,
				description: 'Split 2nd outage',
				workingData: [
					{begin: 10, end: 12, type: 'outage'},
					{begin: 11, end: 14, type: 'outage'},
					{begin: 12, end: 13, type: 'planned'},
				],
				expectedData: [
					{begin: 10, end: 12, type: 'outage'},
					{begin: 13, end: 14, type: 'outage'},
				],
			},
			{
				label: '170 - #10',
				labelNumber: 170,
				description: 'Overlapping cases. No outages should be created',
				workingData: [
					{begin: 10, end: 12, type: 'outage'},
					{begin: 10, end: 12, type: 'planned'},
					{begin: 11, end: 14, type: 'outage'},
					{begin: 12, end: 14, type: 'planned'},
				],
				expectedData: [],
			},
			{
				label: '171 - #10 diff order',
				labelNumber: 171,
				description: 'Merge planned outages. Resulting planned outage covers all outages',
				workingData: [
					{begin: 10, end: 12, type: 'planned'},
					{begin: 10, end: 12, type: 'outage'},
					{begin: 11, end: 14, type: 'outage'},
					{begin: 12, end: 14, type: 'planned'},
				],
				expectedData: [],
			},
			{
				label: '180 - #11',
				labelNumber: 180,
				description: 'Dedup outage with exact same duration',
				workingData: [
					{begin: 10, end: 12, type: 'outage'},
					{begin: 10, end: 12, type: 'outage'},
				],
				expectedData: [
					{begin: 10, end: 12, type: 'outage'},
				],
			},
			{
				label: '190 - #14',
				labelNumber: 190,
				description: 'Merge all outages with first outage',
				workingData: [
					{begin: 9, end: 14, type: 'outage'},
					{begin: 10, end: 13, type: 'outage'},
					{begin: 11, end: 12, type: 'outage'},
				],
				expectedData: [
					{begin: 9, end: 14, type: 'outage'},
				],
			},
			{
				label: '200 - #15',
				labelNumber: 200,
				description: 'Split first outage and merge upper outage with 2nd outage',
				workingData: [
					{begin: 9, end: 13, type: 'outage'},
					{begin: 10, end: 11, type: 'planned'},
					{begin: 12, end: 14, type: 'outage'},
				],
				expectedData: [
					{begin: 9, end: 10, type: 'outage'},
					{begin: 11, end: 14, type: 'outage'},
				],
			},
			{
				label: '210 - #16',
				labelNumber: 210,
				description: 'Split and merge outages',
				workingData: [
					{begin: 10, end: 17, type: 'outage'},
					{begin: 11, end: 15, type: 'planned'},
					{begin: 12, end: 13, type: 'outage'},
					{begin: 14, end: 16, type: 'outage'},
				],
				expectedData: [
					{begin: 10, end: 11, type: 'outage'},
					{begin: 15, end: 17, type: 'outage'},
				],
			},
			{
				label: '220 - #17',
				labelNumber: 220,
				description: 'Planned outage covers all outages except last (trims it)',
				workingData: [
					{begin: 10, end: 18, type: 'planned'},
					{begin: 11, end: 12, type: 'outage'},
					{begin: 13, end: 15, type: 'outage'},
					{begin: 14, end: 16, type: 'planned'},
					{begin: 17, end: 19, type: 'outage'},
				],
				expectedData: [
					{begin: 18, end: 19, type: 'outage'},
				],
			},
			{
				label: '230 - #18',
				labelNumber: 230,
				description: 'Planned outage covers all outages except last (trims it). Different set',
				workingData: [
					{begin: 10, end: 18, type: 'outage'},
					{begin: 10, end: 18, type: 'planned'},
					{begin: 11, end: 12, type: 'planned'},
					{begin: 13, end: 14, type: 'outage'},
					{begin: 15, end: 17, type: 'planned'},
					{begin: 16, end: 19, type: 'outage'},
				],
				expectedData: [
					{begin: 18, end: 19, type: 'outage'},
				],
			},
			{
				label: '231 - #18 diff order',
				labelNumber: 231,
				description: 'Planned outage covers all outages except last (trims it). Different set',
				workingData: [
					{begin: 10, end: 18, type: 'planned'},
					{begin: 10, end: 18, type: 'outage'},
					{begin: 11, end: 12, type: 'planned'},
					{begin: 13, end: 14, type: 'outage'},
					{begin: 15, end: 17, type: 'planned'},
					{begin: 16, end: 19, type: 'outage'},
				],
				expectedData: [
					{begin: 18, end: 19, type: 'outage'},
				],
			},
			{
				label: '240 - #19',
				labelNumber: 240,
				description: 'Planned outage covers all outages except last (trims it). Different set',
				workingData: [
					{begin: 10, end: 19, type: 'planned'},
					{begin: 11, end: 21, type: 'outage'},
					{begin: 12, end: 13, type: 'planned'},
					{begin: 14, end: 15, type: 'outage'},
					{begin: 16, end: 19, type: 'planned'},
					{begin: 17, end: 18, type: 'outage'},
				],
				expectedData: [
					{begin: 19, end: 21, type: 'outage'},
				],
			},
			{
				label: '250',
				labelNumber: 250,
				description: 'Merge planned outage. Ignore outage. Trim outage',
				workingData: [
					{begin: 10, end: 11, type: 'planned'},
					{begin: 11, end: 17, type: 'planned'},
					{begin: 14, end: 15, type: 'outage'}, // Planned covers whole outage
					{begin: 14, end: 18, type: 'outage'}, // Planned should trim
				],
				expectedData: [
					{begin: 17, end: 18, type: 'outage'},
				],
			},
			{
				label: '260',
				labelNumber: 260,
				description: 'Nested scenario I',
				workingData: [
					{begin: 5, end: 19, type: 'outage'},
					{begin: 5, end: 7, type: 'outage'},
					{begin: 8, end: 16, type: 'planned'},
					{begin: 9, end: 17, type: 'outage'},
					{begin: 10, end: 11, type: 'planned'},
					{begin: 12, end: 14, type: 'planned'},
					{begin: 13, end: 15, type: 'outage'},
					{begin: 18, end: 20, type: 'planned'},
				],
				expectedData: [
					{begin: 5, end: 8, type: 'outage'},
					{begin: 16, end: 18, type: 'outage'},
				],
			},
			{
				label: '270',
				labelNumber: 270,
				description: 'Nested scenario II',
				workingData: [
					{begin: 1, end: 10, type: 'outage'},
					{begin: 2, end: 3, type: 'planned'},
					{begin: 4, end: 5, type: 'planned'},
					{begin: 6, end: 13, type: 'outage'},
					{begin: 7, end: 8, type: 'planned'},
					{begin: 9, end: 11, type: 'planned'},
					{begin: 12, end: 15, type: 'planned'},
					{begin: 14, end: 16, type: 'outage'},
				],
				expectedData: [
					{begin: 1, end: 2, type: 'outage'},
					{begin: 3, end: 4, type: 'outage'},
					{begin: 5, end: 7, type: 'outage'},
					{begin: 8, end: 9, type: 'outage'},
					{begin: 11, end: 12, type: 'outage'},
					{begin: 15, end: 16, type: 'outage'},
				],
			},
		];
	},

	/**
	 * Wrapper around gs.info
	 * @param {String} message
	 */
	_gslog: function(message) {
		if (this.LOGS)
			gs.info(message);
	},

	/**
	 * Gets scenario in OUTAGE_DATA given a key to retrieve object
	 * @param {String} outageDataScenarioField Name of the field in OUTAGE_DATA object to get the scenario with
	 * @param {*} outageDataScenarioValue Value of name of the filed in OUTAGE_DATA
	 * @param {String} version Version of the Availability Engine. Default is V2
	 * @returns {Object}
	 */
	_getScenarioBy: function(outageDataScenarioField, outageDataScenarioValue, version) {
		var scenarioData;
		for (var i = 0; i < this.OUTAGE_DATA.length; i++) {
			var currentScenario = this.OUTAGE_DATA[i];
			var scenarioKeys = Object.keys(currentScenario);
			var scenarioHasKey = scenarioKeys.indexOf(outageDataScenarioField);
			// Given key exists in object
			if (scenarioHasKey >= 0) {
				var scenarioKeyValue = currentScenario[outageDataScenarioField];
				if (scenarioKeyValue === outageDataScenarioValue) {
					scenarioData = this.OUTAGE_DATA[i];
					if (this._isV1()) {
						scenarioData = this._v1RetrofitScenario([scenarioData]);
						return scenarioData;
					}
					return [scenarioData];
				}
			}
		}
		return null;
	},

	/**
	 * Runs tests for a given scenario
	 * @param {String} fieldName Name of the field in OUTAGE_DATA object to get the scenario with
	 * @param {*} fieldValue Value of name of the filed in OUTAGE_DATA
	 * @param {String} version Version of the Availability Engine. Default is V2
	 * @returns
	 */
	processScenario: function(fieldName, fieldValue, version) {
		this.VERSION = version || 'v2';
		var availabilityOutageProcessor;
		var passedCount = 0;
		var failedCount = 0;
		var failedLabels = [];
		var scenariosToRun = this._getScenarioBy(fieldName, fieldValue, version);
		if (!scenariosToRun) {
			this._gslog('************* RUN SUMMARY *************');
			this._gslog('%%%%% COULD NOT FIND TEST SCENARIO ❌');
			this._gslog('%%%%% WITH KEY: "' + fieldName + '" AND VALUE: "' + fieldValue +'"');
			return;
		}
		var totalScenarios = scenariosToRun.length;

		// Use the correct version of Availability Calculator
		if (this._isV1())
			availabilityOutageProcessor = new global.AvailabilityCalculator(); // Av. V1 wrapper class.
		else
			availabilityOutageProcessor = new global.AvailabilityOutageProcessor(); // Av. V2 dedicated class.

		for (var i = 0; i < totalScenarios; i++) {
			var processedOutages = [];
			var scenarioWorkingData = scenariosToRun[i].workingData;
			if (this._isV1()) {
				var localScenarioOutages = scenarioWorkingData;
				// The way V1 works is that it process outage one by one, comparing a single outage to the already built array of outages
				for (var j = 0; j < localScenarioOutages.length; j++) {
					var currentOutage = localScenarioOutages[j];
					availabilityOutageProcessor._processOutage(processedOutages, currentOutage.type, currentOutage.start, currentOutage.end);
				}
				processedOutages = this._v1PluckOutPlannedOutages(processedOutages);
			} else
				processedOutages = availabilityOutageProcessor.processOutages(scenarioWorkingData, 0, 100);

			var scenarioResult = this._assertScenario(i, processedOutages, scenariosToRun[i]);
			if (scenarioResult === true) {
				passedCount++;
			} else {
				failedCount++;
				failedLabels.push(scenarioResult);
			}
		}

		this._gslog('************* RUN SUMMARY *************');
		this._gslog('%%%%% TOTAL SCENARIOS: '+totalScenarios);
		this._gslog('%%%%% TOTAL PASSED ✅: '+passedCount);
		if (failedCount > 0) {
			this._gslog('%%%%% TOTAL FAILED ❌: '+failedCount);
			this._gslog('%%%%% FAILED LABELS:');
			for (var i = 0; i < failedLabels.length; i++) {
				this._gslog('❌ ' + failedLabels[i]);
			}
		}
	},

	/**
	 * Executes a full run of all existing scenarios
	 * @param {Numebr} version Version of the tester to use
	 */
	processScenarios: function(version) {
		this.VERSION = version || 'v2';
		var availabilityOutageProcessor;
		var passedCount = 0;
		var failedCount = 0;
		var failedLabels = [];
		var scenariosToRun = this._getScenarioData('all'); // Is always an array
		var totalScenarios = scenariosToRun.length;

		// Use the correct version of Availability Calculator
		if (this._isV1())
			availabilityOutageProcessor = new global.AvailabilityCalculator(); // Av. V1 wrapper class.
		else
			availabilityOutageProcessor = new global.AvailabilityOutageProcessor(); // Av. V2 dedicated class.

		for (var i = 0; i < totalScenarios; i++) {
			var processedOutages = [];
			var scenarioWorkingData = scenariosToRun[i].workingData;
			if (this._isV1()) {
				var localScenarioOutages = scenarioWorkingData;
				// The way V1 works is that it process outage one by one, comparing a single outage to the already built array of outages
				for (var j = 0; j < localScenarioOutages.length; j++) {
					var currentOutage = localScenarioOutages[j];
					availabilityOutageProcessor._processOutage(processedOutages, currentOutage.type, currentOutage.start, currentOutage.end);
				}
				processedOutages = this._v1PluckOutPlannedOutages(processedOutages);
			} else
				processedOutages = availabilityOutageProcessor.processOutages(scenarioWorkingData, 0, 100);

			var scenarioResult = this._assertScenario(i, processedOutages, scenariosToRun[i]);
			if (scenarioResult === true) {
				passedCount++;
			} else {
				failedCount++;
				failedLabels.push(scenarioResult);
			}
		}

		this._gslog('************* RUN SUMMARY *************');
		this._gslog('%%%%% TOTAL SCENARIOS: '+totalScenarios);
		this._gslog('%%%%% TOTAL PASSED ✅: '+passedCount);
		if (failedCount > 0) {
			this._gslog('%%%%% TOTAL FAILED ❌: '+failedCount);
			this._gslog('%%%%% FAILED LABELS:');
			for (var i = 0; i < failedLabels.length; i++) {
				this._gslog('❌ ' + failedLabels[i]);
			}
		}

	},

	/**
	 * Main method that runs all scenarios or a single scenario
	 * @param {String|Number} scenario Either "all" or the number of scenario to run
	 * @param {String} version Whether the tester should run with "v1" or "v2" engine. Default is v2
	 */
	processScenariosLegacy: function(scenario, version) {
		// Check params are valid
		if (typeof scenario != 'number' && scenario != 'all') {
			this._gslog('@Invalid type of scenario');
			return;
		}
		this.VERSION = version || 'v2';
		var availabilityOutageProcessor;
		var passedCount = 0;
		var failedCount = 0;
		var failedLabels = [];
		var scenariosToRun = this._getScenarioData(scenario); // Is always an array
		var totalScenarios = scenariosToRun.length;

		// Use correct version
		if (this._isV1())
			availabilityOutageProcessor = new global.AvailabilityCalculator(); // Av. V1 wrapper class.
		else
			availabilityOutageProcessor = new global.AvailabilityOutageProcessor(); // Av. V2 dedicated class.

		for (var i = 0; i < totalScenarios; i++) {
			var processedOutages = [];
			var scenarioWorkingData = scenariosToRun[i].workingData;
			if (this._isV1()) {
				var localScenarioOutages = scenarioWorkingData;
				// The way V1 works is that it process outage one by one, comparing a single outage to the already built array of outages
				for (var j = 0; j < localScenarioOutages.length; j++) {
					var currentOutage = localScenarioOutages[j];
					availabilityOutageProcessor._processOutage(processedOutages, currentOutage.type, currentOutage.start, currentOutage.end);
				}
				processedOutages = this._v1PluckOutPlannedOutages(processedOutages);
			} else
				processedOutages = availabilityOutageProcessor.processOutages(scenarioWorkingData, 0, 100);

			var scenarioResult = this._assertScenario(i, processedOutages, scenariosToRun[i]);
			if (scenarioResult === true) {
				passedCount++;
			} else {
				failedCount++;
				failedLabels.push(scenarioResult);
			}
		}

		this._gslog('************* RUN SUMMARY *************');
		this._gslog('%%%%% TOTAL SCENARIOS: '+totalScenarios);
		this._gslog('%%%%% TOTAL PASSED ✅: '+passedCount);
		if (failedCount > 0) {
			this._gslog('%%%%% TOTAL FAILED ❌: '+failedCount);
			this._gslog('%%%%% FAILED LABELS:');
			for (var i = 0; i < failedLabels.length; i++) {
				this._gslog('❌ ' + failedLabels[i]);
			}
		}
	},

	/**
	 * Returns whether the class property is set to v1 or not
	 * @returns {Boolean}
	 */
	_isV1: function() {
		return this.VERSION === 'v1';
	},

	/**
	 * Gets the data for a particular run
	 * @param {Array<Object>} scenario
	 * @returns {Array<Object>}
	 */
	_getScenarioData: function(scenario) {
		var scenarioData;
		if (scenario === 'all')
			scenarioData = this.OUTAGE_DATA;
		else
			scenarioData = [this.OUTAGE_DATA[scenario]];

		if (this._isV1())
			scenarioData = this._v1RetrofitScenario(scenarioData);
		return scenarioData;
	},

	/**
	 * Modifies begin/start in outages
	 * @param {Array<Object>} scenarioData
	 * @returns {Array<Object>}
	 */
	_v1RetrofitScenario: function(scenarioData) {
		return scenarioData.map(function(scenario) {
			scenario.workingData = scenario.workingData.map(function(outage) {
				return {start: outage.begin, end: outage.end, type: outage.type};
			});
			scenario.expectedData = scenario.expectedData.map(function(outage) {
				return {start: outage.begin, end: outage.end, type: outage.type};
			});
			return scenario;
		});
	},

	/**
	 * Makes sure that there are no planned outages left in the resulting array
	 * @param {Array<Object>} outagesArray
	 * @returns {Array<Object>}
	 */
	_v1PluckOutPlannedOutages: function(outagesArray) {
		return outagesArray.filter(function(outage) {
			return outage.type === 'outage';
		});
	},

	/**
	 * Asserts scenario (processedOutages) against assertData
	 * @param {Number} scenario
	 * @param {Array<Object>} processedOutages
	 * @param {Array<Object>} assertData
	 * @returns
	 */
	_assertScenario: function(scenario, processedOutages, assertData) {
		this._gslog('🎉🎉🎉🎉🎉🎉🎉🎉🎉 SCENARIO #'+(assertData.label)+' 🎉🎉🎉🎉🎉🎉🎉🎉🎉');
		this._gslog('📕 Description: '+(assertData.description));
		var expectedData = assertData.expectedData;
		// Print both arrays
		this._gslog('[DS] expected:' + JSON.stringify(expectedData));
		this._gslog('[DS] actual  :' + JSON.stringify(processedOutages));
		var assertErrors = 0;
		if (processedOutages.length === expectedData.length) {
			this._gslog('✅ Length checks out');
		} else {
			this._gslog('❌❌ Length doesnt check out. Cannot assert');
			return assertData.label;
		}

		for (var i = 0; i < processedOutages.length; i++) {
			this._gslog('%%%%% SCENARIO DATA #' + (i + 1));
			var currentProcessedOutage = processedOutages[i];
			var currentExpectedOutage = expectedData[i];
			var field = this._isV1() ? 'start' : 'begin';
			var fieldLabel = ((field).charAt(0).toUpperCase()) + field.slice(1);

			if (currentProcessedOutage[field] == currentExpectedOutage[field])
				this._gslog('✅ '+fieldLabel+' checks out');
			else {
				this._gslog('❌❌ '+fieldLabel+' doesnt check out');
				assertErrors++;
			}

			// Assert end
			if (currentProcessedOutage.end == currentExpectedOutage.end)
				this._gslog('✅ End checks out');
			else {
				this._gslog('❌❌ End doesnt check out');
				assertErrors++;
			}

			// Assert type
			if (currentProcessedOutage.type == currentExpectedOutage.type)
				this._gslog('✅ Type checks out');
			else {
				this._gslog('❌❌ Type doesnt check out');
				assertErrors++;
			}
		}

		if (assertErrors === 0)
			return true;
		else
			return assertData.label;
	},

    type: 'AvailabilityOutageProcessorTester'
};
