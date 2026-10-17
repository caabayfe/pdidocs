var SNManagedAppsAutoUpgradeRunner = Class.create();

SNManagedAppsAutoUpgradeRunner.DEFAULT_FREQUENCY_HOURS = 2;

// Treat a platform upgrade scheduled within this many hours of now as pending.
SNManagedAppsAutoUpgradeRunner.DEFAULT_LOOKAHEAD_HOURS = 24;

// sys_id of the "SN Managed Apps Auto Upgrade" sysauto_script this driver reschedules.
SNManagedAppsAutoUpgradeRunner.JOB_SYS_ID = '5bf483dcb9144514939689246d5f755a';

SNManagedAppsAutoUpgradeRunner.MASTER_PROPERTY = 'sn_app_auto_upgr.enabled';
SNManagedAppsAutoUpgradeRunner.CONFIG_PROPERTY = 'sn_appclient.scheduled_jobs_config';
SNManagedAppsAutoUpgradeRunner.LOOKAHEAD_PROPERTY = 'sn_app_auto_upgr.platform_upgrade_lookahead_hours';

SNManagedAppsAutoUpgradeRunner.prototype = {
    initialize: function() {
    },

    run: function() {
        this._calibrateTasks();

        if (gs.getProperty(SNManagedAppsAutoUpgradeRunner.MASTER_PROPERTY, 'true') !== 'true') {
            gs.info('[SN Managed Apps Auto Upgrade] Master switch is off; skipping run.');
            return;
        }

        var prefs = this._getAutoUpgradeConfig();
        this._rescheduleSelf(prefs.pollingFrequencyHours);

        if (!prefs.isEnabled) {
            gs.info('[SN Managed Apps Auto Upgrade] Not enabled; rescheduled, no work.');
            return;
        }
        if (this._platformUpgradePending()) {
            gs.info('[SN Managed Apps Auto Upgrade] Platform upgrade pending or imminent; rescheduled, no work.');
            return;
        }
        if (!sn_app_api.AppStoreAPI.isUpdateMutexAvailable()) {
            gs.info('[SN Managed Apps Auto Upgrade] Update mutex held; rescheduled, no work.');
            return;
        }

        this._performUpdate();
    },

    /**
     * Read the autoUpgrade preferences directly from the sn_appclient.scheduled_jobs_config
     * property. Returns a fully-populated config so callers never see missing fields;
     * any value absent from the property falls back to the default below. Malformed JSON
     * is tolerated (logged) and yields defaults rather than throwing.
     */
    _getAutoUpgradeConfig: function() {
        var config = {
            isEnabled: false,
            pollingFrequencyHours: SNManagedAppsAutoUpgradeRunner.DEFAULT_FREQUENCY_HOURS
        };

        var raw = gs.getProperty(SNManagedAppsAutoUpgradeRunner.CONFIG_PROPERTY, '{}');
        var parsed;
        try {
            parsed = JSON.parse(raw);
        } catch (e) {
            gs.warn('[SN Managed Apps Auto Upgrade] Invalid JSON in ' + SNManagedAppsAutoUpgradeRunner.CONFIG_PROPERTY + '; using defaults. ' + e.message);
            return config;
        }

        var autoUpgrade = parsed && parsed.autoUpgrade;
        if (!autoUpgrade) {
            return config;
        }
        if (autoUpgrade.hasOwnProperty('isEnabled')) {
            config.isEnabled = autoUpgrade.isEnabled;
        }
        if (autoUpgrade.hasOwnProperty('pollingFrequencyHours')) {
            config.pollingFrequencyHours = autoUpgrade.pollingFrequencyHours;
        }
        return config;
    },

    /**
     * True when a platform upgrade should keep auto-upgrade from polling: either the
     * instance is paused (an upgrade is in progress) or a platform upgrade is scheduled
     * between now and now + the configured lookahead. A scheduled time in the past does
     * not block. The lookahead is read from the platform_upgrade_lookahead_hours property
     * and normalized (default 24).
     */
    _platformUpgradePending: function() {
        if (gs.isPaused()) {
            return true;
        }
        var meta = new GlideRecord('upgrade_center_metadata');
        meta.addNotNullQuery('upgrade_scheduled_on');
        meta.setLimit(1);
        meta.query();
        if (!meta.next()) {
            return false;
        }
        var scheduledMs = new GlideDateTime(meta.getValue('upgrade_scheduled_on')).getNumericValue();
        if (!isFinite(scheduledMs)) {
            return false;
        }
        var raw = gs.getProperty(SNManagedAppsAutoUpgradeRunner.LOOKAHEAD_PROPERTY, '' + SNManagedAppsAutoUpgradeRunner.DEFAULT_LOOKAHEAD_HOURS);
        var lookaheadHours = this._normalizeNumber(raw, SNManagedAppsAutoUpgradeRunner.DEFAULT_LOOKAHEAD_HOURS, true);
        var nowMs = new GlideDateTime().getNumericValue();
        var lookaheadMs = lookaheadHours * 3600 * 1000;
        return scheduledMs >= nowMs && scheduledMs <= nowMs + lookaheadMs;
    },

    /**
     * Clamp the configured polling frequency to a usable positive number of hours.
     * Missing / zero / negative / non-numeric values fall back to the default.
     */
    _normalizeFrequency: function(hours) {
        // Frequency must be strictly positive, so zero falls back to the default.
        return this._normalizeNumber(hours, SNManagedAppsAutoUpgradeRunner.DEFAULT_FREQUENCY_HOURS, false);
    },

    /**
     * Shared numeric normalizer for property / config values (gs.getProperty returns
     * strings). Empty, missing, non-numeric, non-finite, or negative values fall back to
     * dft. When allowZero is false, zero also falls back (for values that must be strictly
     * positive, such as the polling frequency).
     */
    _normalizeNumber: function(value, dft, allowZero) {
        if (value === '' || value === null || value === undefined) {
            return dft;
        }
        var n = Number(value);
        if (!isFinite(n) || n < 0 || (!allowZero && n === 0)) {
            return dft;
        }
        return n;
    },

    /**
     * The platform recomputes the trigger's next_action when
     * run_period changes, so a frequency change takes effect on the next run.
     */
    _rescheduleSelf: function(hours) {
        var normalizedHours = this._normalizeFrequency(hours);
        var job = new GlideRecord('sysauto_script');
        if (!job.get(SNManagedAppsAutoUpgradeRunner.JOB_SYS_ID)) {
            gs.warn('[SN Managed Apps Auto Upgrade] Job record not found for reschedule: ' + SNManagedAppsAutoUpgradeRunner.JOB_SYS_ID);
            return;
        }
        var newPeriodMs = Math.round(normalizedHours * 3600) * 1000;
        var currentPeriodMs = new GlideDateTime(job.getValue('run_period')).getNumericValue();
        if (currentPeriodMs !== newPeriodMs) {
            gs.info('[SN Managed Apps Auto Upgrade] Rescheduling job ' + SNManagedAppsAutoUpgradeRunner.JOB_SYS_ID + ' to run every ' + normalizedHours + ' hours');
            job.setValue('run_period', new GlideDuration(newPeriodMs).getDurationValue());
            job.update();
        }
    },

    /**
     * Replay SnAutoUpgradeBatchCompletionHandler for every distinct batch still tied to
     * an assigned or in_progress task. Some batches finish without firing
     * batch.operation.update -- for example, an item rejected with state=invalid before
     * the installer runs -- which leaves the task stuck. Calibrating here lets a stuck
     * row reach its terminal state (with error_message synced from sys_batch_install_item)
     * so the next poll can retry.
     */
    _calibrateTasks: function() {
        try {
            var seen = {};
            var task = new GlideRecord('sn_app_auto_upgr_task');
            task.addQuery('status', 'IN', 'assigned,in_progress');
            task.addNotNullQuery('batch_install_plan');
            task.query();
            var handler = new SnAutoUpgradeBatchCompletionHandler();
            while (task.next()) {
                var planId = task.getValue('batch_install_plan');
                if (seen[planId]) continue;
                seen[planId] = true;
                try {
                    handler.handleBatchCompletion(planId);
                } catch (e) {
                    gs.error('[SN Managed Apps Auto Upgrade] Calibration failed for batch ' + planId + ': ' + e.message);
                }
            }
        } catch (e) {
            gs.error('[SN Managed Apps Auto Upgrade] Calibration step failed: ' + e.message);
        }
    },

    /**
     * Perform the SN Managed Apps Auto Upgrade poll/install
     */
    _performUpdate: function() {
        gs.info('[SN Managed Apps Auto Upgrade] calling orchestrator');
        new SnManagedAppAutoUpgradeOrchestrator().run();
    },

    type: 'SNManagedAppsAutoUpgradeRunner'
};
