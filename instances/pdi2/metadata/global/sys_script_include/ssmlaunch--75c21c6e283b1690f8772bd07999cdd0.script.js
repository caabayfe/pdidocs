var SSMLaunch = Class.create();

SSMLaunch.prototype = Object.extendsObject(DiscoveryLaunch, {

    initialize: function(status, schedule) {
		DiscoveryLaunch.prototype.initialize.call(this, status, schedule);
		gs.include("DiscoveryIncludes");
		if (schedule && schedule.valid)
			this.ERROR_KEY = 'SSMLaunch_' + this.schedule.name;
		else // quick discovery or triggered without a schedule; will replace later when we know the IP
			this.ERROR_KEY = 'SSMLaunch';
	},

	launch: function() {

		var errMsg = '';
		this.classifyProbesLaunched = false;

		try {
			// Get the list of SSM agents for the VM schedule
			var ssmAgentsList = new CloudDiscoveryScheduleConfig().getListOfSSMAgentsForVMSchedule(this.schedule.sysID);

			if (ssmAgentsList.length == 0) {
				errMsg = 'No SSM agents found for the VM schedule';
				this._logErrorAndCancelStatus(errMsg);

				var errorParams = {
					code: 'SN-5900',
					source: this.schedule.sysID,
					instance: this.status.sysID,
					key: this.ERROR_KEY,
					contextMap: {
						ip_address: null,
						device_class: null
					},
					message: errMsg
				};
				DiscoveryErrorsUtilities.addError(errorParams);

				return;
			}

			for (var i = 0; i < ssmAgentsList.length; i++) {
				var ssmAgent = ssmAgentsList[i];
				var result = {};
				var scannerObject = {};

				// Mock the Shazzam result. This will be processed similar to how shazzam result is processed by the Shazzam Sensor
				if (ssmAgent.os_type == "Windows") {
					scannerObject['@result'] = 'open';
					scannerObject['@name'] = 'GenericTCP';
					scannerObject['@portprobe'] = 'wmi';
					scannerObject['@port'] = '135';
					scannerObject['@service'] = 'epmap';
					scannerObject['@protocol'] = 'tcp';
				} else if ((ssmAgent.os_type == "Linux") || (ssmAgent.os_type == "MacOS")) {
					scannerObject['@result'] = 'open';
					scannerObject['@name'] = 'SSH';
					scannerObject['@portprobe'] = 'ssh';
					scannerObject['@port'] = '22';
					scannerObject['@service'] = 'ssh';
					scannerObject['@protocol'] = 'tcp';
				} else {
					this._logWarning('Unsupported OS type - ' + ssmAgent.os_type + 'found for SSM agent with object ID: ' + ssmAgent.instance_id);
					continue;
				}
				result['@alive'] = 'true';
				result['@active'] = 'true';
				result['scanner'] = scannerObject;
				result['@ip_address'] = ssmAgent.ip_address;
				result['ssm_object'] = ssmAgent;
				this._processResult(result);
			}

			if (!this.classifyProbesLaunched)
				this._logErrorAndCancelStatus('No classification probes launched during SSM discovery');

		} catch(ex) {
			errMsg = 'Script error while attempting to launch Classify probes during SSM discovery';
			this._logErrorAndCancelStatus(errMsg + ex.msg);

			var errorParams = {
				code: 'SN-5900',
				source: this.schedule.sysID,
				instance: this.status.sysID,
				key: this.ERROR_KEY,
				contextMap: {
					ip_address: null,
					device_class: null
				},
				message: errMsg
			};
			DiscoveryErrorsUtilities.addError(errorParams);
		}
	},

	_processResult: function(result) {

		var errMsg = '';
		var probes = [];
		var shazzamResult = new ShazzamResult(result);
		var ciData = new CIData();
		ciData.getData()['ip_address'] = shazzamResult['ip'];

		if (this.schedule.location)
			ciData.getData()['location'] = this.schedule.location;

		var deviceHistoryParams = {
			result : shazzamResult,
			status : this.status
		};
		var scanner = shazzamResult.scanners[0];
		var behavior = this._getBehavior(shazzamResult);

		if (behavior) {
			var probeBehaviorInfo = behavior.getStuffForResult(shazzamResult, scanner, this.status.getPhase(behavior), this.midServer, this.status);
			if (!probeBehaviorInfo) {
				errMsg = 'No probe behavior info found for IP: ' + shazzamResult.ip;
				this._logAndCreateError(errMsg, 'SN-5999', result.ip);
			} else {
				var portProbe = probeBehaviorInfo.portProbe;

				if (this._isProbeActive(portProbe.sysID)) {
					var probeInfo = {};
					probeInfo['ip'                    ] = shazzamResult.ip;
					probeInfo['classificationTable'   ] = portProbe.classy;
					probeInfo['portProbeID'           ] = portProbe.sysID;
					probeInfo['scannerPort'           ] = scanner.port;
					probeInfo['discover'              ] = this.status.discover;
					probeInfo['classificationPriority'] = portProbe.classificationPriority;
					probeInfo['midServerID'           ] = this.midServer.sysID;
					probeInfo['mid_selector_details'  ] = "{\"mode\":\"specific_mid\"}";
					probeInfo['supplementary'         ] = portProbe.supplementary;
					probeInfo['ciData'                ] = ciData.toXML();
					probeInfo['priority'              ] = this.status.priority;
					probeInfo['ssm_object'		  	  ] = JSON.stringify(result['ssm_object']);
					probes.push(probeInfo);
				}

				if (probes.length > 0) {
					var cp = new ClassifierProbes(probes, deviceHistoryParams);
					cp.launch();
					this.classifyProbesLaunched = true;
				} else {
					errMsg = 'No probe found for IP: ' + shazzamResult.ip + 'portProbeID: ' + portProbe.sysID;
					this._logAndCreateError(errMsg, 'SN-5201', shazzamResult.ip);
				}
			}
		}
	},

	_isProbeActive: function(portProbe) {
		var gr = new GlideRecord('trigger_probe_m2m');
		gr.addQuery('port_probe', portProbe);
		gr.addQuery('active', true);
		gr.query();
		return gr.hasNext();
	},

	_getBehavior: function(result) {
		var midServerID = '';
		try {
			if (this.schedule.midSelectAuto())
				midServerID = new SNC.MidSelector().selectAnyDegradedOrBetterMidServer(this.schedule.getAppName(), [result.ip], [{'capability': 'AWS SSM', 'value': ''}]);
			else if (this.schedule.midSelectSpecificMid())
				midServerID = this.schedule.midServerID;
			else if (this.schedule.midSelectSpecificCluster())
				midServerID = new SNC.MidSelector().selectAnyDegradedOrBetterMidServerFromClusterEx(this.schedule.getAppName(), this.schedule.midClusterID);
			else
				throw new Error('Behavior based MID selection is not supported for SSM discovery');
		} catch(ex) {
			var errMsg = 'Failed to find MID server to launch classification probes on ' + result.ip;
			this._logAndCreateError(errMsg + ' '+ ex, 'SN-5601', result.ip);
			return null;
		}

		this.midServer = new MIDServer(midServerID);
		return new DiscoveryBehaviorRecord(this.midServer);
	},

	_logError: function(msg) {
		this.dLogger.setLevel(DiscoveryLogger.ERROR);
		this.dLogger.error(msg, 'SSMLaunch');
	},

	_logWarning: function(msg) {
		this.dLogger.setLevel(DiscoveryLogger.WARNING);
		this.dLogger.warn(msg, 'SSMLaunch');
	},

	_logAndCreateError: function(msg, errorCode, key) {
		this._logError(msg);

		var errorParams = {
			code: errorCode,
			source: this.schedule.sysID,
			instance: this.status.sysID,
			key: key,
			contextMap: {
				ip_address: key, //all callers use ip as key. Not guaranteed for future but need to maintain backwards compatibility with old EF using ip as key
				device_class: null
			},
			message: msg
		};
		DiscoveryErrorsUtilities.addError(errorParams);
	},

	_logErrorAndCancelStatus: function(msg) {
		this._logError(msg);
		var dac =  new SncDiscoveryCancel();
		dac.cancelAll(this.status.sysID);
	},

    type: 'SSMLaunch'
});
