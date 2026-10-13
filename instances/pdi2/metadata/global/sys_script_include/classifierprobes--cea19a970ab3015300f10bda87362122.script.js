// Discovery class

/**
 * Provides classifier probe launch facility.  Encapsulates an array of probe information records, initialized either from a
 * JavaScript array or the XML serialized version.
 *
 * Tom Dilatush tom.dilatush@service-now.com
 */
var ClassifierProbes = Class.create();

ClassifierProbes.prototype = {
    // List of probes that should be excluded if using AWS SSM discovery
    ssmExcludedProbes: ["Interactive Probe Shell"],

    initialize: function(source, deviceHistoryParams) {
        if (JSUtil.nil(source))
            this.probeInfo = [];
        else if ((typeof source == 'object') && (source instanceof Array))
            this.probeInfo = source;
		else
			this.probeInfo = JS2XML.fromXML('' + source);

		// will be used to launch new classification probes
		this.deviceHistoryParams = deviceHistoryParams instanceof String ? JSON.parse(deviceHistoryParams.toString()) : deviceHistoryParams;

        // sort the array in priority order...
        this.probeInfo.sort(function(a, b) {
            return a['classificationPriority'] - b['classificationPriority'];
        });
    },

	getClassificationProbes: function(portProbe) {
		var gr = new GlideRecord('trigger_probe_m2m');
		gr.addQuery('port_probe', portProbe);
		gr.addQuery('active', true);
		gr.orderBy('sys_id');
		gr.query();
		return gr;
	},

	/*
     * Check to see if there are any host classification probes left to trigger
     */
	hostClassificationDone: function() {
		for (var i = 0; i < this.probeInfo.length; i++) {
			var probeInfo = this.probeInfo[i];
			var classificationProbesGr = this.getClassificationProbes(probeInfo.portProbeID);

			while (classificationProbesGr.next()) {
				var probeGr = new SNC.ProbeCache().getBySysId(classificationProbesGr.getValue('classification_probe'));
				if (probeGr.host_classification)
					return false;
			}
		}
		return true;
	},

    /*
     * Launch the next highest priority classifier from those in our list.  If a classifier is launched, return true.
     */
    launch: function(fromShazzam) {
        if (this.probeInfo.length < 1)
            return false;

		/*
		*  The classification priority tells us in general what port Discovery should go after first, however,
		*  If there's service affinity record, use it instead!
		*/
		var ipServiceAffinity = JSUtil.toBoolean(gs.getProperty("glide.discovery.ip_service_affinity", "false"));
		if (ipServiceAffinity && this.probeInfo.length > 1)
			this.probeInfo = this._sortByServiceAffinity(this.probeInfo);

        // get our probe info, for the highest priority classifier probe...
        while (this.probeInfo.length > 0) {
            var probeInfo = this.probeInfo.shift();
            try {
                if (this._launchProbeInfo(probeInfo, fromShazzam))
                    return true;
            } catch (e) {
                gs.warn('ClassifierProbes: Failed to launch probe for IP ' + probeInfo.ip + 
                    ', port probe: ' + probeInfo.portProbeID + 
                    ', port: ' + probeInfo.scannerPort + ': ' + e.message);
            }
        }
        return false;
    },

	launchSupplementary: function() {
		for (var i = 0, n = this.probeInfo.length; i < n; ++i) {
			var probeInfo = this.probeInfo.shift();
			if (probeInfo === null || !probeInfo.supplementary)
				continue;

			probeInfo.is_supplementary = true;
			this._launchProbeInfo(probeInfo);
		}
	},

	_launchProbeInfo: function(probeInfo, fromShazzam) {
		var g_device, classificationProbe;
		var probeLaunched = false;

		//Extracting parameters to create DeviceHistory
		var ip = this.deviceHistoryParams.result.ip;
		var eccQueueId = this.deviceHistoryParams.ecc_queue;
		var result = this.deviceHistoryParams.result;
		var status = this.deviceHistoryParams.status;
		var errMsgs = this.deviceHistoryParams.errMsgs;
		var dnsName = this.deviceHistoryParams.dns_name;
		var classificationProbesGr = this.getClassificationProbes(probeInfo.portProbeID);

		// DEF0784437: Particularly for SSM Discovery, since Shazzam probes aren't ran for this
		// These records do not yet have an agent_correlator value set for them
		// So, adding this check here so that if agent_correlator is not yet set, we should set here
		if (typeof agent_correlator == 'undefined')
			agent_correlator = status.sysID;

		var isSSMDiscovery = probeInfo.ssm_object ? true: false;

		// sequentially launch classification probes linked to port probe
		while (classificationProbesGr.next()) {
			classificationProbe = classificationProbesGr.getValue('classification_probe');

			// If running AWS SSM Discovery, there may be some classifier probes we want to skip
			if (isSSMDiscovery) {
				var probeGr = new SNC.ProbeCache().getBySysId(classificationProbe);
				var probeName = probeGr.getValue('name');
				if (this.ssmExcludedProbes.includes(probeName)) {
					gs.debug("Skipping classifier probe: " + probeName + " for AWS SSM discovery");
					continue;
				}
			}

			var deviceHistoryCreated = false;
			if (!fromShazzam && !isSSMDiscovery) {
				g_device = DeviceHistory.getFromSourceAndStatusAndClassification(ip, status.sysID, classificationProbe);
				if (g_device)
					continue;

				var mutexName = this.getMutexName(ip, status, classificationProbe);
				var classificationMutex = new SelfCleaningMutex(mutexName);
				classificationMutex.setSpinWait(200);       // time to wait between attempts, in ms
				classificationMutex.setMaxSpins(125);       // maximum number of times to try
				deviceHistoryCreated = classificationMutex.enterCriticalSection(0, 0, createDeviceHistoryInMutex);
				if (!deviceHistoryCreated)
					continue;
			}

			if (!deviceHistoryCreated)
				g_device = DeviceHistory.createDeviceHistory(ip, null, eccQueueId, classificationProbe);

			if (!JSUtil.nil(dnsName))
				g_device.setDNSName(dnsName);

			g_device.state('Active', result.active ? 'Classifying' : '', status.logStateChanges, 'Shazzam', eccQueueId);
			for (var i = 0; i < errMsgs.length; i++) {
				DiscoveryLogger.warn(errMsgs[i], 'Shazzam', this.getEccQueueId(), null);
				g_device.issue();
			}

			var probe = Probe.getById(classificationProbe);

			probe.setSource(probeInfo.ip);
			probe.setMidSelectDetails(probeInfo.mid_selector_details);
			probe.addParameter('use_class', probeInfo.classificationTable);
			probe.addParameter('port_probe', probeInfo.portProbeID);
			probe.addParameter('port', probeInfo.scannerPort);
			probe.addParameter('discover', probeInfo.discover);
			probe.addParameter('deviceHistoryParams', JSON.stringify(this.deviceHistoryParams));
			probe.addParameter('classification_probe', classificationProbe);

			if (probeInfo.ciSysID)
				probe.addParameter('cmdb_ci', probeInfo.ciSysID);
			if (probeInfo.ciData)
				probe.addParameter('cidata', probeInfo.ciData);
			if (GlideHostUtil.isLocalhost(probeInfo.ip)) {
				var aka = StringUtil.join(GlideHostUtil.getNonLoopbackIPs());
				probe.addParameter( 'aka', aka);
			}
			if (this.probeInfo.length > 0)
				probe.addParameter('classifiers', JS2XML.toXML(this.probeInfo));
			if (probeInfo.is_supplementary)
				probe.addParameter('is_supplementary', '1');
			if (probeInfo.priority)
				probe.setEccPriority(probeInfo.priority);
			if (isSSMDiscovery)
				probe.addParameter('ssm_object', probeInfo.ssm_object);

			var midServer = new MIDServer(probeInfo.midServerID);

			if (typeof g_bestGuessForNumberOfProbesToProcess != 'undefined') {
				g_bestGuessForNumberOfProbesToProcess--;
				if (g_bestGuessForNumberOfProbesToProcess <= 0) {
					DiscoveryStatus.updateStatusStartedCount(g_status.sysID, 100);
					g_bestGuessForNumberOfProbesToProcess += 100;
				}
			}

			try {
				var eccQueueSysId = probe.create('mid.server.' + midServer.name, probeInfo.shazzamSensorID);
				if (!JSUtil.nil(eccQueueSysId))
					probeLaunched = true;
			} catch (e) {
				// Creating the probe threw an exception. Assume it wasn't created so undo the
				// earlier decrement of probes created.
				if (typeof g_bestGuessForNumberOfProbesToProcess != 'undefined')
					g_bestGuessForNumberOfProbesToProcess++;
				throw e;
			}
		}
		return probeLaunched;

		function createDeviceHistoryInMutex() {
			if (DeviceHistory.getFromSourceAndStatusAndClassification(ip, status.sysID, classificationProbe))
				return false;
			g_device = DeviceHistory.createDeviceHistory(ip, null, eccQueueId, classificationProbe);
			return true;
		}
	},

	getMutexName: function(source, status, classificationProbe) {
		return "Classifierprobe_" + source + status + classificationProbe;
	},

	/*
	* If port affinity is found and it exists in the port probes being launched, bring the particualr port probe to the start of the queue...
	*/
	_sortByServiceAffinity: function(probeInfo) {
		var ipsa = new IPServiceAffinity(probeInfo[0].ip)
		var port = ipsa.getServicePort();

		if (JSUtil.nil(port))
			return probeInfo;

		var newArr = [];
		for (var i=0; i<probeInfo.length; i++) {
			var pprobe = probeInfo[i];
			if (pprobe.scannerPort == port)
				newArr.unshift(pprobe); // move it to the beginning of the array
			else
				newArr.push(pprobe);
		}

		return newArr;
	},

	hasMultipleIpServices: function(portProbe) {
		var gr = new GlideRecord('discovery_port_probe');
		gr.addQuery('sys_id', portProbe);
		gr.query();
		gr.next();
		return gr.services.split(',').length > 1;
	},

    size: function() {
        return this.probeInfo.length;
    },

    type: "ClassifierProbes"
}
