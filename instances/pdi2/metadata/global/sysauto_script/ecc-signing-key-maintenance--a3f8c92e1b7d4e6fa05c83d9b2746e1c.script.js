(function executeSigningKeyMaintenance() {
    var maintenanceEnabled = '' + gs.getProperty('mid.signing_key.maintenance_enabled', 'true');
    if (maintenanceEnabled !== 'true') {
        return;
    }

    var TABLE = 'ecc_agent_signing_key';
    var LOG_SRC = '[ECC Signing Key Maintenance]';

    function deactivateExpiredKeys() {
        var nowGr = new GlideDateTime();
        var agg = new GlideAggregate(TABLE);
        agg.addNotNullQuery('expires_on');
        agg.addQuery('expires_on', '<', nowGr);
        agg.addQuery('state', 'NOT IN', 'compromised,deactivated');
        agg.addAggregate('COUNT');
        agg.query();
        if (!agg.next()) {
            return;
        }
        var count = parseInt(agg.getAggregate('COUNT'), 10);
        if (isNaN(count) || count === 0) {
            return;
        }

        gs.info(LOG_SRC + ' found ' + count + ' keys due for expiry, deactivating as many as possible');

        var gr = new GlideRecord(TABLE);
        gr.addNotNullQuery('expires_on');
        gr.addQuery('expires_on', '<', nowGr);
        gr.addQuery('state', 'NOT IN', 'compromised,deactivated');
        gr.setValue('state', 'deactivated');
        gr.setValue('state_changed_at', nowGr);
        gr.updateMultiple();
    }

    function deactivateSuspendedKeys() {
        var holdSeconds = parseInt(gs.getProperty('mid.signing_key.suspended_hold_seconds', 300), 10);
        if (isNaN(holdSeconds) || holdSeconds < 0) {
            holdSeconds = 300;
        }

        var holdCutoff = new GlideDateTime();
        holdCutoff.addSeconds(-holdSeconds);

        var agg = new GlideAggregate(TABLE);
        agg.addQuery('state', 'suspended');
        agg.addQuery('state_changed_at', '<', holdCutoff);
        agg.addAggregate('COUNT');
        agg.query();
        if (!agg.next()) {
            return;
        }
        var count = parseInt(agg.getAggregate('COUNT'), 10);
        if (isNaN(count) || count === 0) {
            return;
        }

        gs.info(LOG_SRC + ' found ' + count + ' keys due to suspended hold expiry (hold=' + holdSeconds + 's), deactivating as many as possible');

        var gr = new GlideRecord(TABLE);
        gr.addQuery('state', 'suspended');
        gr.addQuery('state_changed_at', '<', holdCutoff);
        gr.setValue('state', 'deactivated');
        gr.setValue('state_changed_at', new GlideDateTime());
        gr.updateMultiple();
    }

    function pruneDeactivatedKeys() {
        var retentionDays = parseInt(gs.getProperty('mid.signing_key.deactivated_retention_days', 90), 10);
        if (isNaN(retentionDays) || retentionDays <= 0) {
            retentionDays = 90;
        }

        var retentionCutoff = new GlideDateTime();
        retentionCutoff.addDaysUTC(-retentionDays);

        var agg = new GlideAggregate(TABLE);
        agg.addQuery('state', 'deactivated');
        agg.addQuery('state_changed_at', '<', retentionCutoff);
        agg.addAggregate('COUNT');
        agg.query();
        if (!agg.next()) {
            return;
        }
        var count = parseInt(agg.getAggregate('COUNT'), 10);
        if (isNaN(count) || count === 0) {
            return;
        }

        gs.info(LOG_SRC + ' found ' + count + ' deactivated keys to prune (retention=' + retentionDays + 'd), pruning as many as possible');

        var gr = new GlideRecord(TABLE);
        gr.addQuery('state', 'deactivated');
        gr.addQuery('state_changed_at', '<', retentionCutoff);
        gr.deleteMultiple();
        

    }

    try {
        deactivateExpiredKeys();
    } catch (e) {
        gs.error(LOG_SRC + ' could not deactivate expired signing keys', e);
    }

    try {
        deactivateSuspendedKeys();
    } catch (e) {
        gs.error(LOG_SRC + ' could not deactivate suspended signing keys', e);
    }

    try {
        pruneDeactivatedKeys();
    } catch (e) {
        gs.error(LOG_SRC + ' could not prune deactivated signing keys', e);
    }
})();
