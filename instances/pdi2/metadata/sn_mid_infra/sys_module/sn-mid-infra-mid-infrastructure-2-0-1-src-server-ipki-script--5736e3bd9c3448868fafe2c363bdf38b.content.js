var IpkiMigrationManager = Class.create();
IpkiMigrationManager.prototype = {

    MIGRATION_TABLE: 'sn_mid_infra_ipki_migration',
    ECC_AGENT_TABLE: 'ecc_agent',
    EVENT_SIGN_CSR:               'sn_mid_infra.sign_csr',
    EVENT_CERTIFICATE_ACTIVATION: 'sn_mid_infra.ipki_certificate_activation',
    DETAILS_MAX_LENGTH: 255,

    ALLOWED_TRANSITIONS: {
        pre_flight:   ['registration', 'cert_issued', 'failed'],
        registration: ['cert_issued', 'failed'],
        cert_issued:  ['succeeded', 'failed'],
        succeeded:    [],
        failed:       []
    },

    initialize: function() {},

    // STRY63696252: entry point for sn_mid_infra.sign_csr event listener
    handleSignCsr: function(midName, parm2) {
        var payload, agentGr, agentSysId;

        gs.info('IpkiMigrationManager.handleSignCsr: invoked. mid_name=' + midName);
        payload = this._parsePayload(parm2, this.EVENT_SIGN_CSR);
        if (!payload) return;

        agentGr = new GlideRecord(this.ECC_AGENT_TABLE);
        agentGr.addQuery('name', midName);
        agentGr.setLimit(1);
        agentGr.query();
        if (!agentGr.next()) {
            gs.error('IpkiMigrationManager.handleSignCsr: no ecc_agent found for mid_name=' + midName);
            return;
        }
        agentSysId = agentGr.getUniqueValue();

        if (payload.result !== 'success') {
            this.applyTransition(agentSysId, 'failed', payload.detailed_message);
            return;
        }

        this.applyTransition(agentSysId, 'cert_issued', payload.detailed_message);
    },

    // STRY63696252: entry point for sn_mid_infra.ipki_certificate_activation event listener
    handleActivation: function(agentSysId, parm2) {
        var payload;

        gs.info('IpkiMigrationManager.handleActivation: invoked. agent=' + agentSysId);
        payload = this._parsePayload(parm2, this.EVENT_CERTIFICATE_ACTIVATION);
        if (!payload) return;

        if (payload.result !== 'success') {
            this.applyTransition(agentSysId, 'failed', payload.detail);
            return;
        }

        this.applyTransition(agentSysId, 'succeeded', payload.detail);
    },

    // Public transition entry point — called by event listeners and BRs
    applyTransition: function(midSysId, targetStatus, details) {
        var migrationGr = this._getLatestRecord(midSysId);
        if (!migrationGr) {
            gs.debug('IpkiMigrationManager.applyTransition: no migration record found for mid=' + midSysId);
            return false;
        }
        var migSysId = migrationGr.getUniqueValue();
        var currentStatus = migrationGr.getValue('status');

        if (this._isTerminal(currentStatus)) {
            gs.info('IpkiMigrationManager.applyTransition: migration=' + migSysId +
                    ' already in terminal state=' + currentStatus + '; no-op.');
            return false;
        }

        if (currentStatus === targetStatus) {
            gs.info('IpkiMigrationManager.applyTransition: migration=' + migSysId +
                    ' already in target state=' + targetStatus + '; no-op.');
            return false;
        }

        if (!this._isValidTransition(currentStatus, targetStatus)) {
            gs.warn('IpkiMigrationManager.applyTransition: invalid transition rejected.' +
                    ' migration=' + migSysId + ' from=' + currentStatus + ' to=' + targetStatus);
            return false;
        }

        migrationGr.setValue('status', targetStatus);
        if (details) {
            migrationGr.setValue('details', ('' + details).substring(0, this.DETAILS_MAX_LENGTH));
        }
        // System automation path: invoked only from event listeners, not user-facing code.
        // setWorkflow(false) suppresses downstream BRs to prevent re-entrant event firing — STRY63696252.
        migrationGr.setWorkflow(false);
        migrationGr.update();

        gs.info('IpkiMigrationManager.applyTransition: migration=' + migSysId +
                ' advanced from=' + currentStatus + ' to=' + targetStatus);
        return true;
    },

    // STRY63696053: entry point for ecc_queue MigrateToIPKI response BR
    handleMigrateProbeResponse: function(eccQueueGr) {
        var eccSysId = eccQueueGr.getUniqueValue();
        var midName  = eccQueueGr.getValue('agent');

        gs.info('IpkiMigrationManager.handleMigrateProbeResponse: invoked. ecc_queue=' + eccSysId + ' agent=' + midName);

        if (!midName) {
            gs.warn('IpkiMigrationManager.handleMigrateProbeResponse: agent field empty. ecc_queue=' + eccSysId);
            return;
        }

        var agentGr = new AgentUtility().getAgentRecordByName(midName);
        if (!agentGr) {
            gs.warn('IpkiMigrationManager.handleMigrateProbeResponse: no ecc_agent for agent=' + midName);
            return;
        }
        var agentSysId = agentGr.getUniqueValue();

        var migrationGr = this._getLatestRecord(agentSysId);
        if (!migrationGr) {
            gs.debug('IpkiMigrationManager.handleMigrateProbeResponse: no migration record for mid=' + agentSysId);
            return;
        }

        var errorString = eccQueueGr.getValue('error_string');
        if (errorString) {
            var detail = ('MigrateToIPKI response error: ' + errorString).substring(0, this.DETAILS_MAX_LENGTH);
            this.applyTransition(agentSysId, 'failed', detail);
            return;
        }

        // Success: state advancement is owned by event listeners (STRY63696252).
        gs.info('IpkiMigrationManager.handleMigrateProbeResponse: success response, no state change. mid=' + agentSysId);
    },

    // STRY63695852: entry point for periodic reconciliation job
    failStuckRecords: function() {
        gs.info('IpkiMigrationManager.failStuckRecords: invoked.');

        var PRE_FLIGHT_TIMEOUT_MINUTES = 60;
        var processedMids = {};
        var failedCount = 0;

        var gr = new GlideRecord(this.MIGRATION_TABLE);
        gr.addQuery('status', 'NOT IN', 'succeeded,failed');
        gr.orderByDesc('sys_created_on');
        gr.orderByDesc('sys_id');
        gr.query();

        while (gr.next()) {
            var midSysId = gr.getValue('mid_server');
            if (processedMids[midSysId]) continue;
            processedMids[midSysId] = true;

            var recSysId = gr.getUniqueValue();
            var status = gr.getValue('status');
            var eccQueueSysId = gr.getValue('ecc_queue_outbound_record');

            if (eccQueueSysId && (status === 'pre_flight' || status === 'registration')) {
                var eccGr = new GlideRecord('ecc_queue');
                if (!eccGr.get(eccQueueSysId)) {
                    gs.info('IpkiMigrationManager.failStuckRecords: ECC queue record deleted. migration=' + recSysId);
                    if (this.applyTransition(midSysId, 'failed', 'ECC queue record no longer exists')) {
                        failedCount++;
                    }
                    continue;
                }
            }

            if (status === 'pre_flight') {
                var createdGdt = new GlideDateTime(gr.getValue('sys_created_on'));
                var cutoffGdt = new GlideDateTime(gs.minutesAgo(PRE_FLIGHT_TIMEOUT_MINUTES));
                if (createdGdt.before(cutoffGdt)) {
                    gs.info('IpkiMigrationManager.failStuckRecords: pre_flight timed out. migration=' + recSysId);
                    if (this.applyTransition(midSysId, 'failed', 'Pre-flight timed out after ' + PRE_FLIGHT_TIMEOUT_MINUTES + ' minutes')) {
                        failedCount++;
                    }
                }
            }
        }

        gs.info('IpkiMigrationManager.failStuckRecords: complete. failed=' + failedCount);
    },

    _getLatestRecord: function(agentSysId) {
        var gr = new GlideRecord(this.MIGRATION_TABLE);
        gr.addQuery('mid_server', agentSysId);
        gr.orderByDesc('sys_created_on');
        gr.orderByDesc('sys_id');
        gr.setLimit(1);
        gr.query();
        return gr.next() ? gr : null;
    },

    _isTerminal: function(status) {
        var allowed = this.ALLOWED_TRANSITIONS[status];
        return allowed !== undefined && allowed.length === 0;
    },

    _isValidTransition: function(from, to) {
        var allowed = this.ALLOWED_TRANSITIONS[from];
        if (!allowed) return false;
        for (var i = 0; i < allowed.length; i++) {
            if (allowed[i] === to) return true;
        }
        return false;
    },

    _parsePayload: function(parm2, eventName) {
        var parsed;
        if (!parm2) {
            gs.error('IpkiMigrationManager._parsePayload: missing parm2. event=' + eventName);
            return null;
        }
        try {
            parsed = JSON.parse(parm2);
        } catch (e) {
            gs.error('IpkiMigrationManager._parsePayload: malformed JSON. event=' + eventName);
            return null;
        }
        if (!parsed.result) {
            gs.error('IpkiMigrationManager._parsePayload: missing result field. event=' + eventName);
            return null;
        }
        return parsed;
    },

    type: 'IpkiMigrationManager'
};
