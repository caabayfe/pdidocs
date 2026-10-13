var DiscoveryLaunch = Class.create();
DiscoveryLaunch.prototype = {
    /*
     * Initializes this instance.
     *
     * status:   the DiscoveryStatus instance for this discovery.
     * schedule: the DiscoverySchedule instance for this discovery.
     */
    initialize: function(status, schedule) {
        this.status = status;
        this.schedule = schedule;
        this.behaviorPhase = {}; // hashmap of behavior ID to current phase...
        this.probesLaunched = false;
        this.dLogger = new DiscoveryLogger(this.status);
        this.errorManager = new SNC.DiscoveryErrorManager();
    },

    launch: function() {}, // subclasses must implement

    /**
     * Create a trigger for LDC discovery in batches for cloud resource discovery
     *
     * @param {String} discoveryScheduleId - The sys_id of the discovery schedule
     * @param {Number} startOffset - The starting offset for service accounts in this batch
     * @param {Number} endOffset - The ending offset for service accounts in this batch
     * @param {Array} resTypes - Array of resource types to discover
     * @param {GlideRecord} status - The discovery status record
     * @returns {Boolean} True if the trigger was created successfully, false otherwise
     */
    asyncLaunchLdcDiscovery: function(discoveryScheduleId, startOffset, endOffset, resTypes, status) {
        try {
            if (!discoveryScheduleId || !status) {
                gs.error('DiscoveryLaunch: Missing required parameters for createBatchTrigger');
                return false;
            }

            // Generate the batch script - using updated signature without serviceAccountIds
            var batchScript = this.generateBatchScript(discoveryScheduleId, startOffset, endOffset, resTypes, status.sys_id || status);
            if (!batchScript) {
                gs.error('DiscoveryLaunch: Failed to generate batch script');
                return false;
            }

            // Create the trigger
            var jobNamePrefix = 'Cloud Appln Pattern Launcher:' + status;
            var jobName = jobNamePrefix + '[' + startOffset + '-' + endOffset + ']';

            var sysTrigGr = new GlideRecord('sys_trigger');
            sysTrigGr.initialize();
            sysTrigGr.setValue('name', jobName);
            sysTrigGr.setValue('next_action', new GlideDateTime()); // DEF0814470
            sysTrigGr.setValue('system_id', '');
            sysTrigGr.setValue('script', batchScript); // max_length = 8000
            sysTrigGr.setValue('trigger_type', 0);
            sysTrigGr.setValue('document_key', status.sys_id || status);
            sysTrigGr.setValue('document', jobNamePrefix);
            sysTrigGr.setValue('priority', 105); // Expedited priority
            var sysTriggerId = sysTrigGr.insert();

            if (!sysTriggerId) {
                gs.error('DiscoveryLaunch: Failed to create a trigger for ' + jobName + ' for status = ' + status);
                return false;
            }

            new SncTriggerSynchronizer().synchronize(sysTrigGr);

            return true;
        } catch (e) {
            gs.error('DiscoveryLaunch: Exception occurred in asyncLaunchLdcDiscovery: ' + e);
            return false;
        }
    },

    /**
     * Generates a script for a batch trigger that processes a batch of service accounts
     *
     * @param {String} discoveryScheduleId - The sys_id of the discovery schedule
     * @param {Number} startOffset - The starting offset for service accounts in this batch
     * @param {Number} endOffset - The ending offset for service accounts in this batch
     * @param {Array} resTypes - Array of resource types to discover
     * @param {String} statusId - The sys_id of the discovery status record
     * @returns {String} The generated script
     */
    generateBatchScript: function(discoveryScheduleId, startOffset, endOffset, resTypes, statusId) {
        /* istanbul ignore next */
        /* The above comment is added to avoid errors in code coverage reporting due to instrumentation references on .toString() */
        function batchFunction(scheduleId, start, end, resourceTypes, status) {
            var serviceAccountIds = [];
            var ds = new sn_cmp_api.DiscoveryServiceScript();
            var currentOffset = 0;
            var lastServiceAccountId = null;

            var ldcConfigSaGr = new GlideRecord('cmp_discovery_ldc_config');
            ldcConfigSaGr.setNoCount();
            ldcConfigSaGr.orderBy('service_account');
            ldcConfigSaGr.addActiveQuery();
            ldcConfigSaGr.addQuery('discovery_schedule', scheduleId);
            ldcConfigSaGr.addQuery('service_account.exclude_from_discovery', false);
            ldcConfigSaGr.query();

            while (ldcConfigSaGr.next()) {
                var serviceAccountId = ldcConfigSaGr.getValue('service_account');
                if (!serviceAccountId) continue;

                if (serviceAccountId !== lastServiceAccountId) {
                    lastServiceAccountId = serviceAccountId;
                    if (currentOffset >= start && currentOffset < end) {
                        serviceAccountIds.push(serviceAccountId);
                    } else if (currentOffset >= end) {
                        break;
                    }
                    currentOffset++;
                }
            }

            if (serviceAccountIds.length > 0) {
                var ldcConfigGr = new GlideRecord('cmp_discovery_ldc_config');
                ldcConfigGr.addActiveQuery();
                ldcConfigGr.addQuery('discovery_schedule', scheduleId);
                ldcConfigGr.addQuery('service_account', 'IN', serviceAccountIds.join(','));
                ldcConfigGr.query();

                /* The 'cmp_discovery_ldc_config' table has a record per [schedule,account,ldc] if customer is choosing
                 * LDCs to run on, vs only 1 record per [schedule,account] if they keep it empty, which implies all LDCs.
                 * That is the reason we create a map with specific LDCs, and if the accounts have empty array in the map
                 * it means pass all LDCs */
                var serviceAccountLdcMap = {};
                while (ldcConfigGr.next()) {
                    var serviceAccountId = ldcConfigGr.getValue('service_account');
                    if (!serviceAccountId) continue;

                    serviceAccountLdcMap[serviceAccountId] = serviceAccountLdcMap[serviceAccountId] || {};

                    if (!ldcConfigGr.ldc.nil()) {
                        serviceAccountLdcMap[serviceAccountId][ldcConfigGr.ldc + ''] = 1;
                    }
                }

                for (var serviceAccountId in serviceAccountLdcMap) {
                    var ldcList = Object.keys(serviceAccountLdcMap[serviceAccountId]);
                    if (ldcList.length === 0) {
                        ldcList = ds.getLdcs(serviceAccountId);
                    }

                    if (ldcList.length > 0) {
                        var dcGr = new GlideRecord('cmdb_ci_logical_datacenter');
                        dcGr.addQuery('sys_id', 'IN', ldcList.join(','));
                        dcGr.setValue('discovery_status', status);
                        dcGr.updateMultiple();

                        ds.discover(ldcList, resourceTypes, status);
                    }
                }
            }
        }

        try {
            var script = '(' + batchFunction.toString() + ')(' +
                JSON.stringify(discoveryScheduleId) + ',' +
                startOffset + ',' +
                endOffset + ',' +
                JSON.stringify(resTypes) + ',' +
                JSON.stringify(statusId) + ');';

            return script;
        } catch (e) {
            gs.error('DiscoveryLaunch: Exception occurred in generateBatchScript: ' + e);
            return null;
        }
    },

    type: 'DiscoveryLaunch'
};
