var SnManagedAppAutoUpgradeOrchestrator = Class.create();
SnManagedAppAutoUpgradeOrchestrator.prototype = {

	// -----------------------------------------------------------------------
	// Public entry point
	// -----------------------------------------------------------------------

	/**
	 * Orchestrate the full auto-upgrade cycle. The scheduled job calls run() with no
	 * arguments.
	 *
	 * The Store's polling API returns the FULL set of SN managed apps assigned to this
	 * instance along with their target versions; the orchestrator is responsible for
	 * filtering down to those that are installed and need an upgrade. The Store no
	 * longer pushes campaign/task identifiers and there is no status-callback API,
	 * so task rows are keyed locally on scope.
	 *
	 * @returns {object} result with fields: parsedApps, persistedTaskIds, installResults
	 */
	run : function () {
		var result = {
			parsedApps       : [],
			persistedTaskIds : [],
			installResults   : []
		};

		var pollResp = new SnAutoUpgradeStoreClient().poll(this._getInstalledSnManagedApps());
		if (!pollResp.ok) {
			gs.error('[AutoUpgrade] Store poll failed (HTTP ' + pollResp.code + '); aborting.');
			return result;
		}
		result.parsedApps = this._normalizeApps((pollResp.body && pollResp.body.apps) || []);
		gs.info('[AutoUpgrade] Poll returned ' + result.parsedApps.length + ' assigned app(s).');

		if (result.parsedApps.length === 0) {
			return result;
		}

		// Step 1b – Drop apps that are not installed, already at/above the target version,
		// or already have an active/completed task row for this scope.
		result.parsedApps = this._filterAppsNeedingUpgrade(result.parsedApps);
		gs.info('[AutoUpgrade] ' + result.parsedApps.length + ' app(s) need upgrade after version check.');

		if (result.parsedApps.length === 0) {
			return result;
		}

		// Step 1c – Sync sn_managed flag from the Store, then drop apps that are not sn_managed.
		new SnAutoUpgradeStoreClient().syncAppMetadata();
		result.parsedApps = this._filterSnManagedApps(result.parsedApps);
		gs.info('[AutoUpgrade] ' + result.parsedApps.length + ' app(s) eligible after sn_managed check.');

		if (result.parsedApps.length === 0) {
			return result;
		}

		// Step 2 – Persist each app as a task row (status=assigned), deduped on scope.
		result.persistedTaskIds = this._persistTasks(result.parsedApps);

		// Step 3 – Create the sys_batch_install_plan + sys_batch_install_item rows.
		result.installResults = this._executeBatchInstall(result.parsedApps);

		return result;
	},

	_getInstalledSnManagedApps : function () {
		var apps = [];
		var gr   = new GlideRecord('sys_store_app');
		if (gr.isValidField('sn_managed'))
		  gr.addQuery('sn_managed', true);
		gr.query();
		while (gr.next())
			apps.push({ scope: gr.getValue('scope'), version: gr.getValue('version') });
		return apps;
	},

	/**
	 * Convert raw API app objects (snake_case) to the internal shape and drop anything
	 * missing scope/version.
	 */
	_normalizeApps : function (rawApps) {
		var normalized = [];
		for (var i = 0; i < rawApps.length; i++) {
			var a = rawApps[i];
			if (a.scope && a.version) {
				normalized.push({ scope: a.scope, version: a.version });
			} else {
				gs.warn('[SN Managed AutoUpgrade Apps] Skipping malformed app entry: ' + JSON.stringify(a));
			}
		}
		return normalized;
	},

	/**
	 * Keep an app only when it is installed, the assigned version is strictly higher
	 * than what is installed, and no prior non-failed task row exists for the scope.
	 * The Store sends every assigned app on every poll, so apps already at the
	 * target version (or being processed) are silently filtered out here.
	 *
	 * sn_managed eligibility is checked separately in _filterSnManagedApps after
	 * UpdateChecker syncs the flag from the Store.
	 */
	_filterAppsNeedingUpgrade : function (apps) {
		var needed = [];
		var vc     = new sn_appclient.VersionComparator();
		for (var i = 0; i < apps.length; i++) {
			var app = apps[i];
			if (this._hasNonFinalTaskForScope(app.scope)) {
				gs.info('[AutoUpgrade] ' + app.scope + ' skipped: assigned or in_progress task exists.');
				continue;
			}

			var installed = this._getInstalledApp(app.scope);
			if (installed === null) {
				gs.info('[AutoUpgrade] ' + app.scope + ' skipped: not installed (first-time install not supported).');
				continue;
			}
			if (!vc.isUpgrade(installed.version, app.version)) {
				gs.info('[AutoUpgrade] ' + app.scope + ' skipped: installed v' + installed.version
				        + ' is at or above assigned v' + app.version + '.');
				continue;
			}
			needed.push(app);
		}
		return needed;
	},

	/** Re-query sys_store_app after UpdateChecker sync and drop apps whose sn_managed flag is not set. */
	_filterSnManagedApps : function (apps) {
		var eligible = [];
		for (var i = 0; i < apps.length; i++) {
			var app       = apps[i];
			var installed = this._getInstalledApp(app.scope);
			if (installed === null || !installed.snManaged) {
				gs.info('[AutoUpgrade] ' + app.scope + ' skipped: sn_managed flag is false.');
				continue;
			}
			eligible.push(app);
		}
		return eligible;
	},

	/**
	 * Return true if any sn_app_auto_upgr_task row for `scope` is in a non-failed
	 * state (assigned, in_progress, or success). Used to prevent the same scope
	 * from accumulating duplicate tasks across re-deliveries from the Store.
	 */
     _hasNonFinalTaskForScope : function (scope) {
        var gr = new GlideRecord('sn_app_auto_upgr_task');
        gr.addQuery('scope', scope);
        gr.addQuery('status', 'IN', 'assigned,in_progress');
        gr.setLimit(1);
        gr.query();
        return gr.next();
        },

	/**
	 * Return the currently installed version of `scope` from sys_store_app, or
	 * null if the scope is not installed on this instance.
	 */
	_getInstalledApp : function (scope) {
		var gr = new GlideRecord('sys_store_app');
		gr.addQuery('scope', scope);
		gr.addQuery('active', true);
		gr.setLimit(1);
		gr.query();
		if (!gr.next()) return null;
		return {
			version   : gr.getValue('version') || '',
			snManaged : gr.isValidField('sn_managed') ? gr.getValue('sn_managed') === '1' : true
		};
	},

	// -----------------------------------------------------------------------
	// Step 2 – Persist tasks to sn_app_auto_upgr_task
	// -----------------------------------------------------------------------

	/**
	 * Insert one row per app into sn_app_auto_upgr_task with status='assigned'.
	 * Dedupes on scope: any active/completed row for the scope was already filtered
	 * out upstream, so the only rows still in the table for this scope are failed
	 * ones from previous attempts. They are left alone and a fresh row is inserted
	 * for the new attempt.
	 *
	 * @param  {Array} apps - normalized apps with fields {scope, version}
	 * @returns {Array<string>} sys_ids of the inserted rows
	 */
	_persistTasks : function (apps) {
		var sysIds = [];
		for (var i = 0; i < apps.length; i++) {
			var app = apps[i];
			var gr  = new GlideRecord('sn_app_auto_upgr_task');
			gr.initialize();
			gr.setValue('scope',             app.scope);
			gr.setValue('requested_version', app.version);
			gr.setValue('status',            'assigned');
			var sysId = gr.insert();
			if (sysId) {
				sysIds.push(sysId);
				gs.info('[AutoUpgrade] Persisted task for ' + app.scope + ' v' + app.version + ' as sys_id=' + sysId + '.');
			} else {
				gs.error('[AutoUpgrade] Failed to insert task for ' + app.scope
				         + ': ' + (gr.getLastErrorMessage() || '(no error)'));
			}
		}
		return sysIds;
	},

	// -----------------------------------------------------------------------
	// Step 3 – Execute batch install via CI-CD REST API
	// -----------------------------------------------------------------------

	/**
	 * Build ONE sys_batch_install_plan with one sys_batch_install_item per app and
	 * fire a single createBatchInstallPlan() call. Every task row is then stamped
	 * with the same batch_install_plan.
	 *
	 * POST /api/sn_cicd/app/batch/install  (202)
	 *   links.progress.url  – ExecutionTracker progress URL
	 *   links.results.id    – batch plan sys_id
	 *
	 * 409 Conflict → FailedToObtainMutexException; row stays assigned, retry next poll.
	 */
	_executeBatchInstall : function (plan) {
		if (!plan.length) return [];

		// Build the combined package list from all validated apps.
		// CICDBatchInstallService.install() looks the package up in sys_store_app
		// (then sys_remote_app) by sys_id or source_app_id (see InstallationPlan.getScopeRecord).
		// Passing the scope name produces an item row with state=invalid/type=invalid,
		// so we resolve sys_store_app.sys_id here and pass that as the package id.
		var packages     = [];
		var resolvedPlan = [];
		for (var i = 0; i < plan.length; i++) {
			var app   = plan[i];
			var sysId = this._resolveAppSysId(app.scope);
			if (!sysId) {
				gs.error('[AutoUpgrade] Could not resolve sys_id for scope ' + app.scope + '; marking task failed.');
				this._markTaskFailed(app.scope, 'Could not resolve app sys_id for scope ' + app.scope + '.');
				continue;
			}
			packages.push({
				id                : sysId,
				type              : 'application',
				requested_version : app.version,
				load_demo_data    : false
			});
			resolvedPlan.push(app);
		}

		if (!packages.length) {
			gs.warn('[AutoUpgrade] No resolvable packages; batch plan not created.');
			return [];
		}

		var planName = 'auto-upgrade-' + new GlideDateTime().getNumericValue();
		var planJson = JSON.stringify({
			name     : planName,
			notes    : 'Auto-upgrade batch (' + resolvedPlan.length + ' item(s))',
			packages : packages
		});

		var helper       = new SnAutoUpgradeBatchHelper();
		var sharedResult = helper.createBatchInstallPlan(planJson);

		if (sharedResult.success) {
			gs.info('[SN Managed AutoUpgrade Apps] Single batch plan created for ' + resolvedPlan.length
			        + ' item(s) (plan: ' + planName + ', batch_id=' + sharedResult.batchId + ').');
		} else if (sharedResult.statusCode === 409) {
			gs.warn('[SN Managed AutoUpgrade Apps] Mutex conflict creating batch plan -- another update operation is in progress.');
		} else {
			gs.error('[SN Managed AutoUpgrade Apps] Batch plan creation failed: ' + sharedResult.detail);
		}

		// Stamp every resolved task row with the shared batch_install_plan + tracker.
		if (sharedResult.success && sharedResult.batchId) {
			for (var j = 0; j < resolvedPlan.length; j++) {
				this._markTaskInProgress(resolvedPlan[j].scope, sharedResult.batchId, sharedResult.trackerUrl);
			}
		} else if (sharedResult.statusCode !== 409) {
			// Non-mutex failure: surface it on every row of this batch.
			for (var k = 0; k < resolvedPlan.length; k++) {
				this._markTaskFailed(resolvedPlan[k].scope, sharedResult.detail || 'CI-CD trigger failed');
			}
		}

		// Per-app result objects (all share the same batchId/trackerUrl/etc.).
		var results = [];
		for (var m = 0; m < resolvedPlan.length; m++) {
			results.push({
				success    : sharedResult.success,
				statusCode : sharedResult.statusCode,
				trackerUrl : sharedResult.trackerUrl,
				batchId    : sharedResult.batchId,
				detail     : sharedResult.detail,
				app        : resolvedPlan[m]
			});
		}
		return results;
	},

	/**
	 * Look up the sys_id of the sys_store_app row for `scope`. Returns null if not
	 * installed. The CI-CD batch install service resolves packages by sys_id (or
	 * source_app_id), not by scope, so the orchestrator must translate before
	 * building the install plan payload.
	 */
	_resolveAppSysId : function (scope) {
		var gr = new GlideRecord('sys_store_app');
		gr.addQuery('scope', scope);
		gr.setLimit(1);
		gr.query();
		return gr.next() ? gr.getUniqueValue() : null;
	},

	/**
	 * Transition the assigned task row for `scope` to in_progress, recording the
	 * batch_install_plan and tracker the platform returned from the CI-CD
	 * trigger. Looks up the latest assigned row for the scope (there is at most
	 * one because _filterAppsNeedingUpgrade skips scopes with an active task).
	 */
	_markTaskInProgress : function (scope, batchId, trackerUrl) {
		var gr = this._latestAssignedTask(scope);
		if (!gr) {
			gs.warn('[SN Managed AutoUpgrade Apps] No assigned task row found for ' + scope + ' to mark in_progress.');
			return;
		}
		gr.setValue('status', 'in_progress');
		gr.setValue('batch_install_plan', batchId);
		if (trackerUrl) {
			// Extract sys_id from .../api/sn_cicd/progress/<sys_id>
			var m = trackerUrl.match(/\/progress\/([0-9a-f]{32})/i);
			if (m) gr.setValue('tracker', m[1]);
		}
		gr.update();
		gs.info('[SN Managed AutoUpgrade Apps] Task for ' + scope + ' -> in_progress (batch_install_plan=' + batchId + ').');
	},

	/** Transition the assigned task row for `scope` to failed with the given detail. */
	_markTaskFailed : function (scope, detail) {
		var gr = this._latestAssignedTask(scope);
		if (!gr) return;
		gr.setValue('status', 'failed');
		if (detail) gr.setValue('error_message', detail.length > 4000 ? detail.substring(0, 4000) : detail);
		gr.update();
	},

	/** Return a GlideRecord positioned on the latest assigned task row for the scope, or null. */
	_latestAssignedTask : function (scope) {
		var gr = new GlideRecord('sn_app_auto_upgr_task');
		gr.addQuery('scope', scope);
		gr.addQuery('status', 'assigned');
		gr.orderByDesc('sys_created_on');
		gr.setLimit(1);
		gr.query();
		return gr.next() ? gr : null;
	},

    type: 'SnManagedAppAutoUpgradeOrchestrator'
};
