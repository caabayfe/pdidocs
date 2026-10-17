var DiscoveryStatusMonitor;

(function () {
	var config = {
		typesOfDiscoveriesToMonitor: gs.getProperty('glide.discovery.schedule_monitoring.schedule_types_to_monitor', 'CIs').split(','),
		staleCheckSeconds: +gs.getProperty('glide.discovery.schedule_monitoring.stale_check_seconds'), // No default on purpose
		dryRun: gs.getProperty('glide.discovery.schedule_monitoring.dry_run', false) + '' == 'true',
		forceEccValidation: gs.getProperty('glide.discovery.schedule_monitoring.should_force_ecc_validation', false) + '' == 'true',
		debug: gs.getProperty('glide.discovery.status_counter.debug', false) == 'true',
		optimizeCounting: gs.getProperty('glide.discovery.status_counter.optimize_counting', true) == 'true'
	};

	var action = {
		cancel: 'Cancel',
		complete: 'Complete',
		noAction: 'No action'
	};

	DiscoveryStatusMonitor = {
		findAndHandlePotentialStuckStatuses: findAndHandlePotentialStuckStatuses,
		handleStatusWithConfig: handleStatusWithConfig,
		analyzeStatusWithConfig: analyzeStatusWithConfig,
		getPotentialStuckStatusesForDiscoveryTypes: getPotentialStuckStatusesForDiscoveryTypes,
		calculateCountersForStatus: calculateCountersForStatus,
		trackProbe: trackProbe,
		markProbesWithState: markProbesWithState,
		markProbesAsCompleted: markProbesAsCompleted,
		markProbesAsKilled: markProbesAsKilled,
		processStatuses: processStatuses,
		shouldUseOptimizedCountingForStatus: shouldUseOptimizedCountingForStatus,
		debug: debug,
		action: action,
		config: config
	};

	var LOGGER_NAME = 'DiscoveryStatusMonitor',
		LOG_PREFIX = '[' + LOGGER_NAME + '][sys_script_include_64949c364370311062f7f57c0ab8f26a]',
		nodeLogger = new sn_automation.AutomationAPI().getNodeLogger(LOGGER_NAME);

	function findAndHandlePotentialStuckStatuses(timeToConsiderStaleSeconds, startingDate) {
		var allAnalyses = [];

		config.staleCheckSeconds = timeToConsiderStaleSeconds || getStaleCheckSeconds();
		config.dateTimeConsideredStale = calculateTimeConsideredStale(config.staleCheckSeconds, startingDate);
		config.dateTimeConsideredExpired = calculateTimeConsideredExpired(config.staleCheckSeconds, startingDate);
		nodeLogger.debug(LOG_PREFIX + ' Config parameters: \n' + JSON.stringify(config));

		var potentialStuckStatusGr = DiscoveryStatusMonitor.getPotentialStuckStatusesForDiscoveryTypes(config.dateTimeConsideredStale, config.dateTimeConsideredExpired,
			config.typesOfDiscoveriesToMonitor);

		while (potentialStuckStatusGr.next()) {
			nodeLogger.debug(gs.getMessage('{0} Found {1} active statuses that were not updated for at least {2} mins',
				[LOG_PREFIX, potentialStuckStatusGr.getRowCount() + '', (config.staleCheckSeconds / 60).toFixed(1) + '']));

			var analysisResult = DiscoveryStatusMonitor.handleStatusWithConfig(potentialStuckStatusGr, config);
			allAnalyses.push(analysisResult);
		}

		return allAnalyses;
	}

	function handleStatusWithConfig(potentialStuckStatusGr, configParameters) {
		var analysisResult = DiscoveryStatusMonitor.analyzeStatusWithConfig(potentialStuckStatusGr, configParameters);

		nodeLogger.debug(gs.getMessage('{0} {1} Analysis Result: {2}', [LOG_PREFIX, potentialStuckStatusGr.number + '', JSON.stringify(analysisResult)]));
		logDecisionOnStatus(analysisResult.status.sysId, analysisResult.decision);

		if (configParameters.dryRun)
			return analysisResult;

		actOnDecision(potentialStuckStatusGr, analysisResult.decision);
		return analysisResult;

		function logDecisionOnStatus(statusId, decision) {
			if (decision.action == action.noAction)
				return;

			var dryRunLogMessage;

			if (configParameters.dryRun) {
				if (isMessageLoggedOnDryRun(statusId))
					return;
				dryRunLogMessage = gs.getMessage('This is dry run result. To take action, please set "glide.discovery.schedule_monitoring.dry_run" to "false"\n');
			}

			var msg = gs.getMessage('{0}Discovery decision: {1}.\nReason: {2}', [dryRunLogMessage || '', decision.action, decision.reason]);
			var dlog = new DiscoveryLogger(statusId);
			dlog.info(msg, 'DiscoveryStatusMonitor');
		}

		function isMessageLoggedOnDryRun(statusId) {
			var logGr = new GlideRecord('discovery_log');
			logGr.addQuery('status', statusId);
			logGr.addQuery('created_on', '>=', config.dateTimeConsideredExpired + '');
			logGr.addQuery('message', 'STARTSWITH', 'This is dry run result');
			logGr.addQuery('source', 'DiscoveryStatusMonitor');
			logGr.setNoCount();
			logGr.setLimit(1);
			logGr.query();

			return logGr.hasNext();
		}

		function actOnDecision(potentialStuckStatusGr, decision) {
			switch (decision.action) {
				case action.cancel:
					(new SncDiscoveryCancel()).cancelAll(potentialStuckStatusGr.sys_id);
					break;
				case action.complete:
					if (DiscoveryStatusMonitor.shouldUseOptimizedCountingForStatus(potentialStuckStatusGr))
						var counters = DiscoveryStatusMonitor.calculateCountersForStatus(potentialStuckStatusGr);
					else
						var counters = DiscoveryStatus.calculateCountersForStatus(potentialStuckStatusGr);

					potentialStuckStatusGr.started = counters.started;
					potentialStuckStatusGr.completed = counters.completed;

					markStatusAsCompleted(potentialStuckStatusGr);
					break;
			}
		}
	}

	function analyzeStatusWithConfig(potentialStuckStatusGr, configParameters) {
		var analysis = {
			status: {
				number: potentialStuckStatusGr.number + '',
				sysId: potentialStuckStatusGr.sys_id + '',
				state: potentialStuckStatusGr.state + ''
			}
		};
		configParameters.staleCheckSeconds = configParameters.staleCheckSeconds || getStaleCheckSeconds();
		configParameters.dateTimeConsideredStale = configParameters.dateTimeConsideredStale ||
			calculateTimeConsideredStale(configParameters.staleCheckSeconds);
		fillOutMissingConfigParameters(configParameters);

		if (DiscoveryStatus.allRecordsProcessed(potentialStuckStatusGr)) {
			if (shouldNotForceEccValidation()) {
				nodeLogger.debug(gs.getMessage('{0} {1}: Not performing ECC counting. \
					To turn on counting, please set "glide.discovery.schedule_monitoring.should_force_ecc_validation" to "true"', [LOG_PREFIX, potentialStuckStatusGr.number + '']));
				setDecision(action.complete, 'All ECC records were processed. Mark status as completed');

				return analysis;
			}
			nodeLogger.debug(gs.getMessage('{0} {1}: Validating all ECC records were recieved. Starting counting...', [LOG_PREFIX, potentialStuckStatusGr.number + '']));
			var countReport = DiscoveryStatus.countInputsPerOutputReportMismatch(potentialStuckStatusGr);

			if (countReport.mismatch) {
				setDecision(action.cancel, countReport.message);
				analysis.countReport = countReport;
			} else {
				setDecision(action.complete, countReport.message);
			}
			return analysis;
		}

		if (DiscoveryStatus.stillProcessingEccQueues(potentialStuckStatusGr)) {
			var message = gs.getMessage('Status has records in processing. No action needed.');
			nodeLogger.debug(gs.getMessage('{0} {1}: {2}', [LOG_PREFIX, potentialStuckStatusGr.number + '', message]));
			setDecision(action.noAction, message);
			return analysis;
		}

		if (DiscoveryStatus.anyEccUpdatedAtOrAfterStaleTime(potentialStuckStatusGr, configParameters.dateTimeConsideredStale)) {
			var message = gs.getMessage('Status has records that were updated recently. No action needed.');
			nodeLogger.debug(gs.getMessage('{0} {1}: {2}', [LOG_PREFIX, potentialStuckStatusGr.number + '', message]));
			setDecision(action.noAction, message);
			return analysis;
		}

		if (DiscoveryStatus.futureEventScheduled(potentialStuckStatusGr)) {
			var message = gs.getMessage('Status has future event scheduled to continue ECC queue processing. No action needed.');
			nodeLogger.debug(gs.getMessage('{0} {1}: {2}', [LOG_PREFIX, potentialStuckStatusGr.number + '', message]));
			setDecision(action.noAction, message);
			return analysis;
		}

		if (DiscoveryStatus.futureJobScheduled(potentialStuckStatusGr)) {
			var message = gs.getMessage('Status has future job scheduled. No action needed.');
			nodeLogger.debug(gs.getMessage('{0} {1}: {2}', [LOG_PREFIX, potentialStuckStatusGr.number + '', message]));
			setDecision(action.noAction, message);
			return analysis;
		}

		setDecision(action.cancel, 'No progress was detected on status. Cancel status.');
		return analysis;

		function fillOutMissingConfigParameters(configParameters) {
			configParameters = configParameters || {};

			Object.keys(config).forEach(function (key) {
				if (!configParameters.hasOwnProperty(key))
					configParameters[key] = config[key];
			});
		}

		function setDecision(action, reason) {
			analysis.decision = {
				action: action,
				reason: reason
			};
		}

		function shouldNotForceEccValidation() {
			return !configParameters.forceEccValidation;
		}
	}

	function getPotentialStuckStatusesForDiscoveryTypes(timeConsiderStale, timeConsiderExpired, typesOfDiscoveriesToMonitor) {
		timeConsiderStale = timeConsiderStale || calculateTimeConsideredStale(getStaleCheckSeconds());
		timeConsiderExpired = timeConsiderExpired || calculateTimeConsideredExpired(getStaleCheckSeconds());
		typesOfDiscoveriesToMonitor = typesOfDiscoveriesToMonitor || config.typesOfDiscoveriesToMonitor;

		var potentialStuckStatusGr = new GlideRecord('discovery_status');
		potentialStuckStatusGr.addQuery('state', 'Active');
		potentialStuckStatusGr.addQuery('discover', 'IN', typesOfDiscoveriesToMonitor);
		potentialStuckStatusGr.addQuery('sys_updated_on', '<=', timeConsiderStale + '');
		potentialStuckStatusGr.addQuery('sys_updated_on', '>=', timeConsiderExpired + '');
		potentialStuckStatusGr.query();

		return potentialStuckStatusGr;
	}

	function calculateTimeConsideredStale(timeToConsiderStaleSeconds, startingDate) {
		var dateTimeConsideredStale = startingDate ? new GlideDateTime(startingDate) : new GlideDateTime();
		dateTimeConsideredStale.addSeconds(-timeToConsiderStaleSeconds);

		return dateTimeConsideredStale;
	}

	function calculateTimeConsideredExpired(timeToConsiderStaleSeconds, startingDate) {
		var dateTimeConsideredExpired = startingDate ? new GlideDateTime(startingDate) : new GlideDateTime();
		dateTimeConsideredExpired.addSeconds(-2 * timeToConsiderStaleSeconds);

		return dateTimeConsideredExpired;
	}

	function getStaleCheckSeconds() {
		return config.staleCheckSeconds || 1200;
	}

	function calculateCountersForStatus(discoveryStatus) {
		var discoveryStatusGr = getDiscoveryStatusRecord(discoveryStatus);

		var counters = {
			started: 0,
			completed: 0
		};

		var probeTracker = new GlideAggregate('discovery_probes_tracker');
		probeTracker.addQuery('discovery_status', discoveryStatusGr.sys_id + '');
		probeTracker.addQuery('sys_created_on', '>=', discoveryStatusGr.sys_created_on + '');
		probeTracker.addAggregate('COUNT', 'state');
		probeTracker.query();

		if (!probeTracker.hasNext())
			throw new Error(sn_i18n.Message.getMessage('global-discovery', 'record_not_tracked_in_table', {
				value: discoveryStatusGr.number,
				tableName: 'discovery_probes_tracker'
			}));

		while (probeTracker.next()) {
			var totalCountForState = +probeTracker.getAggregate('COUNT', 'state');
			switch (probeTracker.state + '') {
				case 'in_progress':
					counters.started += totalCountForState;
					break;
				case 'killed_duplicate_ip':
				case 'completed':
					/*
					 * Started count should be total of ECC queue. If the job runs every X seconds,
					 * we may have outputs that were created as "in_progress" and moved to "completed"
					 * fast enough where the job misses it
					 */
					counters.completed += totalCountForState;
					counters.started += totalCountForState;
					break;
			}
		}

		return counters;
	}

	function trackProbe(outputEccQueue) {
		if (!outputEccQueue || !outputEccQueue.agent_correlator || !outputEccQueue.sys_id)
			return;

		var gr = new GlideRecord('discovery_probes_tracker');
		gr.setValue('state', 'in_progress');
		gr.setValue('discovery_status', outputEccQueue.agent_correlator + '');
		gr.setValue('output_ecc_queue', outputEccQueue.sys_id + '');

		var sysId = gr.insert();
		var outputDetails = '"' + outputEccQueue.sys_id + '". Status sysid: "' + outputEccQueue.agent_correlator + '"';

		if (sysId)
			DiscoveryStatusMonitor.debug('[sys_script_64949c364370311062f7f57c0ab8f26a] Tracking output ' + outputDetails);
		else
			DiscoveryStatusMonitor.debug('[sys_script_64949c364370311062f7f57c0ab8f26a] Failed to track output ' + outputDetails);
		return sysId;
	}

	function markProbesWithState(outputEccQueues, state, createdAtOrAfter /* optional */) {
		outputEccQueues = new DiscoArrayUtil().ensureArray(outputEccQueues);

		outputEccQueues.forEach(function (eccQueue) {
			var gr = new GlideRecord('discovery_probes_tracker');
			gr.addQuery('output_ecc_queue', eccQueue);

			if (createdAtOrAfter)
				gr.addQuery('sys_created_on', '>=', createdAtOrAfter);
			gr.query();

			gr.next();
			gr.setValue('state', state);
			gr.update();
		});
	}

	function markProbesAsCompleted(outputEccQueues, createdAtOrAfter /* optional */) {
		markProbesWithState(outputEccQueues, 'completed', createdAtOrAfter);
	}

	function markProbesAsKilled(outputEccQueues, createdAtOrAfter /* optional */) {
		markProbesWithState(outputEccQueues, 'killed_duplicate_ip', createdAtOrAfter);
	}

	function processStatuses(discoveryStatusesGr) {
		while (discoveryStatusesGr.next()) {
			// Don't process statuses that are not using optimized counting
			if (!discoveryStatusesGr.scratchpad.isOptimizedCounting)
				continue;

			// Handle stale status
			var statusStaleTimeSeconds = getStatusStaleTimeSeconds();
			var staleTimeLimitSeconds = +gs.getProperty('glide.discovery.status_counter.stale_limit_seconds', 60);

			if (statusStaleTimeSeconds >= staleTimeLimitSeconds) {
				/*
				 * Jail check before all processed check to make sure our tracking records are
				 * updated properly before potentially completing the status and move on
				 * 
				 * We want to check in Jail mechanism if we have ECC queues that were marked as duplicate
				 * In this use case, DiscoverySensorJob is not aware of the output ECC being completed and not updating the tracking table
				 * Reason is that SensorProcessor holds the ECC in "ready" state, which means "completed" is "false",
				 * and then when we call the revisit logic, it marks the ECC as processed on the Java layer
				 *
				 * We don't update the status's counters if they are the same, so if we see that the counters are the same
				 * for a little while, we check the Jail table to see if there were ECC queues that were actually processed,
				 * and update the tracking table
				 */
				if (discoveryStatusesGr.discover + '' == 'CIs') {
					DiscoveryStatusMonitor.debug('Status stale time: ' + discoveryStatusesGr.sys_id + '\ntime: ' + statusStaleTimeSeconds + ' seconds. Checking for duplicate records in discovery_device_duplicate_ips');
					var duplicateProbes = getRecordsMarkedAsDuplicateByJail();

					DiscoveryStatusMonitor.debug('Closing duplicate records in discovery_probes_tracker for status: ' + discoveryStatusesGr.sys_id + ' and outputs: ' + duplicateProbes);
					DiscoveryStatusMonitor.markProbesAsKilled(duplicateProbes, discoveryStatusesGr.sys_created_on + '');
				}

				// If all ECC queues were processed, we can mark the status as completed
				if (DiscoveryStatus.allRecordsProcessed(discoveryStatusesGr)) {
					var counters;
					try {
						counters = DiscoveryStatusMonitor.calculateCountersForStatus(discoveryStatusesGr);
					} catch (e) {
						log(sn_i18n.Message.getMessage('global-discovery', 'failed_to_calculate_counters_for_status', {
                            statusNumber: discoveryStatusesGr.number + '',
							errorMessage: e.message
						}), 'debug');
						continue;
					}

					discoveryStatusesGr.started = counters.started;
					discoveryStatusesGr.completed = counters.completed;

					DiscoveryStatusMonitor.debug('All ECC queues processed for status: ' + discoveryStatusesGr.number);
					markStatusAsCompleted(discoveryStatusesGr);
					continue;
				}
			}

			if (statusCompleted(discoveryStatusesGr))
				markStatusAsCompleted(discoveryStatusesGr);

			var counters;
			try {
				counters = DiscoveryStatusMonitor.calculateCountersForStatus(discoveryStatusesGr);
			} catch (e) {
				log(sn_i18n.Message.getMessage('global-discovery', 'failed_to_calculate_counters_for_status', {
                    statusNumber: discoveryStatusesGr.number + '',
					errorMessage: e.message
				}), 'debug');
				continue;
			}

			DiscoveryStatusMonitor.debug('Counters data for status: ' + discoveryStatusesGr.sys_id + ' ' + JSON.stringify(counters));

			if (DiscoveryStatus.setCountersForStatus(counters.started, counters.completed, discoveryStatusesGr))
				DiscoveryStatusMonitor.debug('Updated counters for status: ' + discoveryStatusesGr.sys_id);
		}

		function getStatusStaleTimeSeconds() {
			var now = new GlideDateTime().getNumericValue();
			var lastUpdated = discoveryStatusesGr.sys_updated_on.dateNumericValue();

			return Math.floor((now - lastUpdated) / 1000);
		}

		function getRecordsMarkedAsDuplicateByJail() {
			var duplicateProbes = [];

			var duplicateIpGr = new GlideRecord('discovery_device_duplicate_ips');
			duplicateIpGr.addQuery('status', discoveryStatusesGr.sys_id + '');
			duplicateIpGr.addQuery('state', 'duplicate');
			duplicateIpGr.query();

			while (duplicateIpGr.next())
				duplicateProbes.push(duplicateIpGr.ecc_queue.response_to + '');
			return duplicateProbes;
		}

		function statusCompleted(status) {
			if (status.discover == 'AutoConfiguration')
				return;

			if (+status.started == 0 || +status.started > +status.completed)
				return;

			if (DiscoveryStatus.isStatusWaitingForDependency(status))
				return;

			if (status.state == 'Canceled')
				return;

			var dp = new DiscoveryPhaser(current);
			return !dp.hasNextPhase();
		}
	}

	function shouldUseOptimizedCountingForStatus(discoveryStatus) {
		if (!discoveryStatus)
			throw new Error(sn_i18n.Message.getMessage('global-discovery', 'value_to_be_sysid_gliderecord', {
				value: discoveryStatus,
				tableName: 'discovery_status'
			}));

		var statusSysId = discoveryStatus.sys_id || discoveryStatus;

		// Try g_status first if available and matches - Cheap check. No need optimizeCounting condition
		if (typeof g_status !== 'undefined' && g_status && g_status.sysID == statusSysId)
			return g_status.scratchpad.isOptimizedCounting;

		// Fall back to querying the status record
		var discoveryStatusGr = getDiscoveryStatusRecord(discoveryStatus);
		return discoveryStatusGr.scratchpad.isOptimizedCounting;
	}

	function markStatusAsCompleted(statusGr) {
		statusGr.state = 'Completed';
		statusGr.update();

		if (statusGr.scratchpad.isOptimizedCounting)
			gs.eventQueue('discovery.phase.complete', statusGr);
	}

	function debug(message) {
		if (config.debug)
			gs.log(message, LOGGER_NAME);
	}

	// Not a true log level implementation.
	function log(message, logLevel) {
		switch (logLevel) {
			case 'debug':
				debug(message);
				break;
			default:
				gs.log(message, LOGGER_NAME);
				break;
		}
	}

	function getDiscoveryStatusRecord(status) {
		// Validate input
		if (!status) {
			throw new Error(sn_i18n.Message.getMessage('global-discovery', 'value_to_be_sysid_gliderecord', {
				value: status,
				tableName: 'discovery_status'
			}));
		}

		// If the input is a string, treat it as a sys_id and fetch the GlideRecord
		if (typeof status === 'string') {
			var discoveryStatusGr = new GlideRecord('discovery_status');
			if (!discoveryStatusGr.get('sys_id', status)) {
				throw new Error(sn_i18n.Message.getMessage('global-discovery', 'value_invalid_sysid_of_table', {
					value: status,
					tableName: 'discovery_status'
				}));
			}
			return discoveryStatusGr;
		}

		// Return the GlideRecord if the input is already a valid GlideRecord
		return status;
	}
})();
