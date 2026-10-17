var SnAutoUpgradeBatchHelper = Class.create();
SnAutoUpgradeBatchHelper.prototype = {
	initialize: function() {},

	/**
	 * Load all sys_batch_install_item rows for a given batch plan, keyed by
	 * the app sys_id (the 'id' field on the item row).
	 *
	 * @param {string} batchPlanId
	 * @returns {object} { [app_sys_id]: { state, reason, status_message, name } }
	 */
	loadBatchItems: function(batchPlanId) {
		var items = {};
		if (!batchPlanId) return items;
		var gr = new GlideRecord('sys_batch_install_item');
		gr.addQuery('batch_install_plan', batchPlanId);
		gr.query();
		while (gr.next()) {
			var key = gr.getValue('id');
			if (!key) continue;
			items[key] = {
				state          : gr.getValue('state'),
				reason         : gr.getValue('reason'),
				status_message : gr.getValue('status_message'),
				name           : gr.getValue('name')
			};
		}
		return items;
	},

	/**
	 * Create a batch install plan via CICDBatchInstallService (no HTTP).
	 * Requires sys_scope_privilege granting sn_app_auto_upgr access to sn_uc
	 * if the platform blocks the cross-scope call to AppAutoUpgradeBatchInstaller.
	 *
	 * @param {string} planJson - serialized InstallationPlan body
	 * @returns {object} { success, trackerUrl, batchId, detail }
	 */
	createBatchInstallPlan: function(planJson) {
		try {
			var raw    = new sn_uc.AppAutoUpgradeBatchInstaller().install(planJson);
			var result = JSON.parse(String(raw));
			if (!result.ok) {
				gs.error('[AutoUpgrade] CICDBatchInstallService.install failed: ' + result.error);
				return { success: false, trackerUrl: null, batchId: null, detail: result.error };
			}
			return {
				success    : true,
				trackerUrl : result.trackerUrl || null,
				batchId    : result.batchId    || null,
				detail     : null
			};
		} catch (e) {
			gs.error('[AutoUpgrade] createBatchInstallPlan threw: ' + e.message);
			return { success: false, trackerUrl: null, batchId: null, detail: 'Exception: ' + e.message };
		}
	},

	type: 'SnAutoUpgradeBatchHelper'
};
