var DiscoverySensorJob = Class.create();

DiscoverySensorJob.buildJobNameFromEcc = function(eccGr) {
	var probe	= eccGr.getValue('name');
	var source	= eccGr.getValue('source');
	var sysId	= eccGr.getValue('sys_id');
	var jobName = probe + ' (' + source + ') ' + sysId;

	if (gs.nil(probe) || (probe.indexOf('MultiPage') == -1 && probe.indexOf('Orchestrator Page') == -1))
		return 'ASYNC: Discovery - Sensors ' + jobName;

	if (probe.indexOf('MultiPage') != -1)
		return 'ASYNC: Discovery - MultiPage Sensors ' + jobName;

	return 'ASYNC: Discovery - Orchestrator Page Sensors ' + jobName;
};

// Try to get info about an ecc_queue input's transaction.
// We try to find any syslog record for the transaction and then we get the
// transaction ID from the syslog's context_map.
// Special situations:
// 1. The "Begin processing" syslog may be disabled
// 2. When using events for sensor processing there will be multiple sensors processed in a single transaction
// 3. Ideally we'd get log messages created before or after sensor processing (if there are any).
DiscoverySensorJob.getTxInfo = function(eccGr, getSequence) {
	var gr,
		msg = 'Begin processing ' + DiscoverySensorJob.buildJobNameFromEcc(eccGr),
		result = { earliest: new GlideDateTime(eccGr.sys_created_on) };

	if (eccGr.state == 'processed' || eccGr.state == 'error')
		result.latest = new GlideDateTime(eccGr.sys_updated_on);
	else
		result.latest = new GlideDateTime();
	result.latest.addSeconds(3);		// Add some buffer to the time bound - We'd rather be slightly inefficient than miss logs.

	// Find the syslog message that gets created when the sensor starts
	gr = getGr();
	gr.addQuery('message', msg);
	gr.query();
	if (gr.next())
		result.startSeq = gr.sequence + '';
	else {
		// We couldn't get the 'start of processing' syslog. Try to find a discovery_log for the ecc_queue input.
		getSequence = false;
		gr = getGr('discovery_log');
		gr.addQuery('sensor', eccGr.sys_id);
		gr.orderBy('sequence');
		gr.setLimit(1);
		gr.query();
		if (!gr.next())
			return;
	}

	result.txId = gr.context_map._txid;

	if (getSequence) {
		gr = getGr();
		gr.addQuery('context_map', 'CONTAINS', result.txId);
		gr.addQuery('sequence', '>', result.startSeq);
		gr.addQuery('message', '!=', msg);
		gr.addQuery('message', 'STARTSWITH', 'Begin processing ');
		gr.orderBy('sys_created_on');
		gr.orderBy('sequence');

		gr.query();
		if (gr.next()) {
			result.latest = new GlideDateTime(gr.sys_created_on);
			result.endSeq = gr.sequence + '';
		}
	}

	gr = getGr('syslog_transaction');
	gr.addQuery('sys_id', 'STARTSWITH', result.txId);
	gr.query();
	if (gr.next()) {
		result.hasTxLog = true;
		result.latest = new GlideDateTime(gr.sys_created_on);
	}

	return result;

	function getGr(table) {
		var gr = new GlideRecord(table || 'syslog');
		gr.addQuery('sys_created_on', '>=', result.earliest);
		gr.addQuery('sys_created_on', '<=', result.latest);
		return gr;
	}
};

DiscoverySensorJob.prototype = {
    initialize: function() {
    },

	process: function() {

		// when TransactionCancelledException is thrown the global.current variable is set to undefined depending on where
		// (horizontal discovery sensor, pre sensor script) the exception is thrown. The reason is unknown and to avoid issues
		// with updating discovery completed count, we are passing current as a local variable when calling runSensor().
		this.runSensor(current);

	},

	runSensor: function(current) {
		var completed, duplicate, sp,
			logStart = gs.getProperty('glide.discovery.log_sensor_start', 'false') == 'true',
			fileName = '[sys_script_include_78dfb2dd536002001f175f43911c087d]';

		try {
			gs.getSession().putProperty('disable.labels', true);

			// Note that this exact string is used in getTxInfo() (above).
			// If you change this message then you need to change that function too.
			if (logStart)
				gs.log('Begin processing ' + DiscoverySensorJob.buildJobNameFromEcc(current), 'DiscoverySensorJob');

			sp = new SncSensorProcessor(current);
			duplicate = sp.isDuplicate();
			if (duplicate)
				return;

			completed = sp.process();
			sp.resetDiscoveryTransactionQuota();

			DiscoveryStatusMonitor.debug(fileName + ' SensorProcessor finished processing ECC input "' + current.sys_id + '" for ECC output "' + current.response_to + '" as part of status "' + current.agent_correlator + '". Output completed state: ' + completed);

			// Check whether DiscoveryPageManager is available to the plugin, if it's not then we don't need to handle it
			var pageManagerAvailable = (typeof DiscoveryPageManager !== 'undefined');

			if (pageManagerAvailable && completed) {
				/*
				* In case SensorProcessor have processed an input, we let DiscoveryPageManager decide whether the entire
				* pagination was done.
				* A single input can be a part of a larger discovery containing multipages or a paginated pattern and
				* SensorProcessor has a view of the multipage proces, but not on a paginated discovery
				*/
				var isPaginationOver = DiscoveryPageManager.isPaginationFinished(current.response_to + '', current.getValue('sys_id'));

				if (isPaginationOver)
					DiscoveryPatternOrchestratorEventHandler.onPatternExecutionCompleted(current.agent_correlator + '', current.response_to + '');

				/*
				* The 'completed' variable is one of the keys for increasing the 'Completed' count on a status
				* We need to increase the discovert status's 'Completed' count when we are done with ALL pages
				* of a single execution [multipages or pages coming as part of a paginated pattern]
				*/
				completed = isPaginationOver;
			}

			if (completed)
				DiscoveryStatusMonitor.debug(fileName + ' Finished processing ECC output "' + current.response_to + '" as part of status "' + current.agent_correlator + '". Output completed state: ' + completed);

			DiscoveryStatusMonitor.debug(fileName + ' Status: ' + current.agent_correlator + ' - ECC output ' + current.response_to + ' states are:\ncompleted: ' + completed + '\nduplicate: ' + duplicate);

		} catch(e) {
			sp.resetDiscoveryTransactionQuota();
			gs.logError('SensorProcessor failed for ECC queue record ' + current.sys_id + ' - ' + e);

			// Don't want this record to sit in ready state:
			if (current.state != 'processed') {
				current.state = 'error';
				current.error_string = 'Exception during sensor processing: ' + e;
				current.setWorkflow(false);
				current.update();
				current.setWorkflow(true);
			}
			completed = true;
		}
		finally {
			/*
			 * PRB945908: do not update completed count if this
			 * input record was a duplicate of one already processed
			 */
			if (completed && !duplicate) {
				sp.resetDiscoveryTransactionQuota();

				if (!gs.nil(current.agent_correlator + '')) {
					if (DiscoveryStatusMonitor.shouldUseOptimizedCountingForStatus(current.agent_correlator + '')) {
						DiscoveryStatusMonitor.debug(fileName + ' Finished tracking output "' + current.response_to + '" as part of status "' + current.agent_correlator);
						DiscoveryStatusMonitor.markProbesAsCompleted(current.response_to + '', current.response_to.sys_created_on);
					} else {
						DiscoveryStatus.updateStatusCompletedCount(current.getValue('agent_correlator'));
					}
				}
			}
		}

		// Let the LabelEngine do it's job
		gs.getSession().clearProperty('disable.labels');
	},

    type: 'DiscoverySensorJob'
};
