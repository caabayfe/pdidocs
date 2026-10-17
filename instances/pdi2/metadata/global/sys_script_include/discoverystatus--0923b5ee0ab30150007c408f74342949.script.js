/**
 * 
 * Encapsulates the notion of a Discovery status record.  Instances where isValid() returns true have the following
 * properties initialized:
 *
 * sysID:           sys_id of the Discovery Status record
 * number:          number of this record (e.g., "DIS10186")
 * scheduleID:      sys_id of the associated Discovery Schedule record
 * jobID:           sys_id of the associated job (sys_trigger) record
 * discover:        what to discover: 'CIs', 'IPs', or 'Nets'
 * includeAlive:    boolean, true if include alive was checked
 * logStateChanges: boolean, true to log state changes
 * source:          How discovery is triggered 
 *
 */
var DiscoveryStatus = Class.create();

DiscoveryStatus.prototype = Object.extend(new AbstractDBObject(), {
    /*
     * Retrieves or creates the status record, using the given source, and initializes this instance with the
     * information in that record. If the qualifier is a DiscoveryJob instance, then this method either finds the
     * existing status record (for a "Discover Now") or creates a new one (for a scheduled Discovery). If the qualifier
     * is a schedule record, then a new status record is created. Otherwise the qualifier is treated as a discovery
     * status GlideRecord or string instance containing a sysID for the desired status record.
     */
    initialize: function(type, description, source) {
        this.valid = false;
        var gr = null;
        if (type instanceof DiscoveryJob)
            gr = this._findOrCreate(type, description, source);
        else if (type instanceof DiscoverySchedule) {
            this.schedule = type;
            gr = this._create(type, null, description, source);
        } else if (type instanceof GlideRecord) {
            if (type.getTableName() == 'discovery_status') {
                gr = type;
                this.valid = true;
            }
        } else {
            gr = new GlideRecord('discovery_status');
            if (gr.get('sys_id', type))
                this.valid = true;
        }

        if (!this.valid)
            return;

        // everything's cool, so save our values...
        this.sysID = gr.getValue('sys_id');
        this.number = gr.getValue('number');
        this.scheduleID = gr.getValue('dscheduler');
        this.jobID = gr.getValue('scheduler_job');
        this.discover = gr.getValue('discover');
        this.include = gr.getValue('include');
        this.description = gr.getValue('description');
        this.createdOn = gr.getValue('sys_created_on');
        this.updatedOn = gr.getValue('sys_updated_on');
        this.useSnmpVersion = gr.getValue('use_snmp_version');
        this.source = gr.getValue('source');
        this.priority = gr.getValue('priority');
        this.includeAlive = JSUtil.getBooleanValue(gr, 'include_alive');
        this.logStateChanges = JSUtil.getBooleanValue(gr, 'log_state_changes');
        this.scratchpad = gr.scratchpad;
    },

    /*
     * Returns a GlideRecord instance initialized to this status record, or null if none.
     */
    getGlideRecord: function() {
        if (!this.valid)
            return null;

        var gr = new GlideRecord('discovery_status');
        gr.get('sys_id', this.sysID);
        return gr;
    },

    /*
     * Returns the current phase for the given behavior, or null if none has been recorded.  Note that the behavior
     * phase is stored in the scratchpad as variable named "behavior:<sys_id>", where <sys_id> is the sys_id of the
     * behavior.
     *
     * behavior: the DiscoveryBehaviorRecord instance for the behavior whose phase is being queried.
     * returns:  the integer phase number for this behavior, or null if none has been recorded.
     */
    getPhase: function(behavior) {
        var phase = this.scratchpad[this.getBehaviorPhaseKey(behavior)];
        return (phase == null) ? null : (phase - 0);
    },

    /*
     * Sets the current phase for the given behavior.  Note that the behavior phase is stored in the scratchpad as
     * variable named "behavior:<sys_id>", where <sys_id> is the sys_id of the behavior.
     */
    setPhase: function(behavior, phase) {
        var gr = this.getGlideRecord();
        if (!gr)
            return;

        gr.scratchpad[this.getBehaviorPhaseKey(behavior)] = (phase - 0);
        gr.setWorkflow(false); // stomp on a totally useless recursive business rule...
        gr.update();
        this.scratchpad = gr.getValue('scratchpad');
    },

    /*
     * Returns the behavior phase key for the given behavior.
     *
     * behavior: the DiscoveryBehaviorRecord instance a key is needed for.
     */
    getBehaviorPhaseKey: function(behavior) {
        return 'behavior:' + behavior.sysID;
    },

    /*
     * Find or create this status record in the database.
     *
     * job: the DiscoveryJob instance for the job associated with this status record.
     */
    _findOrCreate: function(job, description, source) {
        if (!job.isValid())
            return null;

        // if we've got a "run once" job, then it was triggered by "Discover Now" and we may already have a status
        // record...
        var gr = new GlideRecord('discovery_status');
        if (job.isRunOnce()) {
            gr.addQuery('scheduler_job', job.sysID);
            gr.orderByDesc('sys_created_on');
            gr.query();
            if (gr.next()) {
                this.valid = true;
                return gr;
            }
        }

        // otherwise this is a scheduled job, and we need to create a new status record...
        var sched = new DiscoverySchedule(job.scheduleID);
        return this._create(sched, job.sysID, description, source);
    },

    calculateAvgProbeCount: function(schedule) {
        var rowLimit = 2;
        var numberOfRecords = 0;
        var sum = 0;
        var result = 0;
        var gr = new GlideRecord('discovery_status');
        gr.addQuery('dscheduler', schedule);
        gr.addQuery('state', 'Completed');
        gr.addQuery('estimated_probe_count', '>=', 0);
        gr.orderByDesc('sys_created_on');
        gr.setLimit(rowLimit);
        gr.query();
        while (gr.next()) {
            sum = sum + parseInt(gr.getValue('completed'));
            numberOfRecords++;
        }
        if (numberOfRecords > 0) {
            result = sum / numberOfRecords;
        }
        return result;
    },

    _create: function(schedule, jobID, description, source) {
        var gr = new GlideRecord('discovery_status');
        gr.initialize();
        gr.setValue('dscheduler', schedule ? schedule.sysID : 'NULL');
        gr.setValue('scheduler_job', jobID);
        gr.setValue('description', !!description ? description : 'Unknown');
        gr.setValue('discover', schedule ? schedule.discover : 'CIs');
        gr.setValue('log_state_changes', schedule ? schedule.logStateChanges : false);
        gr.setValue('include_alive', schedule ? schedule.includeAlive : false);
        gr.setValue('max_run', schedule ? schedule.maxRun : null);
        gr.setValue('use_snmp_version', schedule ? schedule.useSnmpVersion : 'all');
        gr.setValue('estimated_probe_count', description != 'Discover CI' ? this.calculateAvgProbeCount(schedule.sysID) : 0);
        gr.setValue('source', source);
        gr.setValue('priority', this._getPriorityFromSource(source));
        gr.insert();
        this.valid = true;
        return gr;
    },

    _getPriorityFromSource: function(source) {
        var priority = '2'; // Standard

        switch (source) {
            case 'PatternDesigner':
                priority = '0'; // Interactive
                break;
            case 'Discover_now_ci':
            case 'Quick_Discovery':
            case 'ServiceWatch':
                priority = '1'; // Expedited
                break;
        }

        return priority;
    },

    discoverCIs: function() {
        return this.discover == 'CIs';
    },

    discoverIPs: function() {
        return this.discover == 'IPs';
    },

    discoverNets: function() {
        return this.discover == 'Nets';
    },

    discoverWebService: function() {
        return this.discover == 'Web Service';
    },

    discoverService: function() {
        return this.discover == 'Service';
    },

    isFromErrorRetry: function() {
        return (JSUtil.notNil(this.description) && this.description.startsWith('Retry Discovery'));
    },

    getIPFromRetryDiscovery: function() {
        var ipAddress = null;

        // Re-discovery spawned from an active error has a status with the description 'Retry Discovery <ip_address>'
        var tokens = this.description.split(' ');

        if (tokens.length == 3)
            ipAddress = tokens[2];

        return ipAddress;
    },

    /*
     * Sets the IP Address of the CI being discovered in the scratchpad as this information may not be available in the 
     * status if discovery is triggered from the CI form and the associated IP is part of a discovery schedule that uses 
     * a multi-phase behavior.
     */
    setIPFromCI: function(ip) {
        var gr = this.getGlideRecord();
        if (!gr)
            return;

        gr.scratchpad.discoverNowIp = ip;
        gr.setWorkflow(false);
        gr.update();
    },

    /*
     * Returns IP address of the CI being discovered if it was stored in the scratchpad
     */
    getIPFromCI: function() {
        var gr = this.getGlideRecord();
        if (!gr)
            return;

        var ip = gr.scratchpad.discoverNowIp;
        if (!ip)
            return;

        return '' + ip;
    },

    getSchedule: function() {
        return this.schedule;
    },

    setSchedule: function(schedule) {
        this.schedule = schedule;
    },

    type: 'DiscoveryStatus'
});

DiscoveryStatus.getDiscoveryType = function(statusId) {
    var discoveryStatusGlideRecord = new GlideRecord('discovery_status');

    if (discoveryStatusGlideRecord.get('sys_id', statusId))
        return discoveryStatusGlideRecord.discover + '';
};

DiscoveryStatus.countInputsPerOutputReportMismatch = function(statusGlideRecord) {
    var countReport = {},
        countingSummary = DiscoveryStatus.getExpectedAndActualInputsPerOutput(statusGlideRecord);

    if (!countingSummary) {
        countReport.message = gs.getMessage('{0}: No inputs found for status', [statusGlideRecord.number]);
        return countReport;
    }

    for (var outputSysId in countingSummary.expectedInputsData) {
        var expectedInputsDataForOutput = countingSummary.expectedInputsData[outputSysId];
        var actualInputsCountForOutput = countingSummary.actualInputsCount[outputSysId];

        if (expectedInputsDataForOutput.paginationType == 'orchestrator') {
            /*
             * For each Orchestrator page, make sure we got all inputs for it
             * Orchestrator pages can be single pages or multipage
             * We do it before checking the overall number of Orchestrator pages check to avoid a query on ECC queue
             */
            for (var pageNumber in expectedInputsDataForOutput.pages) {
                if (expectedInputsDataForOutput.pages[pageNumber].totalPages != actualInputsCountForOutput[pageNumber]) {
                    var message = gs.getMessage('{0}: count mismatch for output {1} in Orchestrator page #{2}. \
						Counted {3} inputs, expected {4}',
                        [statusGlideRecord.number, outputSysId, pageNumber,
                            actualInputsCountForOutput[pageNumber] + '',
                            expectedInputsDataForOutput.pages[pageNumber].totalPages + ''
                        ]);

                    countReport.mismatch = {
                        paginationType: expectedInputsDataForOutput.pages[pageNumber].paginationType,
                        outputSysId: outputSysId,
                        orchestratorPageNumber: +pageNumber,
                        numOfExpectedInputs: expectedInputsDataForOutput.pages[pageNumber].totalPages,
                        numOfActualInputs: actualInputsCountForOutput[pageNumber]
                    };
                    countReport.message = message;
                    break;
                }
            }

            /*
             * For orchestrator, we have no idea how many pages we should get,
             * however the last page should have a probe parameter indicating
             * that it is the last page
             */
            var numOrchestatorPagesReceived = Object.keys(actualInputsCountForOutput).length;
            var lastRecievedOrchestratorPage = new GlideRecord('ecc_queue');
            lastRecievedOrchestratorPage.addQuery('sys_created_on', '>=', statusGlideRecord.sys_created_on + '');
            lastRecievedOrchestratorPage.addQuery('agent_correlator', statusGlideRecord.sys_id + '');
            lastRecievedOrchestratorPage.addQuery('response_to', outputSysId);
            lastRecievedOrchestratorPage.addQuery('name', 'CONTAINS', 'Orchestrator Page ' + numOrchestatorPagesReceived);
            lastRecievedOrchestratorPage.setNoCount();
            lastRecievedOrchestratorPage.query();

            if (!lastRecievedOrchestratorPage.next() || EccPayload(lastRecievedOrchestratorPage).getProbeParameters()[0].is_last_page == 'false') {
                var message = gs.getMessage('{0}: Missing orchestrator page for output {1}. \
				Counted {2} pages, however page #{2} doesn\'t have "is_last_page" probe parameter set to "true"', [statusGlideRecord.number, outputSysId, numOrchestatorPagesReceived + '']);

                countReport.mismatch = {
                    paginationType: expectedInputsDataForOutput.paginationType,
                    outputSysId: outputSysId,
                    numOfExpectedInputs: -1,
                    numOfActualInputs: numOrchestatorPagesReceived
                };
                countReport.message = message;
                break;
            }
        } else {
            if (actualInputsCountForOutput != expectedInputsDataForOutput.totalPages) {
                var message = gs.getMessage('{0}: count mismatch for output {1}. \
				Counted {2} inputs, expected {3}', [statusGlideRecord.number, outputSysId, actualInputsCountForOutput + '', expectedInputsDataForOutput.counting + '']);

                countReport.mismatch = {
                    paginationType: expectedInputsDataForOutput.paginationType,
                    outputSysId: outputSysId,
                    numOfExpectedInputs: expectedInputsDataForOutput.totalPages,
                    numOfActualInputs: actualInputsCountForOutput
                };
                countReport.message = message;
                break;
            }
        }
    }

    if (recievedAllExpectedInputs())
        countReport.message = gs.getMessage('{0}: All inputs accounted for', [statusGlideRecord.number]);
    return countReport;

    function recievedAllExpectedInputs() {
        return !countReport.mismatch;
    }
};

DiscoveryStatus.getExpectedAndActualInputsPerOutput = function(statusGlideRecord) {
	var responseTo, expectedInputsData = {}, actualInputsCount = {},
		orchestratorRegex = /orchestrator page (\d+)/i,
		multipageRegex = /multipage (\d+) of (\d+)$/i;

	var eccGlideRecord = new GlideRecord('ecc_queue');
	eccGlideRecord.addQuery('sys_created_on', '>=', statusGlideRecord.sys_created_on + '');
	eccGlideRecord.addQuery('agent_correlator', statusGlideRecord.sys_id + '');
	eccGlideRecord.addQuery('queue', 'input');
	eccGlideRecord.addQuery('error_string', '!=', 'Duplicate input for ecc_queue entry');
	eccGlideRecord.query();

	if (!eccGlideRecord.hasNext())
		return;

	while (eccGlideRecord.next()) {
		responseTo = eccGlideRecord.response_to + '';
		expectedInputsData[responseTo] = expectedInputsData[responseTo] || {};

		var orchestratorMatch = orchestratorRegex.exec(eccGlideRecord.name + ''),
			multipageMatch = multipageRegex.exec(eccGlideRecord.name + '');

		if (orchestratorMatch) {
			actualInputsCount[responseTo] = actualInputsCount[responseTo] || {};
			expectedInputsData[responseTo].paginationType = 'orchestrator';
			expectedInputsData[responseTo].pages = expectedInputsData[responseTo].pages || {};

			if (multipageMatch) {
				var orchestratorPage = expectedInputsData[responseTo].pages[orchestratorMatch[1]];

				if (didntHandleOutput(orchestratorPage)){
					expectedInputsData[responseTo].pages[orchestratorMatch[1]] = {
						paginationType: 'multipage',
						totalPages: +(multipageMatch[2])
					};
				}
			} else {
				expectedInputsData[responseTo].pages[orchestratorMatch[1]] = {
					paginationType: 'none',
					totalPages: 1
				};
			}

			actualInputsCount[responseTo][orchestratorMatch[1]] = (actualInputsCount[responseTo][orchestratorMatch[1]] || 0) + 1;
			// Every orchestrator page is a single pattern execution, therefore no need to run the single pattern logic below
			continue;
		}
		
		// Single pattern logic
		if (multipageMatch) {
			if (didntHandleOutput(expectedInputsData[responseTo])) {
				expectedInputsData[responseTo].paginationType = 'multipage';
				expectedInputsData[responseTo].totalPages = +(multipageMatch[2]);
			}
		} else if (gs.nil(orchestratorMatch)) {
			expectedInputsData[responseTo].paginationType = 'none';
			expectedInputsData[responseTo].totalPages = 1;
		}

		actualInputsCount[responseTo] = (actualInputsCount[responseTo] || 0) + 1;
	}

	return {
		expectedInputsData: expectedInputsData,
		actualInputsCount: actualInputsCount
	}

	function didntHandleOutput(page) {
		return !page || !page.hasOwnProperty('totalPages');
	}
};

DiscoveryStatus.allRecordsProcessed = function(statusGlideRecord) {
    var outputEccProcessing = new GlideRecord('ecc_queue');
    outputEccProcessing.addQuery('sys_created_on', '>=', statusGlideRecord.sys_created_on + '');
    outputEccProcessing.addQuery('agent_correlator', statusGlideRecord.sys_id + '');
    outputEccProcessing.addQuery('topic', '!=', 'SystemCommand');
    outputEccProcessing.addQuery('state', 'IN', ['processing', 'ready']);
    outputEccProcessing.setNoCount();
    outputEccProcessing.setLimit(1);
    outputEccProcessing.query();

    return !outputEccProcessing.hasNext();
};

DiscoveryStatus.stillProcessingEccQueues = function(statusGlideRecord) {
    var eccGlideRecord = new GlideRecord('ecc_queue');
    eccGlideRecord.addQuery('sys_created_on', '>=', statusGlideRecord.sys_created_on + '');
    eccGlideRecord.addQuery('agent_correlator', statusGlideRecord.sys_id + '');
    eccGlideRecord.addQuery('topic', '!=', 'SystemCommand');
    eccGlideRecord.addQuery('state', 'processing');
    eccGlideRecord.setNoCount();
    eccGlideRecord.setLimit(1);
    eccGlideRecord.query();

    return eccGlideRecord.hasNext();
};

DiscoveryStatus.anyEccUpdatedAtOrAfterStaleTime = function(statusGlideRecord, dateTimeConsideredStale) {
    var eccGlideRecord = new GlideRecord('ecc_queue');
    eccGlideRecord.addQuery('sys_created_on', '>=', statusGlideRecord.sys_created_on + '');
    eccGlideRecord.addQuery('agent_correlator', statusGlideRecord.sys_id + '');
    eccGlideRecord.addQuery('sys_updated_on', '>=', dateTimeConsideredStale + '');
    eccGlideRecord.addQuery('topic', '!=', 'SystemCommand');
    eccGlideRecord.setNoCount();
    eccGlideRecord.setLimit(1);
    eccGlideRecord.query();

    return eccGlideRecord.hasNext();
};

DiscoveryStatus.futureJobScheduled = function(statusGlideRecord) {
    var eccGlideRecord = new GlideRecord('ecc_queue');
    eccGlideRecord.addQuery('sys_created_on', '>=', statusGlideRecord.sys_created_on + '');
    eccGlideRecord.addQuery('agent_correlator', statusGlideRecord.sys_id + '');
    eccGlideRecord.addQuery('queue', 'input');
    eccGlideRecord.addQuery('state', 'ready');
    var qc = eccGlideRecord.addJoinQuery('sys_trigger', 'sys_id', 'document_key');
    qc.addCondition('document', 'ecc_queue');
    eccGlideRecord.setNoCount();
    eccGlideRecord.setLimit(1);
    eccGlideRecord.query();

    return eccGlideRecord.hasNext();
};

DiscoveryStatus.futureEventScheduled = function(statusGlideRecord) {
    var eccSysIds = [];
    var eccGlideRecord = new GlideRecord('ecc_queue');
    eccGlideRecord.addQuery('sys_created_on', '>=', statusGlideRecord.sys_created_on + '');
    eccGlideRecord.addQuery('agent_correlator', statusGlideRecord.sys_id + '');
    eccGlideRecord.addQuery('queue', 'input');
    eccGlideRecord.addQuery('state', 'ready');
    eccGlideRecord.query();
    while (eccGlideRecord.next())
        eccSysIds.push(eccGlideRecord.sys_id + '');

    if (eccSysIds.length > 0) {
        var syseventGlideRecord = new GlideRecord('sysevent');
        syseventGlideRecord.addQuery('queue', 'IN', ['discovery.sensor', 'discovery.cloud.sensor']);
        syseventGlideRecord.addQuery('state', 'NOT IN', ['error', 'processed']);
        syseventGlideRecord.addQuery('instance', 'IN', eccSysIds);
        syseventGlideRecord.addQuery('sys_created_on', '>=', statusGlideRecord.sys_created_on + '');
        syseventGlideRecord.addQuery('table', 'ecc_queue');
        syseventGlideRecord.setLimit(1);
        syseventGlideRecord.query();

        return syseventGlideRecord.hasNext();
    }

    return false;
};

DiscoveryStatus.shouldRunClusterManagementForDiscoveryType = function(discoveryType) {
    return DiscoveryStatus.isNotSubnetDiscovery(discoveryType) &&
        DiscoveryStatus.isNotCloudDiscovery(discoveryType);
};

DiscoveryStatus.isNotServerlessDiscovery = function(discover) {
    return (discover != 'Hostless');
};

DiscoveryStatus.isNotSubnetDiscovery = function(discover) {
    return (discover != 'Subnet');
};

DiscoveryStatus.isNotCloudDiscovery = function(discover) {
    return (discover != 'Cloud Resources');
};

DiscoveryStatus.isStatusWaitingForDependency = function(statusGlideRecord) {
    return Object.keys(DiscoveryStatusExternalDependencies).some(function(key) {
        var doesDependencyhaveJobLeftOnStatus = DiscoveryStatusExternalDependencies[key];
        return doesDependencyhaveJobLeftOnStatus(statusGlideRecord);
    });
}

DiscoveryStatus.updateStatusStartedCount = function(statusId, num) {
    this.updateStatusCount(statusId, num, 'started');
};

DiscoveryStatus.updateStatusCompletedCount = function(statusId, num) {
    this.updateStatusCount(statusId, num, 'completed');
};

DiscoveryStatus.updateStatusCount = function(statusId, num, type) {
    if (JSUtil.nil(num))
        num = 1;

    // When optimized counting is active for this status, the DiscoveryStatusCounterJob
    // is the sole authority for counter updates and completion decisions.
    // Skip direct counter increments and BR triggers to prevent race conditions
    // (e.g., duplicate IP processing inflating the completed count prematurely).
    var statusGr = new GlideRecord('discovery_status');
    if (statusGr.get('sys_id', statusId) && statusGr.scratchpad && statusGr.scratchpad.isOptimizedCounting)
        return;

    // increment started & completed counts
    var mu = GlideMultipleUpdate('discovery_status');
    mu.setIncrement(type, num);
    mu.addQuery('sys_id', statusId);
    mu.addQuery('state', '!=', 'Canceled');
    mu.execute();

    if (gs.getProperty('glide.discovery.count.use_optimized_counter', 'true') == 'true') {
        // Trigger the BR 'Discovery - Set Status' to set state='Active'
        if (type == 'started') {
            var gr = new GlideRecord('discovery_status');
            gr.addQuery('sys_id', statusId);
            gr.addQuery('state', 'Starting');
            gr.query();
            if (gr.next()) {
                gr.scratchpad.unique = gs.generateGUID();
                gr.update();
            }
        }

        // Trigger the BRs 'Discovery - Complete' & 'Discovery - Change Phase' 
        if (type == 'completed') {
            gr = new GlideRecord('discovery_status');
            gr.addQuery('sys_id', statusId);
            gr.addQuery('completed', 'SAMEAS', 'started');
            gr.addQuery('state', 'Active');
            gr.query();
            if (gr.next()) {
                gr.scratchpad.unique = gs.generateGUID();
                gr.update();
            }
        }
    } else {
        // Retaining old behavior as a failsafe in case of unexpected problems due to the new code on a customer instance

        // workaround to force trigger of business rules until we have a real fix.
        var gr = new GlideRecord('discovery_status');
        if (!gr.get('sys_id', statusId))
            return;

        if (gr.state == 'Canceled' || gr.scratchpad.cancel)
            return;

        // Generate a guid to ensure there will be an update. Previously used the gs.now(), but there could be collision of the same value with multiple threads
        gr.scratchpad.unique = gs.generateGUID();
        gr.update();
    }
};

DiscoveryStatus.getActiveOnDemandStatuses = function() {
    var gr = new GlideRecord('discovery_status');
    gr.addQuery('state', 'IN', ['Starting', 'Active']);
    gr.setNoCount();

    var orCondition = gr.addNullQuery('dscheduler');
    orCondition.addOrCondition('source', '!=', 'Schedule_Discovery');
    gr.query();

    return gr;
};

DiscoveryStatus.getActiveScheduledStatuses = function() {
    var gr = new GlideRecord('discovery_status');
    gr.addNotNullQuery('dscheduler');
    gr.addQuery('state', 'IN', ['Starting', 'Active']);
    gr.addQuery('source', 'Schedule_Discovery');
    gr.setNoCount();
    gr.query();

    return gr;
};

DiscoveryStatus.setCountersForStatus = function(started, completed, discoveryStatus) {
    var gr = discoveryStatus;

    if (typeof discoveryStatus == 'string') {
        gr = new GlideRecord('discovery_status');

        if (!gr.get('sys_id', discoveryStatus))
            throw new Error(sn_i18n.Message.getMessage('global-discovery', 'value_invalid_sysid_of_table', {
                value: discoveryStatus,
                tableName: 'discovery_status'
            }));
    }

    if (!(gr instanceof GlideRecord))
        throw new Error(sn_i18n.Message.getMessage('global-discovery', 'value_to_be_sysid_gliderecord', {
            value: discoveryStatus,
            tableName: 'discovery_status'
        }));

    discoveryStatus.started = started;
    discoveryStatus.completed = completed;

	return !!discoveryStatus.update();
};

DiscoveryStatus.calculateCountersForStatus = function(statusGlideRecord) {
	if (!statusGlideRecord)
		return;

	var countingSummary = DiscoveryStatus.getExpectedAndActualInputsPerOutput(statusGlideRecord);
	
	if (!countingSummary) { return { started: 0, completed: 0 }; }

	/*
	 * The reason for the following query is that the above function
	 * works on the input ECC queues and builds the output list based on "response_to",
	 * which will miss outputs that didn't have any inputs.
	 * 
	 * This is to avoid querying all inputs for each output
	 */
	var eccGlideRecord = new GlideAggregate('ecc_queue');
	eccGlideRecord.addQuery('sys_created_on', '>=', statusGlideRecord.sys_created_on + '');
	eccGlideRecord.addQuery('agent_correlator', statusGlideRecord.sys_id + '');
	eccGlideRecord.addQuery('queue', 'output');
	eccGlideRecord.addAggregate('COUNT');
	eccGlideRecord.query();
	var totalOutputs = eccGlideRecord.next() ? eccGlideRecord.getAggregate('COUNT') : 0;

	return { 
		started: totalOutputs,
		completed: countCompletedOutputs(countingSummary)
	};

	function countCompletedOutputs(countingSummary) {
		// See DiscoveryStatus.getExpectedAndActualInputsPerOutput for the structure of countingSummary
		var completedOutputs = 0;
	
		Object.keys(countingSummary.expectedInputsData).forEach(function(output) {
			var expectedInputs = countingSummary.expectedInputsData[output];
			var actualInputs = countingSummary.actualInputsCount[output];
	
			if (!expectedInputs || !actualInputs)
				return; // This skips to the next iteration of the loop
	
			if (expectedInputs.paginationType == 'orchestrator') {
				var allPagesReceived = true;
	
				Object.keys(expectedInputs.pages).forEach(function(pageNumber) {
					var expectedPageCount = expectedInputs.pages[pageNumber].totalPages;
					var actualPageCount = actualInputs[pageNumber];
	
					if (expectedPageCount != actualPageCount)
						allPagesReceived = false;
				});
	
				/*
				 * For orchestrator, we have no idea how many pages we should get,
				 * however the last page should have a probe parameter indicating
				 * that it is the last page
				 */
				if (allPagesReceived) {
					var lastPage = Object.keys(actualInputs).length;
					var lastPageRecord = new GlideRecord('ecc_queue');
					lastPageRecord.addQuery('sys_created_on', '>=', statusGlideRecord.sys_created_on + '');
					lastPageRecord.addQuery('agent_correlator', statusGlideRecord.sys_id + '');
					lastPageRecord.addQuery('response_to', output);
					lastPageRecord.addQuery('name', 'CONTAINS', 'Orchestrator Page ' + lastPage);
					lastPageRecord.setNoCount();
					lastPageRecord.query();
	
					if (!lastPageRecord.next() || EccPayload(lastPageRecord).getProbeParameters()[0].is_last_page == 'false')
						allPagesReceived = false;
				}
	
				if (allPagesReceived)
					completedOutputs++;
			} else {
				if (expectedInputs.totalPages == actualInputs)
					completedOutputs++;
			}
		});
	
		return completedOutputs;
	}
};
