var DiscoverySensor = Class.create();

DiscoverySensor.HistoryStates = {
	ALIVE_NOT_ACTIVE:        'Alive, not active, not classified',
	ACTIVE_COULDNT_CLASSIFY: 'Active, couldn\'t classify',
	CLASSIFIED_BUT_DISABLED: 'Classified, but disabled'
};

DiscoverySensor.DeviceStates = {
	REJECTED: 'rejected'
};

DiscoverySensor.PayloadErrors = [
	'Adding target to blacklist',
	'Target is blacklisted',
	'Cannot locate config file:',
	'Failed to authenticate',
	'bash: haproxy: command not found'
];

var sourceName = gs.getProperty('glide.discovery.source_name', "ServiceNow");

DiscoverySensor.prototype = {
	initialize: function(definition) {
		var fSW, msg, trace, i;

		try {
			fSW = new GlideStopWatch();
			this.init(definition);
			fSW.stop();
			this._recordStopWatch("Initialization", fSW.getTime());

			this.main();
		} catch (e) {
			if (e instanceof DiscoveryException)
				throw e;

			var errMsg = 'Script error in sensor: ' + e;
			DiscoveryLogger.warn(errMsg, 'Discovery Sensor', this.getEccQueueId(), null);
			if (g_device)
				g_device.issue();

			// Re-throw it for logging the stack trace in the system log
			if (e instanceof Packages.java.lang.Throwable) {
				msg = [ '-----------------------------\nStack:' ];
				trace = e.getStackTrace();
				for (i = 0; i < trace.length; i++)
					msg.push(trace[i]);

				msg.push('Message:');
				var lastCause;
				while (e && (lastCause != e)) {
					lastCause = e;
					try {
						msg.push(e.getMessage());
						e = e.getCause();
						e && msg.push('Caused by:');
					} catch (e2) { }
				}
				msg.push('-----------------------------');
				throw (msg.join('\n'));
			} else {
				if (e.stack)
					throw (e + '\nStack:' + e.stack);
				else {
					// We no longer get stacks :-(
					msg = [ "Caught Exception.  Name: '" + e.name + "', Message: '" + e.message + "'" ];
					if (e.fileName || e.sourceName)
						msg.push('from file: ' + (e.fileName || e.sourceName) + ', line ' + e.lineNumber);
					throw msg.join('\n');
				}
			}
		} finally {
			fSW = new GlideStopWatch();
			this.updateCounts();
			fSW.stop();
			this._recordStopWatch("Update count", fSW.getTime());
		}
	},

	init: function(definition) {
		this.cache = {};
		this.relatedListdataObj = {};
		this.errorMap = {};
		this.warningMap = {};
		this.errorManager = new SNC.DiscoveryErrorManager();
		this._defaultSave = true;
		this._debug = null; // lazy-loaded by isDebugging()
		this._deviceCi = null; // lazy-loaded by getDeviceCi()
		this._ciSchema = null; // lazy-loaded by getCiSchema()
		// added to differentiate if application pattern gets triggered for Agent-based Discovery(ACC) vs regular Discovery flow
		this.accAgentId = null; // must remain null for regular Discovery flow

		for (var property in definition)
			this[property] = definition[property];

		this.ASensor = g_sensor;
		g_sensor = this;
		g_status = new DiscoveryStatus(this.getAgentCorrelator());

		// initialize ciData, filling it with 'current' if possible
		// and then overriding with the 'cidata' parameter, if possible
		this.ciData = new CIData();
		this.ci_data = this.ciData.data; // deprecate
		var cidataXml = this.getParameter('cidata'); // if provided, overwrite
		if (!gs.nil(cidataXml))
			this.ciData.fromXML(cidataXml);
		if (!this.hasOwnProperty('type')) // use the sensor name as the type if not specified
			this.type = this.getSensorName();
	},

	main: function() {
		// The idea here is that we do not lock on a CI until we have a sys_id. Currently shazzam, classify and
		// identity sensors will not have them. When shazzam runs, it would not have any device history record.
		if (JSUtil.nil(g_device)){
			return this._main();
		}

		// When classify or identity sensors are running, it has no CI in device history record.
		var ciSysID =  JSUtil.notNil(g_device.getSourceCmdbCi()) ? g_device.getSourceCmdbCi() : this.getParameter('cmdb_ci');
		if (JSUtil.nil(ciSysID)){
			return this._main();
		}

		// Make a special exception for ADM sensors
		if (this.getSensorName().endsWith("ADM")){
			return this._main();
		}

		// It turns out that sensors should update fields that are related to its area, so we shoudln't need to lock as it causes
		// a lot of database churn in the sys_mutex table.
		var sensorLock = JSUtil.toBoolean(gs.getProperty("glide.discovery.sensor.ci_lock", "false"));
		if (!sensorLock) {
			this._main();
			return;
		}

		var rl = new GlideRecordLock('cmdb_ci', ciSysID);
		// limit our attempt to get a lock to 120 seconds.
		rl.setSpinWait(300);
		rl.setMaxSpins(400);
		rl.setLockDuration(120); //seconds
		if (!rl.get()) {
			// TODO: Somehow re-schedule this job to a later date in the future instead of just failing.
			this.ASensor.setProcessed(false);
			this.ASensor.setError("Failed to obtain a lock on cmdb_ci: " + ciSysID + " to process the sensor");
			return;
		}

		try {
			this._main();
		} finally {
			rl.release();
		}
	},

	_main: function() {
		var fSW = new GlideStopWatch();
		this.run();
		fSW.stop();
		this._recordStopWatch("Script processing", fSW.getTime());

		fSW = new GlideStopWatch();
		this.save();
		fSW.stop();
		this._recordStopWatch("Database update", fSW.getTime());

		fSW = new GlideStopWatch();
		this.after();
		fSW.stop();
		this._recordStopWatch("After method", fSW.getTime());
	},

	isClassificationProbe: function() {
		var useClassParameter = this.getParameter('use_class') || '';

		return JSUtil.notNil(useClassParameter);
	},
	
	run: function() {
		var i, shouldBatch, result,
			results = g_array_util.ensureArray(document.result);

		// if there's an error attribute in the "results" tag, then log it...
		if (document['@error']) {
			// This is the overall error from the probe.  It's possible for each individual result to
			// have different errors.  Generally they don't and we set the probe's error and each
			// result's error to the same value.  Here we save the value of the probe's error.  Later,
			// when reporting a result's error we'll compare and _not_ report it if it's a duplicate.
			this.errorFromResults = '' + document['@error'];
			this.processError({msg: this.errorFromResults, resultCode: '' + document['@result_code']});
		}
		//This is the case where we only get <result/> and nothing else. Windows probes could return this.
		else if (results.length === 0)
			this.zeroResults();

		this.prepare(results);

		// If the sensor implements getExpectedProbeCount() then it's agreeing to batch updates
		// of discovery_status.started. There are three parts to this agreement:
		// 1) A global variable named 'g_bestGuessForNumberOfProbesToProcess' has the number of
		//    remaining probes expected to be triggered. The sensor needs to decrement this count
		//    once for each probe it actually triggers.
		// 2) getExpectedProbeCount() can return an approximation, but the sensor needs to ensure
		//    that the expected probes being triggered only drops to 0 when the sensor is completely
		//    done. If the sensor's earlier guess was too low then it needs to increment
		//    discovery_status.started *before* triggering probes. The code to increment is:
		//         DiscoveryStatus.updateStatusStartedCount(g_status.sysID, 100);
		//    It's recommended to increment by a large-ish number to avoid needing to adjust multiple
		//    times. DiscoverySensor will handle any overage after all probes have been triggered.
		// 3) The sensor *must* account for every probe it triggers - it can't make a guess for some
		//    subset of probes that it triggers. Batch updating works by skipping the BR that increments
		//    discovery_status.started.
		// A sensor that implements getExpectedProbeCount() can later opt-out of batch updates
		// returning 0.


		if (g_status && !(g_status.scratchpad && g_status.scratchpad.isOptimizedCounting)) {
			if (typeof this.getExpectedProbeCount == 'function' && g_status && g_status.sysID) {
				g_bestGuessForNumberOfProbesToProcess = this.getExpectedProbeCount(results);

				if (g_bestGuessForNumberOfProbesToProcess) {
					if (this.isDebugging())
						DiscoveryLogger.debug('Incrementing "started" by estimated number of probes to launch: '
							+ g_bestGuessForNumberOfProbesToProcess, sourceName, this.getEccQueueId());				shouldBatch = true;
					DiscoveryStatus.updateStatusStartedCount(g_status.sysID, g_bestGuessForNumberOfProbesToProcess);
					_DO_NOT_UPDATE_STATUS_STARTED_COUNT = true;
				}
			}
		}

		for (i = 0; i < results.length; i++) {
			result = results[i];

			// Checks for warnings and log them
			this.logWarningPayload(result);

			// Checks for debug info and log them
			this.logDebugInfoPayload(result);

			// Checks for error and handles it by printing out log msgs
			if (this.checkErrorPayload(result) && (""+this.getParameter('debug')).toLowerCase() != "true") {
				this.setTriggerProbes(false);  // Prevent additional probes trigger if error is encountered.
				if (this.isClassificationProbe())
					this.processDupIpRecords();
				continue;
			}

			// This checks the payload in more detail to see if we really have something to process.
			if (this.checkEmptyPayload(result)) {
				this.processError('No result returned from probe.');
				continue;
			}

			this.process(result);
		}

		if (g_status && !(g_status.scratchpad && g_status.scratchpad.isOptimizedCounting)) {
			if (shouldBatch) {
				_DO_NOT_UPDATE_STATUS_STARTED_COUNT = false;
				if (g_bestGuessForNumberOfProbesToProcess) {
					if (this.isDebugging())
						DiscoveryLogger.debug('Some expected probes were not launched. Decrementing "started: by '
							+ g_bestGuessForNumberOfProbesToProcess, sourceName, this.getEccQueueId());
						DiscoveryStatus.updateStatusStartedCount(g_status.sysID, -g_bestGuessForNumberOfProbesToProcess);
				}
			}
		}

		this.finish();
	},

	getDuplicateIpMutex: function(status, ci) {
		var mutexName = "DeviceDuplicateIp_" + status + "_" + ci;
		return this.getMutex(mutexName);
	},

	getClassificationMutex: function(status, source) {
		var mutexName = "ClassificationProbe_" + status + "_" + source;
		return this.getMutex(mutexName);
	},

	getMutex: function(mutexName) {
		var mutex = new SelfCleaningMutex(mutexName, mutexName);
		mutex.setExclusive(true);
		mutex.setSpinWait(100);
		mutex.setMutexExpires(120000);
		if (!mutex.get())
			throw 'Timed out getting mutex for ' + mutexName;

		return mutex;
	},
	
	getProcessDuplicateIpRecord: function() {
		var duplicateIpCurrentSourceGr = new GlideRecord('discovery_device_duplicate_ips');
		
		duplicateIpCurrentSourceGr.addQuery('source', source);
		duplicateIpCurrentSourceGr.addQuery('status', this.getAgentCorrelator());
		duplicateIpCurrentSourceGr.addQuery('classification_probe', probe);
		duplicateIpCurrentSourceGr.addQuery('state', 'process');
		duplicateIpCurrentSourceGr.query();
		
		return duplicateIpCurrentSourceGr;
	},

	/*
	* This function is called when a classification fails
	* Duplicate IP record is created before the sensor is running,
	* so there is also a record created for this discovery
	* We need to mark this record as an "error" and release one of the records
	* that was not processed since it was marked as "skip"
	*/
	processDupIpRecords: function() {
		var eccGr = new GlideRecord('ecc_queue');
		var script = 'var job = new DiscoverySensorJob();\njob.process();';
		var duplicateIpCurrentSourceGr = this.getProcessDuplicateIpRecord();
		
		if (duplicateIpCurrentSourceGr.next()) {
			if (JSUtil.nil(duplicateIpCurrentSourceGr.getValue('cmdb_ci'))) {
				duplicateIpCurrentSourceGr.state = 'error';
				duplicateIpCurrentSourceGr.update();
				return;
			}
			var duplicateIpMutex = this.getDuplicateIpMutex(this.getAgentCorrelator(), duplicateIpCurrentSourceGr.getValue('cmdb_ci'));
			try {
				// need to recheck the state of the duplicate ip record after acquiring mutex to confirm the state
				duplicateIpCurrentSourceGr = this.getProcessDuplicateIpRecord();
				if (!duplicateIpCurrentSourceGr.next())
					return;
				duplicateIpCurrentSourceGr.state = 'error';
				duplicateIpCurrentSourceGr.update();
				/*
				* Find any duplicate IP records for THIS CI that were skipped and re-schedule one of them
				* The reason is that if 1 classification failed, that doesn't mean other 
				* classifications on other IPs belong to the same host may fail as well
				* Different IPs can respond on different ports, hence needed to be checked in case
				* of a failed classification
				*/
				var dupIpOtherSourceSameCiGr = new GlideRecord('discovery_device_duplicate_ips');
				dupIpOtherSourceSameCiGr.addQuery('source', '!=', source);
				dupIpOtherSourceSameCiGr.addQuery('cmdb_ci', duplicateIpCurrentSourceGr.getValue('cmdb_ci'));
				dupIpOtherSourceSameCiGr.addQuery('status', this.getAgentCorrelator());
				dupIpOtherSourceSameCiGr.addQuery('classification_probe', probe);
				dupIpOtherSourceSameCiGr.addQuery('state', 'skip');
				dupIpOtherSourceSameCiGr.query();

				/*
				* Change the state of the duplicate IP record to "process" and
				* re-schedule the ECC queue that was skipped
				*/
				if (dupIpOtherSourceSameCiGr.next()) {
					eccGr.get(dupIpOtherSourceSameCiGr.getValue('ecc_queue'));
					dupIpOtherSourceSameCiGr.state = 'process';
					dupIpOtherSourceSameCiGr.update();
					new SchedulePriorityECCJob('ASYNC: Discovery - Sensors', eccGr, script).schedule();
				}				
			} finally {
				duplicateIpMutex.release();
			}
		}
	},

	/**
	 * Helper method to set output and related_data global variables for JSON processing
	 */
	prepareJSON: function(result) {
		if (gs.nil(result.output))
			return;

		try {
			// Attempt to parse the JSON
			var jsonResult = JSON.parse(result.output);

			// Check if the parsed result is an object and not an array
			if (typeof jsonResult !== 'object' || jsonResult === null || Array.isArray(jsonResult)) {
				var structureError = sn_i18n.Message.getMessage('global-discovery', 'Undefined JSON structure');
                throw new DiscoveryException(structureError);
			}

			// Log anything we need to
			if (jsonResult.logs && Array.isArray(jsonResult.logs)) {
                jsonResult.logs.forEach(function(log) {
                    if (typeof g_device !== 'undefined' && g_device)
                        g_device.log(log, this.getSensorName());
                    else
                        gs.log(log);
                }, this);  // Pass 'this' as the second argument
            }

           // Auto map current and related_data
           current = jsonResult.current || {};
           related_data = jsonResult.related_data || {};
		} catch (e) {
            var errorMessage = sn_i18n.Message.getMessage('global-discovery', 'Parse Json Error');
            throw new DiscoveryException(errorMessage + ' Error details: ' + e.message);
		}
	},

	/**
	 * Retrieves the Device History for the current device
	 */
	getDeviceHistory: function() {
		return new DeviceHistoryJS();
	},

	/**
	 * Retrieves the deprecated Java DeviceHistory object.
	 */
	getDeviceHistoryGlobal: function() {
		return g_device;
	},

	/**
	 * Provides a Ci object representing the current device CI under probe. Lazy-loaded.
	 * PRB916595 and PRB654648: To prevent over_writing some fields that are not updated by
	 * the same code called the following function we set non_system fields to"undefined"
	 * in the Ci object(not CI record in DB).
	 * NOTE: Using this function you can not read the non-system fields in the Ci object.
	 * EXAMPLE: Using the following code returns undefined instead of correct value
	 * var deviceCi = this.getDeviceCi();
	 * gs.print(deviceCi.data.name);   // result will be undefined
	 * EXAMPLE: The function still can be used to read the system fields, fields with name
	 * starting with sys_
	 * var deviceCi = this.getDeviceCi();
	 * gs.print(deviceCi.data.sys_id);   // result will be the sys_id of the device
	 * @return Ci
	 * @throws Error If unable to load from the database.
	 *
	 */
	getDeviceCi: function() {
		if (this._deviceCi !== null) // already lazy-loaded
			return this._deviceCi;

		var ciGr = this.getCmdbRecord();
		if (ciGr !== null){
			this._deviceCi = this.getCiSchema().createCi(ciGr);
			this._deviceCi.setDataUndefined();
		} else
			throw 'Unable to load CMDB record for CI';

		if (this.isDebugging()) {
			this._deviceCi.debug(true);
			Debug.logObject('Device CI', this._deviceCi.toShallowObj());
		}

		return this._deviceCi;
	},

	/**
	 * Provided the Ci Schema for this sensor.
	 * May be overloaded per-sensor to handle custom CMDB configurations.
	 * @return CiSchema
	 */
	getCiSchema: function() {
		if (this._ciSchema !== null) // already lazy-loaded
			return this._ciSchema;

		this._ciSchema = new CiSchema();
		return this._ciSchema;
	},

	/*
	* Override this in the sensor to change the behavior with no results.
	*/
	zeroResults: function() {
		this.processError('No results returned from probe.');
	},

	/*
	* Override this in the sensor to process each result.
	*/
	process: function(result) {
	},

	/*
	* Optionally override this in the sensor to prepare for processing results.  This method is invoked once before any
	* results have been processed.
	*/
	prepare: function() {
	},

	/*
	* Optionally override this in the sensor to finish after processing all results.  This method is invoked once after
	* all results have been processed.
	*/
	finish: function() {
	},

	/*
	* Optionally override this in the sensor to finish after processing and saving all results.  This method is invoked once after
	* all results have been processed and saved.
	*/
	after: function() {
	},

	/*
	* Optionally override this in the sensor to handle errors.
	* @param [string] errors An array of all error messages.
	* @param undefined|{sourceName: string, deviceState:undefined|string,lastState:undefined|string,fireClassifiers:undefined|boolean} config The config object, customizes non-default error handling.
	*/
	handleError: function(errors, config) {
		if (typeof config === 'undefined')
			config = {};

		var sourceName = ( typeof config.sourceName === 'undefined' ? 'Discovery' : config.sourceName );
		var deviceState = ( typeof config.deviceState === 'undefined' ? null : config.deviceState );
		var lastState = ( typeof config.lastState === 'undefined' ? null : config.lastState );
		var fireClassifiers = ( typeof config.fireClassifiers === 'undefined' ? false : config.fireClassifiers );

		// warn on every error, but only customize the error message for the first error that we can
		for (var i = 0; i < errors.length; ++i) {

			DiscoveryLogger.warn(errors[i], sourceName, this.getEccQueueId());

			this.handleItomError(errors[i]);

		}

		if (g_device) {
			var logStateChanges = false;
			var currentState = '';

			if (lastState !== null) {
				var status = new DiscoveryStatus(g_device.getStatus());
				logStateChanges = status.logStateChanges;
			}

			if (this.shouldUpdateDeviceIssueState(errors))
				g_device.changeDeviceIssueState(deviceState, lastState, currentState, logStateChanges, sourceName, this.getEccQueueId());
		}

		if (fireClassifiers && !this.firedAdditionalClassifier) {
			this.firedAdditionalClassifier = true;
			this.fireAdditionalClassifier(true); // skip setting a final error msg as we already have
		}
	},

	shouldUpdateDeviceIssueState: function(errors) {
		if (errors.length === 0)
			return false;
		if (errors.length !== 1)
			return true;
		if (!errors[0].msg)
			return false;

		/*
		* When we are dealing with a classify probe we always want to update issue state so we
		* don't leave a device in classifying state.
		*/
		if (JSUtil.notNil(g_probe.getParameter("use_class")))
			return true;
		/*
		* Iterating over the errors to see whether we want to skip the update of device history.
		* some() will return 'true' in case the condition is met on ANY of our values and in our case, if we find a match
		* we want to return 'false' [hence the !] and if none of our errors was found in the message
		* we want to return 'true' [= update device history record]
		*/
		return !DiscoverySensor.PayloadErrors.some(function(error) { return errors[0].msg.indexOf(error) > -1; });
	},

	shouldLogItomError: function(errorMsg) {
		if (errorMsg == null)
			return false;
		if (!this.errorMsgBlacklistCache) 
			this.initErrorMsgBlacklistCache();
		
		for (var item = 0; item < this.errorMsgBlacklistCache.length; item++) {
			switch (this.errorMsgBlacklistCache[item].match_condition) {
				case "Exact match":
					if (this.errorMsgBlacklistCache[item].phrase.toLowerCase() === errorMsg.toLowerCase())
						return false;
					break;
				case "Starts with":
					if (errorMsg.toLowerCase().startsWith(this.errorMsgBlacklistCache[item].phrase.toLowerCase()))
						return false;
					break;
				case "Contains":
					if (errorMsg.toLowerCase().includes(this.errorMsgBlacklistCache[item].phrase.toLowerCase()))
						return false;
					break;
			}
		}
		return true;
	},
	
	initErrorMsgBlacklistCache: function() {
		this.errorMsgBlacklistCache = [];
		
		var gr = new GlideRecord("automation_error_msg_blacklist");
		gr.addQuery("active", "true");
		gr.query();
		
		while (gr.next())
			this.errorMsgBlacklistCache.push({phrase: gr.getValue("phrase"), match_condition: gr.getValue("match_condition")});
	},

	handleItomError: function(error) {
		var errorMsg = typeof error === 'object' && error.hasOwnProperty('msg') ? error.msg : error;

		if (errorMsg.indexOf('Access is denied') !== -1 ||
			errorMsg.indexOf('Authentication failure(s) with available Windows credentials') !== -1 )
			errorMsg = 'Failed to access target system. Access is denied';

		if (!this.shouldLogItomError(errorMsg))
			return;

		var itomErrorCode = 'SN-5999';   // Default: Unexpected error
		var deviceClass = this.getOsForError();
		
		if (errorMsg.indexOf('Cannot connect, status is') !== -1)
			itomErrorCode = 'SN-1007';
		else if ((errorMsg.indexOf('No credential found for type') != -1) || 
				(errorMsg.indexOf('any valid credentials to authenticate') != -1)) {
			var credentialTypes = this.extractCredentialTypesFromMessage(errorMsg);
			itomErrorCode = 
				DiscoveryErrorsUtilities.getFirstMatchedItomErrorCodeByCredentialTypes(
					credentialTypes
				);
		}
		else if (errorMsg.indexOf('Connection failed') !== -1)
			itomErrorCode = 'SN-1006';
		else if (errorMsg.indexOf('MID Server isn\'t Windows') !== -1)
			itomErrorCode = 'SN-5602';
		else if (errorMsg.indexOf('Cannot connect, status is') !== -1)
			itomErrorCode = 'SN-1007';
		else if (errorMsg.indexOf('Payload length') !== -1)
			itomErrorCode = 'SN-5400';
		else if (errorMsg.indexOf('SNMP probe timed out. Target is either unreachable') !== -1)
			itomErrorCode = 'SN-1026';
		else if (errorMsg.indexOf('Failed to authenticate with credentials') !== -1)
			itomErrorCode = 'SN-1100';
		else if (errorMsg.indexOf('Session has timed out') !== -1)
			itomErrorCode = 'SN-5701';
		else if (errorMsg.indexOf('Access is denied') !== -1)
			itomErrorCode = 'SN-1099';

		var ciSysId = this.getCiSysID();
		if (ciSysId == "")
			ciSysId = null;

		var errorParams = {
			code: itomErrorCode,
			instance: this.getAgentCorrelator(),
			key: this.getSource(),
			contextMap: {
				ip_address: this.getSource(),
				device_class: deviceClass
			},
			message: errorMsg,
			ci: ciSysId
		};

		DiscoveryErrorsUtilities.addError(errorParams);
	},

	extractCredentialTypesFromMessage: function(errorMessage) {
		/*
		* Error message examples:
		* 	- "No credential found for types [SSH Password,SSH Private Key]"
		* 	- "Target is blacklisted. No valid credential found for type [Windows]"
		*/
		var regexMatches = errorMessage.match(/\[(.*?)\]/);
		
		if (regexMatches.length == 2)
			return regexMatches[1].toLowerCase().split(',');
		return ['unknown_credential_type'];
	},

	/*
	* Retrieve the OS type for the error
	*/
	getOsForError: function() {
		var os = this.getParameter("sys_class_name");
		
		if (JSUtil.notNil(os))
			return os;
		
		var classy = this.getParameter('use_class')+'';
		
		if (JSUtil.nil(classy))
			os = null;
		
		switch(classy) {
			case 'discovery_classy_unix':
				os = 'cmdb_ci_unix_server';
				break;
			case 'discovery_classy_windows':
				os = 'cmdb_ci_win_server';
				break;
			case 'discovery_classy_snmp':
				os = 'cmdb_ci_netgear';
				break;
		}
		
		return os;
	},

	/*
	* Optionally override this in the sensor to handle warnings.
	*/
	handleWarning: function(warn) {

		DiscoveryLogger.warn(warn, 'Discovery', this.getEccQueueId());
		if (g_device)
			g_device.issue();
	},

	isDebugging: function() {
		if (this._debug === null)
			this._debug = ( this.getParameter('debug') == 'true' );

		return this._debug;
	},

	setDebugging: function(debug) {
		this._debug = ( !!debug );
	},

	debug: function(msg) {
		if (this.isDebugging())
			gs.log("Sensor debug: " + msg);
	},

	reclassify: function(ciClass) {
		var gr = this.getCmdbRecord();
		if (!gr)
			return;

		var oldClass = gr.sys_class_name;

		// staging bump
		if (gr.getTableName().startsWith("s_") && !ciClass.startsWith("s_"))
			ciClass = "s_" + ciClass;

		var cgr = g_disco_functions.reclassify(gr, ciClass, this.getSensorName());
		var newClass = cgr.sys_class_name;

		if (oldClass != newClass) {
			g_device.log("Classified device as " + newClass);
			this.cache[cgr.sys_id] = cgr;
		}

		return cgr;
	},

	addDiscoveryCiStuff: function(gr, sn) {
		var currDateTime = ''+new GlideDateTime();

		gr.discovery_source = sn || sourceName;
		gr.setValue('last_discovered', currDateTime);
		if (!gr.first_discovered)
			gr.setValue('first_discovered', currDateTime);

		var location = this.getLocationID();
		if (location)
			gr.location = location;
	},

	updateObjectSource: function(gr, sn) {
		if (JSUtil.notNil(g_status)) {
			os = new ObjectSource(sn || sourceName, gr.sys_class_name, gr.sys_id, g_status.source);
			os.setValue("last_scan", new GlideDateTime().getDisplayValue());
			os.process();
		}
	},

	update: function(data) {
		var gr = this.getCmdbRecord();
		if (gs.nil(gr))
			return;

		for (var fieldName in data) {
			var value = data[fieldName];
			if (JSUtil.notNil(value)) {
				// PRB632583: Use setValue() here instead of gr[fieldName] = value
				// GlideRecord returns times in UTC and setValue() accepts
				// dates in UTC, but assignment uses the current timezone.
				gr.setValue(fieldName, value);
			}
		}

		g_disco_functions.updatedHistory(gr, this.getSensorName(), this.getEccQueueId());
		this.cache[gr.update(this.getSensorName())] = null;	// invalidate the cache after update

		// update the necessary related lists
		if (this._deviceCi === null)
			new DiscoveryReconciler(this.getCmdbRecord(), this.relatedListdataObj).process();
		else
			this._deviceCi.write();
	},

	save: function() {
		if (!this._defaultSave)
			return;
		// if we have no DeviceHistory (g_device), then we're in the identity phase of a CI scan, and we don't want to save anything...
		if (!g_device && JSUtil.nil(this.getParameter('cmdb_ci')))
			return;
		this.update((this._deviceCi === null ? current : this._deviceCi.data));
	},

	// Allow a way to disable the default saving of the current and reconcilers...
	setDefaultSave: function(value) {
		this._defaultSave = value;
	},

	logWarningPayload: function(result) {

		var warning = this.getAttribute(result, 'warn');
		if (warning)
			this.processWarning(warning);
	},

	logDebugInfoPayload: function(result) {
		
		function logMsgArray(arr, sensor) {
			try {
				var msgs = g_array_util.ensureArray(arr);
				for (var i = 0; i < msgs.length; i++) {
					var msg = "" + msgs[i];
					DiscoveryLogger.debug(msg, 'Discovery', sensor);
				}
			} catch (e) {
				var errMsg = 'Script error in sensor: ' + e;
				DiscoveryLogger.warn(errMsg, 'Discovery Sensor', sensor, null);
			}
		}
		
		if (result && 'true' == gs.getProperty('glide.discovery.log_debug_info', 'false')) {
			logMsgArray(result.debug_info, this.getEccQueueId());
			logMsgArray(result.log_info, this.getEccQueueId());
		}
	},

	processWarning: function(msg) {
		var warningMsg = '' + msg.trim();

		// ignore any duplicates...
		if (this.warningMap[warningMsg])
			return;

		// ignore excluded warnings
		if (!this.shouldLogItomError(warningMsg))
			return;

		this.handleWarning(warningMsg);
		this.warningMap[warningMsg] = true;
	},

	checkErrorPayload: function(result) {
		var error = this.getAttribute(result, 'error');
		if (error) {
			error = error + '';
			// This is the error for an individual result.  There's an overall error for the probe
			// which will often have the same value.  We saved that error so we can avoid reporting
			// the result's error if it's a duplicate.
			if (error != this.errorFromResults)
				this.processError({msg: error, resultCode: this.getAttribute(result, 'result_code')});
			return true;
		}

		var errors = g_array_util.ensureArray(result.error);
		if (errors.length > 0) {
			this.processError(errors);

			return true;
		}

		return false;
	},

	/**
	 * Returns the attribute with the given name from the result, or null if there was no such attribute.  Looks for
	 * the attribute in three places:
	 *
	 * result.@<attr>
	 * result.results.@<attr>
	 * result.results.result.@<attr>
	 *
	 * The last two places are possibilities in the returned payload of a multiprobe.
	 */
	getAttribute: function(result, attr) {
		var at = result['@' + attr];
		if (at)
			return '' + at;

		if (!result.results)
			return null;

		at = result.results['@' + attr];
		if (at)
			return '' + at;

		if (!result.results.result)
			return null;

		at = result.results.result['@' + attr];
		if (at)
			return '' + at;

		return null;
	},

	processError: function(errors) {
		var i;

		if (Object.prototype.toString.call(errors) !== '[object Array]')
			errors = [errors];

		// fill this with trim()'d js strings that aren't dupes of previous errors
		var validErrors = [];
		for (i = 0; i < errors.length; ++i) {
			var error, resultCode;
			if (errors[i]) {
				if (typeof errors[i] == 'object' && errors[i].msg) {
					error = errors[i].msg;
					resultCode = errors[i].resultCode;
				}
				else {
					error = errors[i];
					resultCode = null;
				}
			}

			//if the error is null, then this is not a valid error, so skip it.
			if (JSUtil.nil(error))
				continue;

			var tError = ''+error.trim();
			if (this.errorMap[tError]) // then this is a duplicate. ignore it.
				continue;

			validErrors.push({msg: tError, resultCode: resultCode});
		}

		this.handleError(validErrors);

		for (i = 0; i < validErrors.length; ++i) // prevent dupes of these errors in future calls
			if (errors[i]) {
				if (typeof errors[i] == 'object' && errors[i].msg)
					this.errorMap[validErrors[i].msg] = true;
				else
					this.errorMap[validErrors[i]] = true;
			}
	},

	checkEmptyPayload: function(result) {
		// Currently if the device history is not created yet. We don't write to it
		if (!g_device)
			return false;

		// tags to check for Windows, SSH and SNMP payloads respectively...
		var tags = [result, result.output, result.snmp];

		for (var i = 0; i < tags.length; i++)
			if (this._checkEmptyPayload(tags[i]))
				return true;

		return false;
	},

	_checkEmptyPayload: function(pTag) {
		if (!this._checkEmptyPayload1(pTag))
			return false;

		return true;
	},

	_checkEmptyPayload1: function(pTag) {
		// If empty the tag doesn't exist, then let's not even check it.
		if (pTag === undefined)
			return false;

		// If the tag is null, it means it contains no more data. For example: a tag of <output/> would be null.
		if (pTag === null)
			return true;

		// If the tag is an object, we need to make sure it actually contains data, and not just attributes.
		if (pTag instanceof Object)
			if (!this._checkContainsData(pTag))
				return true;

	return false;
	},

	_checkContainsData: function(obj) {
		// If a tag is an object, then we look to see if it actually contains more tags and not just attributes. (The
		// attributes have an @ sign in the property, so basically anything that doesn't contain @ means it has more
		// tags inside. An example would be <snmp source="10.10.10.10" timeout="true"/>
		for (var prop in obj)
			if (prop.indexOf("@") == -1)
				return true;

		return false;
	},

	logEmptyPayload: function() {
		if (g_device)
			g_device.log("Sensor has no payload data to process.", this.getSensorName());
	},

	setCurrentFromJavaMap: function(javaMap) {
		var it = javaMap.keySet().iterator();
		while (it.hasNext()) {
			var key = it.next();
			current[key] = javaMap.get(key);
		}
	},

	getAgent: function() {
		return g_probe.getAgent();
	},

	getCmdbCi: function() {
		// Some sensors will change the g_device in order
		// to use it for certain operations.  If this is the case,
		// we should make sure to return the manually set value.
		if (g_device && g_device.getIsCIChanged())
			return g_device.getCmdbCi();
		
		if (JSUtil.notNil(this.getParameter('ci_sys_id')))
			return this.getParameter('ci_sys_id');

		if (JSUtil.notNil(this.getParameter('cmdb_ci')))
			return this.getParameter('cmdb_ci');

		if (g_device && g_device.getCmdbCi())
			return g_device.getCmdbCi();

		this.debug("Unable to find CI record from the device history.");
		return null;
	},

	validSysId: function(sysId) {
		return !gs.nil(sysId) && /^[\dA-F]{32}$/i.test(sysId);
	},

	getCmdbRecord: function() {
		var ci = this.getCmdbCi();
		if (!this.validSysId(ci))
			return null;

		var gr;

		if (this.cache[ci])
			gr = this.cache[ci];
		else {
			gr = new GlideRecord('cmdb_ci');
			if (!gr.get(ci)) {
				this.debug("Unable to retrieve CI record from the database.");
				return null;
			}

			var gru = GlideScriptRecordUtil.get(gr);
			gr = gru.getRealRecord();

			this.cache[ci] = gr;
		}

		return gr;
	},

	/**
	* Retrieve the ci sys_id of the current device, return null if there isn't any.
	*/
	getCiSysID: function() {
		if (JSUtil.nil(g_device))
			return "";
		return JSUtil.notNil(g_device.getSourceCmdbCi()) ? g_device.getSourceCmdbCi() : this.getParameter('cmdb_ci');
	},

	/**
	 * Retrieves a token that can be used to uniquely identify this discovery
	 * run among others. Currently, the token is the SysID of the Discovery Status
	 * table / class (provided by g_status).
	 */
	getAgentCorrelator: function() {
		return '' + this.getParameter("agent_correlator");
	},

	// Return the discovery source.
	getDiscoverySource: function() {
		if(typeof this.discovery_source != 'undefined' && StringUtil.notNil(this.discovery_source))
			return this.discovery_source;
		else {
			var statusId = this.getAgentCorrelator();
			var gr = new GlideRecord("discovery_status");
			gr.get(statusId);
			this.discovery_source = gr.source;
			return this.discovery_source;
		}
	},

	getEccQueueId: function() {
		return ''+g_probe.getEccQueueId();
	},

	getEccQueueRecord: function() {
		return g_probe.getEccQueueRecord();
	},

	getParameter: function(name) {
		return g_probe.getParameter(name);
	},

	getSensorName: function() {
		return (typeof sensorName == 'undefined') ? "": sensorName; //return empty string if sensorName is not defined
	},

	getSource: function() {
		return (typeof source == 'undefined') ? "": source; //return empty string if source (IP) is not defined;
	},

	getLogger: function() {
		var dh = this.getDeviceHistory();
		var dgr = dh.getDeviceRecord();
		var dhid;
		if (JSUtil.notNil(dgr))
			dhid = dgr.sys_id;

		var dl = new DiscoveryLogger(this.getAgentCorrelator(), dhid);
		dl.setSensor(this.getEccQueueId());
		dl.setSource(this.getSensorName());
		return dl;
	},

	addToRelatedListWithDeleteGr: function(tableName, dataArray, refName, keyName, deleteGr) {
		this.relatedListdataObj[tableName] = {
			data: dataArray,
			refName: refName,
			keyName: keyName,
			deleteGr: deleteGr
		};
	},
	
	addToRelatedList: function(tableName, dataArray, refName, keyName) {
		this.addToRelatedListWithDeleteGr(tableName, dataArray, refName, keyName, false);
	},

	updateCounts: function() {
		this.updateDeviceCount();
	},

	updateDeviceCount: function() {
		this.getDeviceHistory().completed();
	},

	setTriggerProbes: function(value) {
		this.ASensor.setTriggerProbes(value);
	},

	warn: function(message) {
		DiscoveryLogger.warn(message, this.getSensorName(), this.getEccQueueId());
	},

	isAnotherClassificationActive: function() {
		var source = this.getSource();
		var status = this.getStatus();
		var classificationMutex = this.getClassificationMutex(source, status);

		try {
			var gr = new GlideRecord('discovery_device_history');
			gr.addQuery('source', this.getSource());
			gr.addQuery('status', this.getAgentCorrelator());
			gr.addQuery('classification_probe', '!=', probe);
			var qc = gr.addQuery('current_state', 'Classifying');
			qc.addOrCondition('current_state', 'Identifying');
			qc.addOrCondition('last_state', 'Updated CI');
			gr.query();

			return gr.hasNext();
		} finally {
			classificationMutex.release();
		}
	},

	/**
	 * @param undefined|boolean skipFailState Do not update the g_device state if no further classifiers could be launched (keeping previous error).
	 */
	fireAdditionalClassifier: function(skipFailState) {
		var cp = new ClassifierProbes(this.getParameter('classifiers'), this.getParameter('deviceHistoryParams'));

		if (!this.isAnotherClassificationActive()) {
			// If we are done with host classification - lets trigger credential less discovery
			if (cp.hostClassificationDone())
				this.launchCredentiallessDeviceDiscovery(this.getSource());
			else
				cp.launch();
		}

		if (g_device) {
			var status = new DiscoveryStatus(g_device.getStatus());

			if (skipFailState !== true) {
				g_device.state(DiscoverySensor.HistoryStates.ACTIVE_COULDNT_CLASSIFY, '', status.logStateChanges, 'Discovery', this.getEccQueueId());
				DiscoveryErrorsUtilities.addError('SN-1582', 'Host is active, but unable to classify', { instance: status.sysID });
			}
		}
	},

	/**
	 * Launches supplementary classifications after a higher-priority identification succeeds, once again in order of priority.
	 */
	fireSupplementaryClassifiers: function() {
		// Check whether classifier probe functionality is installed
		if (typeof ClassifierProbes === 'undefined')
			return;

		var classifierProbes = new ClassifierProbes(this.getParameter('classifiers'), this.getParameter('deviceHistoryParams'));
		classifierProbes.launchSupplementary();
	},

	/*
	*  Expose the base values in CIData to the classifiers. Currently used by Windows, Unix and SNMP.
	*/
	addCIDataBaseValue: function(obj) {
		var ciData = new CIData();
		ciData.fromXML(this.getParameter('cidata'));
		var ci_data = this.ciData.getData();
		for (var prop in ci_data)
			obj[("cidata."+prop)] = ci_data[prop];
	},

	/*
	*  This is used to add variables to the ci_data variable after running classifications.
	*  It basically runs the classification script and store the variables in ci_data.
	*/
	runClassificationScript: function(dClasser, ciData) {
		var setFields = dClasser.runScript();
		var it = setFields.keySet().iterator();
		while (it.hasNext()) {
			var key = it.next();
			ciData[key] = setFields.get(key);
		}
	},

	/**
	 * Retrieves the location of the current discovery.
	 * @returns string|null The SysID of the Location for the current sensor or NULL if not found.
	 */
	getLocationID: function() {
		if (typeof(this._locationID) !== 'undefined') // initialized on demand by this method.
			return this._locationID;

		this._locationID = null; // initialize
		var scheduleGr = new GlideRecord('discovery_schedule');
		if (!scheduleGr.get(g_status.scheduleID))
			return null;
		if (!scheduleGr.location)
			return null;

		this._locationID = ''+scheduleGr.location.sys_id;
		return this._locationID;
	},

	/**
	 * Helper method to remove all nil properties from current.
	 */
	removeNilProps: function() {
		for (var fieldName in current) {
			if (JSUtil.nil(current[fieldName]))
				delete current[fieldName];
		}
	},

	/**
	 * Helper method to trigger a DNS probe for the given IP addresses.
	 */
	triggerDnsProbe: function(probeName, ipAddresses, source) {
		if (gs.nil(ipAddresses) || ipAddresses.length == 0)
			return;

		// join and pass the ip_addresses as a probe parameter
		var probe = new Probe.get(probeName);
		if (probe) {
			probe.setSource(source || this.getSource());
			probe.addParameter('ip_addresses', ipAddresses.join());
			probe.create(this.getAgent(), this.getEccQueueId());
		}
	},


	_recordStopWatch: function(name, time) {
		var logSensorTime = JSUtil.toBoolean(gs.getProperty("glide.discovery.log_sensor_metrics", "false"));
		if (!logSensorTime)
			return;

		// If we're just running sensor test, no need to log the metrics
		if ((typeof g_mockSensor != 'undefined') && g_mockSensor == true)
			return;

		var gr = new GlideRecord("discovery_metric");
		gr.discovery_status = this.getAgentCorrelator();
		gr.ip_address = this.getSource();
		gr.context = this.getSensorName();
		gr.identifier = name;
		gr.process_time = time;
		gr.insert();
	},

	classifierIsDisabled: function(classifier) {
		var isDisabled = classifier.getValue("disabled");
		if (JSUtil.nil(isDisabled)) // if value has never been set, continue normally since default is false
			return false;

		return JSUtil.toBoolean(parseInt(isDisabled));
	},

	handleDisabledClassifier: function(classifier, source) {
		var disabledClassifierMsg = gs.getMessage("Classifier {0} has been disabled, stopping discovery", classifier.getValue("name"));
		DiscoveryLogger.info(disabledClassifierMsg, source, this.getEccQueueId());
		// update device history state, if we have one...
		if (g_device) {
			var status = new DiscoveryStatus(g_device.getStatus());
			g_device.state(DiscoverySensor.HistoryStates.CLASSIFIED_BUT_DISABLED, '', status.logStateChanges, source, this.getEccQueueId());
		}
	},

	triggerProbe: function(probeName, parameters) {
		var name,
			probe = new Probe.get(probeName, {"ci_sys_id": this.getCmdbCi()});

		if (probe) {
			probe.setSource(this.getSource());
			probe.addParameter("cmdb_ci", this.getCmdbCi());
			probe.setEccPriority(this.getParameter("priority"));
			probe.setMidSelectDetails(this.getParameter('mid_selector_details'));
			probe.addParameter('agent_correlator', this.getAgentCorrelator());
			var ssmObject = this.getParameter('ssm_object');
			if (ssmObject)
				probe.addParameter('ssm_object', ssmObject);

			for (name in parameters)
				probe.addParameter(name, parameters[name]);

			probe.create(this.getAgent(), this.getEccQueueId());
		}
	},

	// Trigger any conditional probes for a sensor
	// prepFn {function}    Function to prepare parameters for the probe.  It's possible to trigger
	//                      the same probe more than once.  prepFn will be called repeatedly until
	//                      it returns false.  The value returned from prepFn will be passed to the
	//                      discovery_sensor_probe_conditional script (which can also return false
	//                      to keep the probe from being triggered.)
	// parms {Object}       Parameters provided by the sensor.  A copy of this object is passed to prepFn.
	// copiedParms {Array}  Array of parameters to copy from the probe that caused this sensor to run.
	triggerProbes: function(prepFn, parms, copiedParms) {
		var probeParms, data, name,
			probe = new GlideRecord('discovery_sensor_probe_conditional');

		// Triggering probes will re-trigger the conditional probes (without evaluating
		// the condition).  Let's just not trigger non-conditional probes for now.
		this.setTriggerProbes(false);

		probe.addQuery('active', 'true');
		probe.addQuery('parent', sensorId);
		probe.query();
		var first = true;

		prepFn = prepFn || function() {
			if (first) {
				first = false;
				return true;
			};
		}

		// Walk over each probe that might get triggered, get parameters for the probe
		// and trigger it
		while (probe.next()) {
				first = true;
			// (1) Get both the parameters copied from the previous probe and any parameters provided by the sensor
			// (2) call prepFn() with these parameters and the discovery_sensor_probe_conditional GlideRecord
			// (3) Loop until prepFn returns falsey
			while ((probeParms = getParms()) && (data = prepFn(probeParms, probe))) {

				// If there's no condition script just copy all values provided by the sensor
				if (!probe.condition_script && typeof data == 'object') {
					for (name in data)
						probeParms[name] = data[name];
				}

				// Make sure all the parameters ara JavaScript strings
				for (name in probeParms) {
					if (probeParms[name] instanceof Packages.java.lang.String)
						probeParms[name] = '' + probeParms[name];
					else if (typeof probeParms[name] != 'string')
						probeParms[name] = JSON.stringify(probeParms[name]);
				}

				// Trigger the probe if there's no condition script or if the condition script returns truthy
				if (!probe.condition_script || eval('(' + probe.condition_script + ')(probeParms, data)'))
					this.triggerProbe(probe.child.name, probeParms);
			}
		}

		function getParms() {
			var name,
				p = { };

			// Copy the sensor's parameters
			if (parms) {
				for (name in parms)
					p[name] = '' + parms[name];
			}

			// Now copy all requested parameters from the previous probe
			copiedParms && copiedParms.forEach(copyParm);

			return p;

			function copyParm(name) {
				if (g_probe.getParameter(name))
					p[name] = '' + g_probe.getParameter(name);
			}
		}
	},

	/*
	* Insert errors into automation_error_msg table.
	* @param errorMap: A JSON array that contains multiple JSON objects that has attributes "error_code" and "error_message"
	* e.g [{"errorCode": "SN-5000", "errorMessage": "something is wrong"}, {"errorCode": "SN-5001", "errorMessage": "something is wrong}]
	*/
	handleErrorMap: function(errorMap) {
		var ciSysId = this.getCiSysID();
		var statusSysId = this.getAgentCorrelator();
		var source = this.getSource();
		var errorParams = {
			code: '',
			instance: statusSysId,
			key: source,
			contextMap: {
				ip_address: source,
				device_class: this.getParameter("sys_class_name")
			},
			message: '',
			ci: ciSysId
		};

		for (var i in errorMap) {
			errorParams.code = errorMap[i].errorCode;
			errorParams.message = errorMap[i].errorMsg;
			DiscoveryErrorsUtilities.addError(errorParams);
		}
	},

	/**
	 * Conditionally launches Credentialless Device Discovery Pattern
	 */
	launchCredentiallessDeviceDiscovery: function(sourceIP) {
		// if credentialless is launched from shazzam, deviceHistoryParams -> Object
		// otherwise deviceHistoryParams -> String
		var deviceHistoryParams = {
			ecc_queue : this.getEccQueueId()
		};

		this.deviceHistoryParams = !this.deviceHistoryParams ? JSON.stringify(deviceHistoryParams) : JSON.stringify(this.deviceHistoryParams);
		//	PRB1383537 - Sending cidata along
		var probeParams = {
			cidata: this.ciData.toXML()
		};
		// Credentialless Device Discovery classification enabled?
		// Set default property value to disabled (false).
		if (gs.getProperty("mid.discovery.credentialless.enable", "false") == "true")
			new SncCredentiallessDeviceDiscovery().launch(this.getAgentCorrelator(), this.getParameter('mid_selector_details'), this.getEccQueueId(),  sourceIP, probeParams, this.deviceHistoryParams);
	},

	type: "DiscoverySensor"
};
