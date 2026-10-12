/**
 * ServiceNow strongly recommends to not modify this script. Modification might result in cleanup script progress not being * shown.
 * SCRIPT INCLUDE: PostCloneScriptsScheduler
 * ─────────────────────────────────────────────────────────────────────────────
 * Orchestrates execution of all clone_cleanup_script_execution records.
 *
 * EXECUTION MODES (auto-detected):
 *
 *   MODE A – ALL RECORDS SHARE THE SAME ORDER (or only one order value exists)
 *     → All scripts fire in parallel immediately.
 *
 *   MODE B – MULTIPLE DISTINCT ORDER VALUES EXIST
 *     → Scripts are grouped by order, groups execute sequentially.
 *
 * STATUS LIFECYCLE:
 *   ready  →  running  →  completed
 *                      →  error          (script threw an error)
 *                      →  not_executed    (halted because an earlier script failed)
 * ─────────────────────────────────────────────────────────────────────────────
 */
var PostCloneScriptsScheduler = Class.create();
PostCloneScriptsScheduler.prototype = {

    /* ── Tunables ────────────────────────────────────────────────── */
    TABLE      	: 'sn_instance_clone_cleanup_script_execution',
	POLL_READY_MS 	: 3000,     // Polling interval for checking Ready state.
    POLL_MS    		: 120000,   // Polling interval while waiting for a group to finish
    TIMEOUT_MS 		: 600000,    // 10 min max per order-group before hard abort

    initialize: function(chgNumber) {
		this.chgNumber = chgNumber;
	},

	/**
	 * Returns true if the given chgNumber is the highest CHG number in the table,
	 * false otherwise.
	 *
	 * Relies on CHG numbers being zero-padded to a fixed width
	 * (e.g. CHG0001234) so alphabetical descending == numeric descending.
	 */
	isMaxChgNumber: function() {
		if (gs.nil(this.chgNumber)) {
			gs.error('[PostCloneScriptsScheduler] isMaxChgNumber: chgNumber is nil.');
			return false;
		}

		var gr = new GlideRecord(this.TABLE);
		gr.addNotNullQuery('chg');
		gr.orderByDesc('chg');
		gr.setLimit(1);
		gr.query();

		return gr.next() ? gr.getValue('chg') === this.chgNumber : false;
	},

	/* Delete all records in this.TABLE for this.chgNumber. */
	deleteRecords: function() {
		if (gs.nil(this.chgNumber)) {
			gs.error('[PostCloneScriptsScheduler] deleteRecords: chgNumber is nil — aborting to avoid unintended bulk delete.');
			return;
		}
		var gr = new GlideRecord(this.TABLE);
		gr.addQuery('chg', this.chgNumber);
		gr.deleteMultiple();
		gs.info('[PostCloneScriptsScheduler] Deleted records for chg=' + this.chgNumber);
	},

    /* ══════════════════════════════════════════════════════════════
     * PUBLIC ENTRY POINT
     * Call from a Scheduled Job or Fix Script (background context required).
     * ══════════════════════════════════════════════════════════════ */
    execute: function() {
        gs.info('[PostCloneScriptsScheduler] ═══ Run started ═══');

		if(gs.nil(this.chgNumber) || !this.chgNumber.startsWith('CHG')) {
			gs.error('[PostCloneScriptsScheduler] ═══ chgNumber is Empty or does not start with CHG. Cannot proceed with execution. ═══');
			gs.info('[PostCloneScriptsScheduler] ═══ Run finished ═══');
			return;
		}

        var orderGroups = this._buildOrderGroups(); // [ { order:N, ids:[...] }, ... ]

        if (orderGroups.length === 0) {
            gs.info('[PostCloneScriptsScheduler] No scripts in "ready" status – nothing to do.');
            return;
        }

        if (orderGroups.length == 1) {
            gs.info('[PostCloneScriptsScheduler] MODE A: All orders are same - launching all scripts in parallel.');
            this._runAllParallel(orderGroups);
        } else {
			var firstGroup = orderGroups[0];
			var firstGroupActive = this._hasActiveScripts(firstGroup.ids);
			if (firstGroupActive) {
				gs.warn('[PostCloneScriptsScheduler] Order group ' + firstGroup.order +
						' still has active scripts. Scheduling recheck before advancing.');
				this.scheduleResume(firstGroup.order);
				return;
			}
            gs.info('[PostCloneScriptsScheduler] MODE B: All orders are not same - executing groups sequentially.');
            this._runGroupsSequentially(orderGroups);
        }

        gs.info('[PostCloneScriptsScheduler] ═══ Run finished ═══');
    },

	// Checks if any script in a group is still active (not yet terminal)
	_hasActiveScripts: function(sysIds) {
		var gr = new GlideRecord(this.TABLE);
		gr.addQuery('chg', this.chgNumber);
		gr.addQuery('sys_id', 'IN', sysIds.join(','));
		gr.addQuery('status', 'IN', 'scheduled,running');
		gr.setLimit(1);
		gr.query();
		return gr.next();
	},

    /* ══════════════════════════════════════════════════════════════
     * MODE A  –  All scripts in parallel (no order grouping needed)
     * ══════════════════════════════════════════════════════════════ */
    _runAllParallel: function(orderGroups) {
        // Flatten every group's ids into one array
        var allIds = [];
        orderGroups.forEach(function(g) {
            g.ids.forEach(function(id) { allIds.push(id); });
        });

        this._launchWorkers(allIds);
    },

	sleep: function(milliseconds) {
		var start = new GlideDateTime().getNumericValue();
		while (new GlideDateTime().getNumericValue() - start < milliseconds) {
			// spin
		}
	},

	/* ══════════════════════════════════════════════════════════════
	* PUBLIC – Run a single script record.
	* Resets the record to "scheduled" and re-launches its worker.
	* Called from UI Action on clone_cleanup_script_execution.
	*
	* Usage:
	*   new PostCloneScriptsScheduler(chgNumber).runScript(sysId);
	* ══════════════════════════════════════════════════════════════ */
	runScript: function(sysId) {
		gs.info('[PostCloneScriptsScheduler] ── Retry requested for sys_id=' + sysId);

		// ── Guard 1: Record must exist and belong to this chgNumber ──────────
		var gr = new GlideRecord(this.TABLE);
		if (!gr.get(sysId)) {
			gs.error('[PostCloneScriptsScheduler] Retry failed: record not found for sys_id=' + sysId);
			return { success: false, message: 'Record not found.' };
		}

		if (gr.getValue('chg') !== this.chgNumber) {
			gs.error('[PostCloneScriptsScheduler] Retry failed: sys_id=' + sysId +
					' does not belong to chg=' + this.chgNumber);
			return { success: false, message: 'Record does not belong to change ' + this.chgNumber };
		}

		// ── Guard 2: Only retry failed records ───────────────────────────────
		var currentStatus = gr.getValue('status');
		if (currentStatus !== 'error' && currentStatus !== 'not_executed' && currentStatus !== 'ready') {
			gs.warn('[PostCloneScriptsScheduler] Retry skipped: sys_id=' + sysId +
					' has status="' + currentStatus + '" (only "failed/ready/not_executed" records can be retried).');
			return { success: false, message: 'Only failed, not_executed or ready scripts can be retried. Current status: ' + currentStatus };
		}

		var scriptName = gr.getValue('name');
		var groupOrder = gr.getValue('order');

		// ── Reset record to scheduled ─────────────────────────────────────────────
		gr.setValue('status',        'scheduled');
		gr.setValue('started',       null);
		gr.setValue('ended',         null);
		gr.setValue('error_message', '');
		gr.update();
		gs.info('[PostCloneScriptsScheduler] Reset "' + scriptName + '" to scheduled for running.');

		// ── Re-launch worker ──────────────────────────────────────────────────
		var progressId = '';
		try {
			var worker = new GlideScriptedHierarchicalWorker();
			worker.setProgressName('PostClone_' + this.chgNumber + '_' + sysId +
								'_run_' + new Date().getTime());
			worker.setScriptIncludeName('sn_instance_clone.PostCloneScriptRunner');
			worker.setScriptIncludeMethod('runScript');
			worker.putMethodArg('sysId', sysId);
			worker.setBackground(true);
			worker.start();

			progressId = worker.getProgressID();
			if (!progressId)
				throw new Error('Worker rejected by background pool (no progress ID assigned).');

			this.sleep(1000);

			if(progressId) {
				worker = new GlideRecord('sys_progress_worker');
				worker.addQuery('sys_id', progressId);
				worker.addQuery('state', 'cancelled');
				worker.query();
				if(worker.next())
					throw new Error(worker.message);
			}

			gs.info('[PostCloneScriptsScheduler] Worker launched for "' + scriptName +
					'" | progressId=' + progressId);
			return { success: true, message: 'Run started for "' + scriptName + '".', progressId: progressId };

		} catch (e) {
			var rollback = new GlideRecord(this.TABLE);
			if (rollback.get(sysId)) {
				rollback.setValue('status',        'error');
				rollback.setValue('error_message', 'Worker launch failed: ' + e.toString());
				rollback.update();
			}
			gs.error('[PostCloneScriptsScheduler] Worker launch failed for "' + scriptName + '": ' + e);
			return { success: false, message: 'Worker launch failed: ' + e.toString() };
		}
	},

	_scheduleRecheck: function(groupOrder) {
		var jobName = 'PostClone_Recheck_Group_' + this.chgNumber + '_' + groupOrder;
		var script  = 'new sn_instance_clone.PostCloneScriptsScheduler("' + this.chgNumber + '").scheduleResume(' + groupOrder + ');';

		this._scheduleOnceIfAbsent(jobName, script, 600);
	},

	/**
	 * Schedules a ScheduleOnce job only if one with the same label is not
	 * already pending. Returns true if a new job was created, false if skipped.
	 *
	 * @param  {string} jobName    - Unique label for the job (used for dedup).
	 * @param  {string} script     - Script body to execute when the job fires.
	 * @param  {number} delaySecs  - Delay in seconds before the job runs.
	 */
	_scheduleOnceIfAbsent: function(jobName, script, delaySecs) {
		global.CloneGlobalWrapper.scheduleOnce(jobName, script, delaySecs);
	},

	scheduleResume: function(groupOrder) {
		if(gs.nil(this.chgNumber)) {
			gs.error('[PostCloneScriptsScheduler] scheduleResume Empty CHG Number. Could not proceed for re-check or resume.');
			return;
		}
		// ── Check 1: Are there any prior-group scripts still running? ─────────
		// If an earlier group somehow has running records (e.g. worker outlived
		// its group's timeout window), don't schedule a resume yet — let those
		// settle first to preserve ordering guarantees.
		var staleRunning = new GlideRecord(this.TABLE);
		staleRunning.addQuery('chg', this.chgNumber);
		staleRunning.addQuery('status', 'IN', 'ready,scheduled,running');
		staleRunning.addQuery('order', '<=', groupOrder); // earlier groups only
		staleRunning.setLimit(1);
		staleRunning.query();
		if (staleRunning.next()) {
			var staleName = staleRunning.getValue('name');
			gs.warn('[PostCloneScriptsScheduler] Prior-group script "' + staleName + 
					'" is still ready/scheduled or running (order <= ' + groupOrder + '). ' +
					'Delaying resume — scheduling recheck instead.');
			this._scheduleRecheck(groupOrder); // shorter interval, just re-evaluates
			return;
		}

		// ── Check 2: Are there any prior-group scripts failed?
		var failedRunning = new GlideRecord(this.TABLE);
		failedRunning.addQuery('chg', this.chgNumber);
		failedRunning.addQuery('status', 'error');
		failedRunning.addQuery('order', '<=', groupOrder); // earlier groups only
		failedRunning.setLimit(1);
		failedRunning.query();
		if (failedRunning.next()) {
			var failedscriptName = failedRunning.getValue('name') || failedRunning.getUniqueValue(),
				reason = 'Not executed: a script in order group ' + failedRunning.getValue('order') + ' failed (name=' + failedscriptName + ').';

			gs.warn('[PostCloneScriptsScheduler] Prior-group script "' + failedscriptName + 
					'" has failed (order <= ' + groupOrder + '). ');

			failedRunning = new GlideRecord(this.TABLE);
			failedRunning.addQuery('chg', this.chgNumber);
			failedRunning.addQuery('status', 'IN', 'ready,scheduled');
			failedRunning.addQuery('order', '>', groupOrder);
			failedRunning.query();
			while(failedRunning.next()) {
				failedRunning.setValue('status', 'not_executed');
				failedRunning.setValue('error_message', reason);
				failedRunning.update();
			}

			return;
		}

		// ── All clear: schedule execute() to pick up the next group ──────────
		var jobName = 'PostCloneScripts_Resume_Group_' + this.chgNumber + '_' + groupOrder;
		var script  = 'new sn_instance_clone.PostCloneScriptsScheduler("' + this.chgNumber + '").execute();';

		this._scheduleOnceIfAbsent(jobName, script, 10);
	},

    /* ══════════════════════════════════════════════════════════════
     * MODE B  –  Sequential groups, parallel within each group
     * ══════════════════════════════════════════════════════════════ */
    _runGroupsSequentially: function(orderGroups) {
        for (var i = 0; i < orderGroups.length; i++) {
            var group = orderGroups[i];
            gs.info('[PostCloneScriptsScheduler] ─ Starting order group: ' + group.order +
                    ' (' + group.ids.length + ' script(s))');

            // Launch all workers in this group in parallel
            this._launchWorkers(group.ids);

            // Wait until every script in the group reaches a terminal state
            var timedOut = this._waitForGroup(group.ids, group.order);
			if (timedOut) {
				gs.info('[PostCloneScriptsScheduler] Order group ' + group.order + 
						' still running after ' + (this.TIMEOUT_MS/60000) + ' min. Scheduling recheck.');
				this.scheduleResume(group.order); // just for logging/identification
				return; // workers keep running untouched
			}

            // Check whether any script in the group failed
            var failedscriptName = this._getFirstFailedScriptName(group.ids);
            if (failedscriptName) {
                gs.info('[PostCloneScriptsScheduler] Script ' + failedscriptName +
                         ' failed in order group ' + group.order +
                         '. Halting all subsequent scripts.');

                // Mark everything not yet started as "not_executed"
                this._markRemainingNotExecuted(orderGroups, i, group.ids,
                    'Not executed: a script in order group ' + group.order + ' failed (name=' + failedscriptName + ').');
                return;
            }

            gs.info('[PostCloneScriptsScheduler] ─ Order group ' + group.order + ' completed successfully.');
        }
    },

    /* ══════════════════════════════════════════════════════════════
     * WORKER DISPATCH
     * ══════════════════════════════════════════════════════════════ */
    _launchWorkers: function(sysIds) {
		var self = this;
		sysIds.forEach(function(sysId) {
			var progressId = '',
				gr = '';
			
			try {
				gr = new GlideRecord(self.TABLE);
				if(!gr.get(sysId))
					return;

				var recordStatus = gr.getValue('status');
				if (recordStatus === 'running' || recordStatus === 'scheduled') {
					gs.info('[PostCloneScriptsScheduler] Skipping launch for sys_id=' + sysId +
							' — record already in status="' + recordStatus + '". Worker is active.');
					return;
				} else {
					gr.setValue('status', 'scheduled');
					gr.update();
					
					var worker = new GlideScriptedHierarchicalWorker();
					worker.setProgressName('PostClone_' + self.chgNumber + "_" + sysId);
					worker.setScriptIncludeName('sn_instance_clone.PostCloneScriptRunner');
					worker.setScriptIncludeMethod('runScript');
					worker.putMethodArg('sysId', sysId);
					worker.setBackground(true);
					worker.start();

					// ── Post-start validation ──────────────────────────────────
					// start() does NOT throw on pool rejection ("no thrown error").
					// Verify the worker was actually accepted by checking its progress ID.
					progressId = worker.getProgressID();
					if (!progressId) {
						throw new Error('Worker rejected by background pool (no progress ID assigned). ' +
										'Pool may be exhausted or a duplicate progress name exists.');
					}

					gs.info('[PostCloneScriptsScheduler] Worker launched for sys_id=' + sysId +
							', progressId=' + progressId);
				}

			} catch (e) {
				gs.error('[PostCloneScriptsScheduler] Failed to launch worker for ' + sysId + ': ' + e);
				gr = new GlideRecord(self.TABLE);
				if (gr.get(sysId)) {
					gr.setValue('status',        'error');
					gr.setValue('started',       new GlideDateTime());
					gr.setValue('ended',         new GlideDateTime());
					gr.setValue('error_message', 'Worker launch failed: ' + e.toString());
					gr.update();
				}

				return;
			}

			self.sleep(self.POLL_READY_MS);
			if(progressId) {
				worker = new GlideRecord('sys_progress_worker');
				worker.addQuery('sys_id', progressId);
				worker.addQuery('state', 'cancelled');
				worker.query();
				if(worker.next()) {
					gr = new GlideRecord(self.TABLE);
					if (gr.get(sysId)) {
						gr.setValue('status',        'error');
						gr.setValue('started',       new GlideDateTime());
						gr.setValue('ended',         new GlideDateTime());
						gr.setValue('error_message', 'Worker launch failed: ' + worker.message);
						gr.update();
					}
				}
			}
		}, this);
	},

    /* ══════════════════════════════════════════════════════════════
     * POLLING – wait for all ids in a group to reach terminal state
     * ══════════════════════════════════════════════════════════════ */
    _waitForGroup: function(sysIds, orderLabel) {
        var started = new Date().getTime();

        while (true) {
            if (this._allTerminal(sysIds)) {
                return false; // all done, no timeout
            }

            var elapsed = new Date().getTime() - started;
            if (elapsed >= this.TIMEOUT_MS) {
                return true; // timed out
            }

            gs.info('[PostCloneScriptsScheduler] Polling order group [' + orderLabel + '] … ' +
                    Math.round(elapsed / 1000) + 's elapsed.');
            this.sleep(this.POLL_MS);
        }
    },

    /* ══════════════════════════════════════════════════════════════
     * FAILURE PROPAGATION
     * Marks all scripts that haven't started yet as "not_executed".
     * currentGroupIndex   – index of the group that just failed
     * currentGroupIds     – ids of the failed group (may have mixed outcomes)
     * ══════════════════════════════════════════════════════════════ */
    _markRemainingNotExecuted: function(orderGroups, currentGroupIndex, currentGroupIds, reason) {
        // Collect ids from ALL groups after the current one
        var pendingIds = [];
        for (var i = currentGroupIndex + 1; i < orderGroups.length; i++) {
            orderGroups[i].ids.forEach(function(id) { pendingIds.push(id); });
        }

        // Also include any scripts in the CURRENT group still in "ready" state
        // (edge case: only one failed but others in same group hadn't been picked up)
        currentGroupIds.forEach(function(id) { pendingIds.push(id); });

        if (pendingIds.length === 0)
			return;

        // Bulk-update all still-ready records
        var gr = new GlideRecord(this.TABLE);
		gr.addQuery('chg', this.chgNumber);
        gr.addQuery('sys_id', 'IN', pendingIds.join(','));
        gr.addQuery('status', 'IN', 'ready,scheduled');  // only touch scripts not yet started/
        gr.query();

        var count = 0;
        var markedNames = [];
        while (gr.next()) {
            var scriptName = gr.getValue('name') || gr.getUniqueValue();
            gr.setValue('status', 'not_executed');
            gr.setValue('error_message', reason);
            gr.update();
            gs.info('[PostCloneScriptsScheduler] Marked as not_executed: "' + scriptName + '" (sys_id=' + gr.getUniqueValue() + ')');
            markedNames.push(scriptName);
            count++;
        }

        gs.info('[PostCloneScriptsScheduler] Marked ' + count + ' script(s) as not_executed: [' + markedNames.join(', ') + ']. Reason: ' + reason);
    },

	markRemainingNotExecuted: function(currentOrder, reason) {
		if (gs.nil(currentOrder)) {
			gs.error('[PostCloneScriptsScheduler] markRemainingNotExecuted: currentOrder is nil — aborting to avoid unintended bulk update.');
			return;
		}
		reason = reason || 'Not executed: a prior script failed.';
        var gr = new GlideRecord(this.TABLE);
		gr.addQuery('chg', this.chgNumber);
        gr.addQuery('order', '>', currentOrder);
        gr.addQuery('status', 'IN', 'ready,scheduled');  // only touch scripts not yet started/
        gr.query();

		var count = 0;
        var markedNames = [];
        while (gr.next()) {
            var scriptName = gr.getValue('name') || gr.getUniqueValue();
            gr.setValue('status', 'not_executed');
            gr.setValue('error_message', reason);
            gr.update();
            gs.info('[PostCloneScriptsScheduler] Marked as not_executed: "' + scriptName + '" (sys_id=' + gr.getUniqueValue() + ')');
            markedNames.push(scriptName);
            count++;
        }

        gs.info('[PostCloneScriptsScheduler] Marked ' + count + ' script(s) as not_executed: [' + markedNames.join(', ') + ']. Reason: ' + reason);
	},

    /* ══════════════════════════════════════════════════════════════
     * DATA HELPERS
     * ══════════════════════════════════════════════════════════════ */

    /**
     * Returns an ordered array of { order: N, ids: [ sys_id, ... ] }
     * Only includes records currently in "ready" status.
     */
    _buildOrderGroups: function() {
        var groupMap = {};   // order → [ids]
        var orderSeq = [];   // preserves insertion order for later sort

        var gr = new GlideRecord(this.TABLE);
		gr.addQuery('chg', this.chgNumber);
        gr.addQuery('status', 'IN', 'ready,scheduled,running');
        gr.orderBy('order');
        gr.query();

        while (gr.next()) {
            var order = parseInt(gr.getValue('order'), 10);
            var id    = gr.getUniqueValue();

            if (!groupMap[order]) {
                groupMap[order] = [];
                orderSeq.push(order);
            }
            groupMap[order].push(id);
        }

        // Build final sorted array
        orderSeq.sort(function(a, b) { return a - b; });
        return orderSeq.map(function(o) {
            return { order: o, ids: groupMap[o] };
        });
    },

    /**
     * True when no record in the list is still in a non-terminal state.
     * Terminal states: completed, failed, not_executed.
     * Non-terminal:    ready, running.
     */
    _allTerminal: function(sysIds) {
        var gr = new GlideRecord(this.TABLE);
		gr.addQuery('chg', this.chgNumber);
        gr.addQuery('sys_id', 'IN', sysIds.join(','));
        gr.addQuery('status', 'IN', 'ready,scheduled,running');
        gr.setLimit(1);
        gr.query();
        return !gr.next();
    },

    /** Returns the name of the first failed record in a list, or null. */
    _getFirstFailedScriptName: function(sysIds) {
        var gr = new GlideRecord(this.TABLE);
        gr.addQuery('sys_id',   'IN', sysIds.join(','));
		gr.addQuery('chg', this.chgNumber);
        gr.addQuery('status', 'error');
        gr.setLimit(1);
        gr.query();
        return gr.next() ? gr.getValue('name') : null;
    },

    type: 'PostCloneScriptsScheduler'
};
