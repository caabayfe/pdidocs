// Discovery class

/**
 * Handles all the details of launching a Shazzam probe for a given discovery.
 *
 * Tom Dilatush tom.dilatush@service-now.com
 */
var ShazzamLaunch = Class.create();

ShazzamLaunch.prototype = Object.extendsObject(DiscoveryLaunch, {
	/*
	 * Initializes this instance.
	 *
	 * status:   the DiscoveryStatus instance for this discovery.
	 * schedule: the DiscoverySchedule instance for this discovery.
	 */
	initialize: function(status, schedule) {
		DiscoveryLaunch.prototype.initialize.call(this, status, schedule);

		this.useJSONForRanges = GlideProperties.getBoolean('glide.discovery.shazzam_ranges_json', false);

		if (schedule && schedule.valid)
			this.ERROR_KEY = 'ShazzamLaunch_' + this.schedule.name;
		else // quick discovery or triggered without a schedule; will replace later when we know the IP
			this.ERROR_KEY = 'ShazzamLaunch';
	},

	// This will be the total number of Shazzam probes that will be used in the entire schedule.
	// It gets added as the probe parameter 'shazzam_probes'. When delaying wbem probes until
	// the end we count the number of Shazzam ECC recs and compare it to this number to know if
	// all Shazzams are complete.
	totalShazzams: 0,

	/*
	 * Launches Shazzam probes as necessary, depending on the current phase of each behavior used.
	 *
	 * ip:        The comma-separated list of IPs to fire probes for
	 * samePhase: true if this launch should use the same phase as is currently running
	 * sensor:    sys_id of sensor that launched this (only in network discovery)
	 * returns:   true if any probes were launched.
	 */
	launch: function(ip, samePhase, sensor) {
		// Check if there are errors in Discovery Schedule before starting Shazzam
		var error = this.schedule.errorsInSchedule();
		if (error)
			return this._logErrorAndCancelStatus(error);

		// If there is no valid schedule, then we're targetting a single IP.  Use this as key to log common errors
		if (this.schedule && !this.schedule.valid)
			this.ERROR_KEY = ip;

		try {
			// flush the range cache, so we don't accumulate excludes from DiscoveryPhaser...
			if (!this.schedule.readCache)
				GlideCacheManager.flush('DiscoveryRangesDB');

			// Set ranges for Shazzam
			this.schedule.setRanges();

			// Check if schedule-level attribute history exists
			if (JSUtil.nil(DiscoveryApiAttribute.getCIAttributeHistoryGr(this.schedule.sysID, 'schedule'))) {
				// Data is dirty -- delete all attribute history associated with this schedule
				DiscoveryApiAttribute.deleteCIAttributeHistory(this.schedule.sysID);

				// Create schedule-level attribute history
				var ciAttributesSchedule = DiscoveryApiAttribute.getCIAttributes(this.schedule.sysID);
				DiscoveryApiAttribute.insertCIAttributeHistoryForRange(this.schedule.sysID, JSON.stringify(DiscoveryApiAttribute.reconcileCIAttributes(ciAttributesSchedule)));

				//Set unoptimized ranges
				this.schedule.setRangesUnoptimized();

				for (var i = 0; i < this.schedule.rangesUnoptimized.length; i++) {
					var ipCollection = this.schedule.rangesUnoptimized[i];
					var type = ipCollection.type;
					var rangeItemId = ipCollection.rangeItemId;
					var rangeSetId = ipCollection.rangeSetId;

					// Reconcile attributes from range, range set, and schedule level
					var ciAtrributesRangeItem = DiscoveryApiAttribute.getCIAttributes(rangeItemId);
					var ciAttributesRangeSet = DiscoveryApiAttribute.getCIAttributes(rangeSetId);

					var ciAttributesJSON = JSON.stringify(DiscoveryApiAttribute.reconcileCIAttributes(ciAttributesSchedule, ciAtrributesRangeItem, ciAttributesRangeSet));

					// Add start and end IP for network/range
					if (type == 'IP Network' || type == 'IP Address Range') {
						var startingIp = ipCollection.firstUsableAddress;
						var endingIp = ipCollection.lastUsableAddress;
						DiscoveryApiAttribute.insertCIAttributeHistoryForRange(this.schedule.sysID, ciAttributesJSON, startingIp, endingIp);
						// Add reference to discovery_range_item for IP Address List
					} else if (type == 'IP Address List') {
						DiscoveryApiAttribute.insertCIAttributeHistoryForRangeList(this.schedule.sysID, ciAttributesJSON, rangeItemId);
					}
				}
			}

			// Log all the IPs in the schedule that are part of the global IP Exclusion
			if (this._getShazzamProbeParamValue('debug') == 'true')
				this._logGloballyExcludedIPs();

			// This is being done in _fireShazzamProbes but we only get there if we have
			// an assigned MID.  When using optimal ranges there won't be any ranges or
			// MIDs so we can't rely on that check.
			if (!this.schedule.ranges.length) {
				this._logErrorAndCancelStatus('The Discovery range is empty.');
				return;
			}

			// iterate through our ranges, collecting port probes per MID server...
			var portProbes = {};
			for (var i = 0; i < this.schedule.ranges.length; i++) {
				if (!ip) {
					this.addRange(this.schedule.ranges[i], portProbes, samePhase);
				} else if (this.schedule.ranges[i].contains(SNC.IPAddress.get(ip)) || this.schedule.discoverNets()) {
					// If discovery is triggered using 'Discover Now', add the specific ip range and exit out.
					// For network discovery, the target IP will not be part of the ranges defined. Add the range and exit.
					this.addRange(this.schedule.ranges[i], portProbes, samePhase);
					break;
				}
			}

			// Log protocols disabled by the Discovery Configuration Console
			if (GlidePluginManager.isRegistered('com.snc.discovery')) {
				var disabledProtocols = DiscoConfigConsoleUtil.getDisabledProtocols();
				if (JSUtil.notNil(disabledProtocols)) {
					var msg = 'The following protocols have been disabled via the Configuration Console and will not be scanned by Shazzam: ' +
						disabledProtocols.join(", ");
					this._logWarning(msg);
				}
			}

			// For discoveryFromCI using behavior, fetch the IP address for next phase(s) from status.scratchpad
			// otherwise the next phase will scan the full range defined in the schedule instead of IP for just that CI
			if (!ip)
				ip = this.status.getIPFromCI();

			// Calculate the number of Shazzam probes that are going to be fired - this is used when delay_wbem is true.
			this.totalShazzams = 0;
			var midInfo = {};

			for (var midName in portProbes) {
				var ipInfo = {};
				var ipCollection = portProbes[midName].range;
				ipInfo.range = SNC.DiscoveryRanges.newDiscoveryRanges(ipCollection);
				ipInfo.ipCollectionSummary = ipCollection.summary; // save this since it contains the summary
				midInfo[midName] = ipInfo;
				var batchSize = this.schedule.shazzamBatchSize;
				var batches = ipInfo.range.toBatchesBySize(batchSize, this.status.sysID, true);
				this.totalShazzams += batches.length;
			}

			// now fire our shazzam probes...
			for (var midName in portProbes)
				this.fireShazzamProbe(portProbes[midName], ip, sensor);

			return this.probesLaunched;
		} catch (ex) {
			var errMsg = 'Script error while attempting to launch Shazzam ';
			this._logError(errMsg + ex.msg);

			var errorParams = {
				code: 'SN-5900',
				instance: this.status.sysID,
				key: this.ERROR_KEY,
				contextMap: {
					ip_address: ip,
					device_class: null
				},
				message: errMsg
			};
			DiscoveryErrorsUtilities.addError(errorParams);
		}
	},

	/*
	 * Add the given range and this discovery's port probes to scan (as defined by behavior) to the collection of
	 * MID servers and port probes that need to be probed.
	 * range:       an IPCollection containing the range to be discovered
	 * portProbes: a hashmap (by MID server name) of hashmaps containing these properties:
	 *     range:      an IPMetaCollection containing the ranges to be probed
	 *     midServer:  a MIDServer instance for the MID server to be probed
	 *     portProbes: a hashmap (by port probe name) of DiscoveryPortProbe instances to be probed
	 * samePhase:   true if this should use the same phase as is currently running
	 */
	addRange: function(ipiec, portProbes, samePhase) {
		// get our behavior...
		var behavior = this.schedule.getBehaviorForRange(ipiec);

		// if we've cached the next phase for this behavior, use that;
		// otherwise, figure out the next phase, bail out if there isn't one, otherwise set it, and cache it...
		var nextPhase = null;
		if (this.behaviorPhase[behavior.sysID] != null)
			nextPhase = this.behaviorPhase[behavior.sysID];
		else {
			var curPhase = this.status.getPhase(behavior);
			if (curPhase != null)
				nextPhase = samePhase ? curPhase : behavior.nextPhase(curPhase);
			else
				nextPhase = behavior.firstPhase();
			if (nextPhase == null) // bail out if there is no next phase...
				return;

			if (!samePhase)
				this.status.setPhase(behavior, nextPhase);
			this.behaviorPhase[behavior.sysID] = nextPhase;
		}

		// figure out what MID servers and what services to launch Shazzam probes for...
		var nextPhasePortProbes = behavior.getPortProbesForPhase(nextPhase, this.status);
		for (var i = 0; i < nextPhasePortProbes.length; i++)
			this.addPortProbe(nextPhasePortProbes[i], portProbes, ipiec, behavior && behavior.name);
	},

	/*
	 * Add a single port probe to our MID services collection
	 * midPPs:     a hashmap with two properties:
	 *     midServer:  a MIDServer instance
	 *     portProbes: a hashmap (by port probe name) of DiscoveryPortProbe instances
	 * portProbes: a hashmap (by MID server name) of hashmaps containing these properties:
	 *     range:      an IPMetaCollection containing the ranges to be probed
	 *     midServer:  a MIDServer instance for the MID server to be probed
	 *     portProbes: a hashmap (by port probe name) of DiscoveryPortProbe instances to be probed
	 * ipiec:      an IPIncludeExcludeCollection instance with the range to be probed
	 * behavior:   behavior associated with the given schedule
	 */
	addPortProbe: function(midPPs, portProbes, ipiec, behavior) {
		if (JSUtil.nil(midPPs.midServer)) {
			this._logError('MID Server not specified');
			return;
		}

		var midServer = midPPs.midServer;
		var midPortProbes = midPPs.portProbes;
		var midPortProbe = portProbes[midServer.name + ':' + behavior];

		// if this is the first time we've seen this MID server, make a new property for it...
		if (!midPortProbe) {
			midPortProbe = {};
			midPortProbe['midServer'] = midServer;
			midPortProbe['portProbes'] = midPortProbes;
			var range = SNC.IPCollection.newIPMetaCollection();
			range.add(ipiec);
			midPortProbe['range'] = range;
			portProbes[midServer.name + ':' + behavior] = midPortProbe;
		} else { // otherwise, since we've seen it before, just accumulate the new range and services...
			midPortProbe.range.add(ipiec); // this method ignores attempts to add the same range more than once...
			var existingPortProbes = midPortProbe.portProbes;
			for (var portProbeName in midPortProbes)
				existingPortProbes[portProbeName] = midPortProbes[portProbeName];
		}
	},

	/*
	 * Fire a Shazzam probe for the MID server and services in the given hashmap
	 * portProbe: a hashmap containing these properties:
	 *     range:      an IPMetaCollection containing the ranges to be probed
	 *     midServer:  a MIDServer instance for the MID server to be probed
	 *     portProbes: a hashmap (by port probe name) of DiscoveryPortProbe instances to be probed
	 * ip:        The comma-separated list of IPs to fire probes for
	 * sensor:    the sys_id of the sensor that launched this probe (network discovery only)
	 */
	fireShazzamProbe: function(portProbe, ip, sensor) {

		var midServer = portProbe.midServer;
		var range = portProbe.range;
		var probeSpec = this.makeProbeSpec(portProbe);
		var portProbeNames = [];
		for (var ppn in portProbe.portProbes)
			portProbeNames.push(ppn);
		this._fireShazzamProbes(range, midServer, probeSpec, portProbeNames.join(), ip, sensor);
		this.probesLaunched = true;
	},

	/*
	 * Make an XML port probe spec for the given port probe hashmap.
	 * portProbe: a hashmap containing these properties:
	 *     range:      an IPMetaCollection containing the ranges to be probed
	 *     midServer:  a MIDServer instance for the MID server to be probed
	 *     portProbes: a hashmap (by port probe name) of DiscoveryPortProbe instances to be probed
	 */
	makeProbeSpec: function(portProbe) {
		var xml = [];
		xml.push('<portprobes>');
		for (var ppn in portProbe.portProbes) {
			var pp = portProbe.portProbes[ppn];
			xml.push('<portprobe>');
			xml.push('<name>' + pp.name + '</name>');
			xml.push('<scanner>' + pp.scanner + '</scanner>');
			xml.push('<description>' + pp.description + '</description>');
			xml.push('<conditional>' + (pp.conditional ? 'true' : 'false') + '</conditional>');

			for (var qi = 0, qn = pp.serviceRegistryQueries.length; qi < qn; ++qi)
				xml.push(pp.serviceRegistryQueries[qi].toPortProbeXml());

			for (var i = 0; i < pp.services.length; i++) {
				var svc = pp.services[i];
				xml.push('<service>');
				xml.push('<name>' + svc.name + '</name>');
				xml.push('<port>' + svc.port + '</port>');
				xml.push('<type>' + svc.protocol + '</type>');
				xml.push('</service>');
			}

			xml.push('</portprobe>');
		}
		xml.push('</portprobes>');
		return xml.join('');
	},

	/*
	 * Fire a Shazzam probes for the given range, MID server (and all MID Servers in Cluster), and services
	 * range:      The IPCollection containing the range of IPs to probe.
	 * midServer:  The MIDServer instance for the MID server to fire the probe to.
	 * probeSpec:  A string containing an XML port probe spec.
	 * portProbes: A human readable string specifying the port probes to scan.
	 * ip:         The comma-separated list of IPs to fire probes for
	 * sensor:     the sys_id of the sensor that launched this probe (network discovery only)
	 */
	_fireShazzamProbes: function(range, midServer, probeSpec, portProbes, ip, sensor) {
		var discoveryRange;
		try {

			if (ip) {
				var ips = ('' + ip).split(',');
				var ip_coll = new SNC.IPCollection.newIPListCollection();
				for (var i = 0; i < ips.length; i++) {
					var lip = SNC.IPAddress.get(ips[i]);
					if (lip)
						ip_coll.add(lip);
				}

				discoveryRange = SNC.DiscoveryRanges.newDiscoveryRanges(ip_coll);
			} else if (this._isNetsInProgress()) {
				return;
			} else
				discoveryRange = SNC.DiscoveryRanges.newDiscoveryRanges(range);

			if (JSUtil.nil(discoveryRange)) {
				this._logErrorAndCancelStatus('The Discovery range cannot be created.');
				return;
			}

			// discoveryRange.size() is always returning undefined for some reason, even
			// though I see the correct value returned from the Java code.
			if (!discoveryRange.iterator().hasNext()) {
				this._logErrorAndCancelStatus('The Discovery range is empty.');
				return;
			}

			// If we have a MID cluster AND should batch Shazzam, we need to get break up Shazzam so all members trigger Shazzam
			// else auto-select chunking magic happens
			// else trigger shazzam for a specific mid

			var shouldBatch = this.schedule.shazzamClusterSupport;

			//handle specific mid and behavior (ignoring batching)
			if (this.schedule.midSelectSpecificCluster() && (shouldBatch == true)) {
				var clusterSysId = this.schedule.midClusterID;

				//TODO: Use ECCAgentClusterCache(M2M)
				var cluster = new GlideRecord('ecc_agent_cluster');
				if (!cluster.get(clusterSysId))
					throw "Unable to locate MID Server Cluster with sys_id=" + clusterSysId;

				if (cluster.type == 'Failover') { // don't batch
					// can't trust the MID selected by legacy code
					this._fireShazzamProbeForSingleMid(null, discoveryRange, probeSpec, portProbes, sensor);
					return;
				}

				// find all valid mids in the midcluster
				var midSelector = new SNC.MidSelector();
				var agents = midSelector.selectAllDegradedOrBetterMidServersFromClusterEx(this.schedule.getAppName(), clusterSysId);

				var batchSize = this.schedule.shazzamBatchSize || 500;
				var batches = discoveryRange.toBatchesByNum(agents.length, batchSize);

				var probes = [];
				this.totalShazzams = 0;
				for (var i = 0; i < batches.length; i++) {
					var probe = SncProbe.get('Shazzam');
					this.totalShazzams += this._setRange(probe, discoveryRange, batches[i], i > 0 ? false : true);
					probes.push(probe);
				}

				if (batches.length > agents.length)
					this._logInfo('More IP range batches than MID servers, probably due to exclusion ranges, agents=' +
						agents.length + ', batches=' + batches.length);
				var randomStartMID = Math.floor(Math.random() * agents.length);
				for (var i = 0; i < batches.length; i++) {
					this._fireShazzamProbe(probes[i], agents[(i + randomStartMID) % agents.length], probeSpec, portProbes, sensor);
				}
			} else if (this.schedule.midSelectAuto()) {
				this._fireShazzamProbeForAutoSelect(discoveryRange, probeSpec, portProbes, sensor);
			} else {
				this._fireShazzamProbeForSingleMid(midServer.name, discoveryRange, probeSpec, portProbes, sensor);
			}

		} catch (e) {
			this._logErrorAndCancelStatus('' + e.message);
			gs.error('Error in fireShazzamProbes: ' + e + '\n' + e.name + ' (' + e.message + ')');

			var itomErrorCode = 'SN-5999';
			var errorMsg = '' + e.message;

			if ((errorMsg.indexOf('No valid MID Server') !== -1) || (errorMsg.indexof('Unable to find any validated MID Server') !== -1))
				itomErrorCode = 'SN-5601';

			var errorParams = {
				code: itomErrorCode,
				source: this.schedule.sysID,
				instance: this.status.sysID,
				key: this.ERROR_KEY,
				contextMap: {
					ip_address: ip,
					device_class: null
				},
				message: errorMsg
			};
			DiscoveryErrorsUtilities.addError(errorParams);
		}
	},

	_getMIDServerGr: function(agentName) {
		var agentCache = new SNC.ECCAgentCache();
		var gr = agentCache.getByName(agentName);

		if (!gr)
			return;

		return gr;
	},

	_getMIDJEAEndpoint: function(agentName) {
		var result = '';
		var agentGr = this._getMIDServerGr(agentName);
		if (agentGr) {
			var gr = new GlideRecord('ecc_agent_config');
			gr.addQuery('ecc_agent', agentGr.sys_id);
			gr.addQuery('param_name', 'mid.powershell.jea.endpoint');
			gr.query();
			if (gr.next())
				result = '' + gr.value;
		}
		return result;
	},

	_logJEAEndpointInfo: function(agentName) {
		var endpoint = this._getMIDJEAEndpoint(agentName);
		if (endpoint)
			this._logInfo('MID Server ' + agentName + " JEA Endpoint is " + endpoint);
	},

	_fireShazzamProbeForSingleMid: function(midName, discoveryRange, probeSpec, portProbes, sensor) {
		var probe = SncProbe.get('Shazzam');
		this._setRange(probe, discoveryRange, discoveryRange, true);
		this._fireShazzamProbe(probe, midName, probeSpec, portProbes, sensor);
	},

	_fireShazzamProbeForAutoSelect: function(discoveryRange, probeSpec, portProbes, sensor) {
		// Get a list of OptimalRanges.  Each OptimalRange contains a list of IPRangeV4 and a list of
		// suitable MID Servers to handle the IP ranges.  Each IP range will not exceed shazzam batch size
		// so it is safe to iterate through each range and trigger a Shazzam probe, but we're going to be
		// a little smatter and consolidate the IP ranges per MID and trigger a Shazzam probe per MID.

		var optimalRangesArr = SNC.IPCollectionUtil.getOptimalRanges(this.schedule.getAppName(),
			discoveryRange.getRanges(), this.schedule.shazzamBatchSize);

		var shazzamProbesPerMid = {}; // a map of MID Server to IP Collection of targets
		var ignoredRanges = new SNC.IPMetaCollection();

		for (var i = 0; i < optimalRangesArr.length; i++) {
			var ranges = optimalRangesArr[i].getRanges(); // IPRangeV4[]
			var selectableMids = optimalRangesArr[i].getMids(); // MidServer[]

			if (selectableMids.length == 0) {
				// see if we can use the default MID
				var mid = MIDServer.getDefault(this.schedule);

				if (mid == null) {
					// if not, add it to our list of ignored IP ranges
					for (var j = 0; j < ranges.length; j++)
						ignoredRanges.add(ranges[j].getRange());
				} else {
					if (JSUtil.nil(shazzamProbesPerMid[mid.getName()]))
						shazzamProbesPerMid[mid.getName()] = new SNC.IPMetaCollection();

					for (var j = 0; j < ranges.length; j++) {
						this._logInfo('Falling back to default MID ' + mid.getName() + ' for range ' + ranges[j].getSummary());
						shazzamProbesPerMid[mid.getName()].add(ranges[j].getRange());
					}
				}

				continue;
			}

			var index = Math.floor(Math.random() * selectableMids.length);

			for (var j = 0; j < ranges.length; j++) {
				// round robin through the MIDs, starting with a random one
				index++;
				index = index % selectableMids.length;

				var range = ranges[j];
				var mid = selectableMids[index].getName() + '';

				if (JSUtil.nil(shazzamProbesPerMid[mid]))
					shazzamProbesPerMid[mid] = new SNC.IPMetaCollection();

				shazzamProbesPerMid[mid].add(range.getRange());
			}
		}

		if (!ignoredRanges.isEmpty()) {
			var errMsg = 'No MID Server can be selected to target the following ranges ' + ignoredRanges.getSummary();

			this._logWarning(errMsg);

			var errorParams = {
				code: 'SN-5601',
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


		if (Object.keys(shazzamProbesPerMid).length == 0) {
			var errMsg = 'Canceling Discovery since no MID Servers capable of handling any of the ip ranges';
			var errorParams = {
				code: 'SN-5601',
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
			this._logErrorAndCancelStatus(errMsg);
			return;
		}

		// Calculate the number of Shazzam probes that are going to be fired - this is used by Shazzam's sensor
		// when delay_wbem is true.  We could skip the calculation when delay_wbem is false but this is a cheap
		// calculation.
		this.totalShazzams = 0;
		var midInfo = {};

		for (var mid in shazzamProbesPerMid) {
			var ipInfo = {};
			var ipCollection = shazzamProbesPerMid[mid].getIPCollection();
			ipInfo.range = SNC.DiscoveryRanges.newDiscoveryRanges(ipCollection);
			ipInfo.ipCollectionSummary = ipCollection.getSummary(); // save this since it contains the summary
			midInfo[mid] = ipInfo;
			var batchSize = this.schedule.shazzamBatchSize;
			var batches = ipInfo.range.toBatchesBySize(batchSize, this.status.sysID, true);
			this.totalShazzams += batches.length;
		}

		for (var mid in midInfo) {
			try {
				var probe = SncProbe.get('Shazzam');
				this._setRange(probe, discoveryRange, midInfo[mid].range, true);
				this._fireShazzamProbe(probe, mid, probeSpec, portProbes, sensor);
				this._logInfo('MID Server ' + mid + ' targeting range ' + midInfo[mid].ipCollectionSummary);
			} catch (e) {
				this._logWarning(e.message + ' for range ' + midInfo[mid].ipCollectionSummary);
				var errorParams = {
					code: 'SN-5999',
					source: this.schedule.sysID,
					instance: this.status.sysID,
					key: this.ERROR_KEY,
					contextMap: {
						ip_address: null,
						device_class: null
					},
					message: e.message
				};
				DiscoveryErrorsUtilities.addError(errorParams);
			}
		}
	},

	/*
	 * Fire a Shazzam probe for the given range, MID server Name, and services
	 * probe:      The Shazzam probe instance
	 * midServer:  The MIDServer instance, or in the case of auto select, the list of MIDServer instances for the MID server to fire the probe to.
	 * probeSpec:  A string containing an XML port probe spec.
	 * portProbes: A human readable string specifying the port probes to scan.
	 * sensor:     the sys_id of the sensor that launched this probe (network discovery only)
	 */
	_fireShazzamProbe: function(probe, midServerName, probeSpec, portProbes, sensor) {

		// Every path that gets here needs to calculate the total number of Shazzam probes
		// that are going to be triggered.  Shazzam's sensor needs this when delay_wbem is true.
		if (!this.totalShazzams)
			throw 'Total number of shazzam probes is unknown';

		try {
			probe.setName(portProbes);
			probe.addParameter('port_probe_spec', probeSpec);
			probe.setCorrelator(this.status.sysID);
			// Set Shazzam probe with priority "Expedited"
			var eccPriority = '1';
			probe.setEccPriority(eccPriority);

			probe.addParameter('shazzam_probes', this.totalShazzams);

			// This is to dictate how shazzam ought to report the status of target
			if (this.status.includeActiveAlive || this.status.includeAll)
				probe.addParameter('shazzam_report_inactive', 'true');

			// This is to dictate how shazzam ought to report the status of target
			if (this.status.includeAll)
				probe.addParameter('shazzam_report_dead', 'true');

			if (this.status.useSnmpVersion == 'v1_v2c')
				probe.addParameter('SNMP_use_v3', 'false');

			if (this.status.useSnmpVersion == 'v3')
				probe.addParameter('SNMP_use_v1_v2c', 'false');

			// Check if DiscoveryStatus's priority is set and higher (smaller number) than current probe's priority
			if (this.status.priority && (parseInt(this.status.priority, 10) < parseInt(eccPriority, 10)))
				probe.setEccPriority(this.status.priority);

			if (this.schedule.midSelectAuto())
				probe.createForAutoSelectStartingWithMid(this.schedule.getAppName(), null, sensor ? sensor : null, midServerName);
			else if (this.schedule.midSelectSpecificCluster())
				probe.createForClusterStartingWithMid(midServerName, this.schedule.getAppName(), this.schedule.midClusterID, sensor ? sensor : null);
			else
				probe.createForMidServer(midServerName, sensor ? sensor : null);

			this._logJEAEndpointInfo(midServerName);

		} catch (e) {
			if (this.schedule.midSelectAuto())
				throw e;		// continue throwing so we can log the range summary
			else
				this._logErrorAndCancelStatus(''+ e.message);

			var errorParams = {
				code: 'SN-5999',
				source: this.schedule.sysID,
				instance: this.status.sysID,
				key: this.ERROR_KEY,
				contextMap: {
					ip_address: null,
					device_class: null
				},
				message: '' + e.message
			};
			DiscoveryErrorsUtilities.addError(errorParams);
			gs.error('Error in fireShazzamProbe: ' + e + '\n' + e.name + ' (' + e.message + ')');
		}
	},

	_isNetsInProgress: function() {
		if (!this.schedule.discoverNets())
			return false;

		var gr = new GlideRecord('discovery_status');
		if (!this.status.sysID || !gr.get('sys_id', this.status.sysID))
			return false;

		return gr.state != 'Starting';
	},

	_setRange: function(probe, dr, midRange, log) {
		var fullRangeString, midRangeString, rangeString;

		probe.setSource('See Payload');

		var batchSize = this.schedule.shazzamBatchSize;
		var batches = midRange.toBatchesBySize(batchSize, this.status.sysID, log);

		if (this.useJSONForRanges) {
			probe.addParameter('json_ranges', true);

			fullRangeString = dr.toJSON();
			midRangeString = midRange.toJSON();
			rangeString = batches[0].toJSON();
			if (fullRangeString)
				probe.addTextNodeParameter('full_range', fullRangeString);
			if (midRangeString)
				probe.addTextNodeParameter('mid_range', midRangeString);
			if (rangeString)
				probe.addTextNodeParameter('range', rangeString);
		} else {
			fullRangeString = GlideXMLUtil.toString(dr.toXML().getDocumentElement());
			midRangeString = GlideXMLUtil.toString(midRange.toXML().getDocumentElement());
			rangeString = GlideXMLUtil.toString(batches[0].toXML().getDocumentElement());
			if (fullRangeString)
				probe.addParameter('full_range', fullRangeString);
			if (midRangeString)
				probe.addParameter('mid_range', midRangeString);
			if (rangeString)
				probe.addParameter('range', rangeString);
		}

		probe.addParameter('range_index', 0);

		return batches.length;
	},

	_logGloballyExcludedIPs: function() {
		try {
			var discoveryType = this.schedule.discover;
			if (discoveryType == Discovery.TYPE.ConfigurationItems ||
				discoveryType == Discovery.TYPE.IpAddresses ||
				discoveryType == Discovery.TYPE.Networks) {
				var excludedIPs = SncDiscoveryRangesDB.getGloballyExcludedIPs(this.schedule.sysID);

				if (excludedIPs && !excludedIPs.isEmpty())
					this.dLogger.debug('Excluded the following IP(s) from discovery as they are part of Global IP Exclusion:\n ' + excludedIPs, 'ShazzamLaunch');
			}
		} catch (e) {
			this._logWarning('Error occurred while logging globally excluded IP for discovery_schedule.sysId=' + this.schedule.sysID + ' due to :' + e.toString());
		}
	},

	/*
	 * Return Shazzam probe parameter value if defined, otherwise return false
	 */
	_getShazzamProbeParamValue: function(paramName) {
		var probeParamGr = new GlideRecord('discovery_probe_parameter');
		probeParamGr.addQuery('probe', SncProbe.get('Shazzam').getId());
		probeParamGr.addQuery('name', paramName);
		probeParamGr.query();
		if (probeParamGr.next()) {
			return probeParamGr.value;
		}

		return;
	},

	_logInfo: function(msg) {
		this.dLogger.setLevel(DiscoveryLogger.INFO);   // enforce the level
		this.dLogger.info(msg, 'ShazzamLaunch');
	},

	_logError: function(msg) {
		this.dLogger.setLevel(DiscoveryLogger.ERROR);
		this.dLogger.error(msg, 'ShazzamLaunch');
	},

	_logWarning: function(msg) {
		this.dLogger.setLevel(DiscoveryLogger.WARNING);
		this.dLogger.warn(msg, 'ShazzamLaunch');
	},

	_logErrorAndCancelStatus: function(msg) {
		this._logError(msg);

		var dac =  new SncDiscoveryCancel();
		dac.cancelAll(this.status.sysID);
	},

	type: "ShazzamLaunch"
});
