var SnAutoUpgradeBatchCompletionHandler = Class.create();
SnAutoUpgradeBatchCompletionHandler.prototype = {
	// Non-terminal: "ready", "in_progress" — _processTaskRow leaves the task row untouched.
	// Terminal success: "installed". Terminal failures: "failed", "invalid", "rolled_back".
	SUCCESS_STATES      : ['installed'],
	NON_TERMINAL_STATES : ['ready', 'in_progress'],

	initialize : function () {},

	/**
	 * @param {string} batchPlanId - sys_id of the completed sys_batch_install_plan
	 */
	handleBatchCompletion : function (batchPlanId) {
		if (!batchPlanId) {
			gs.warn('[AutoUpgrade/Completion] No batch_plan_id provided; skipping.');
			return;
		}

		// AC5: find tracked task rows for this batch. If none, return silently.
		var taskGr = new GlideRecord('sn_app_auto_upgr_task');
		taskGr.addQuery('batch_install_plan', batchPlanId);
		taskGr.query();

		var items  = null;
		var anyRow = false;

		while (taskGr.next()) {
			if (!anyRow) {
				items  = new SnAutoUpgradeBatchHelper().loadBatchItems(batchPlanId);
				anyRow = true;
			}
			this._processTaskRow(taskGr, items);
		}

		if (!anyRow) {
			gs.debug('[AutoUpgrade/Completion] No tracked task for batch ' + batchPlanId + '; ignoring.');
		}
	},

	_processTaskRow : function (taskGr, items) {
		var scope = taskGr.getValue('scope');

		var scopeSysId = this._resolvePluginId(scope);
		var item     = (scopeSysId && items[scopeSysId]) || null;

		if (item && this._isNonTerminalState(item.state)) {
			gs.info('[AutoUpgrade/Completion] Task for ' + scope + ' — item state \'' + item.state + '\' not terminal; leaving row unchanged.');
			return;
		}

		var finalStatus = 'failed';
		var errorDetail = null;

		if (!item)
			errorDetail = 'No matching sys_batch_install_item for scope ' + scope;
		else if (this._isSuccessState(item.state))
			finalStatus = 'success';
		else
			errorDetail = item.status_message || item.reason || ('Item state: ' + item.state);

		taskGr.setValue('status', finalStatus);
		if (errorDetail) taskGr.setValue('error_message', this._truncate(errorDetail, 4000));
		taskGr.update();
		gs.info('[AutoUpgrade/Completion] Task for ' + scope + ' -> ' + finalStatus + (errorDetail ? ' (' + errorDetail + ')' : ''));
	},

	_resolvePluginId : function (scope) {
		var gr = new GlideRecord('sys_store_app');
		gr.addQuery('scope', scope);
		gr.setLimit(1);
		gr.query();
		return gr.next() ? gr.getUniqueValue() : null;
	},

	_isNonTerminalState : function (state) {
		return this.NON_TERMINAL_STATES.indexOf(state) !== -1;
	},

	_isSuccessState : function (state) {
		return this.SUCCESS_STATES.indexOf(state) !== -1;
	},

	_truncate : function (s, n) {
		return (s && s.length > n) ? s.substring(0, n) : s;
	},
    type: 'SnAutoUpgradeBatchCompletionHandler'
};
