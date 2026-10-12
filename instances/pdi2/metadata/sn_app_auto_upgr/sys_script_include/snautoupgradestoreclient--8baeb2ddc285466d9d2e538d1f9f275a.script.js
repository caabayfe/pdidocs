var SnAutoUpgradeStoreClient = Class.create();
SnAutoUpgradeStoreClient.prototype = {
	initialize: function() {},

	/**
	 * POST /api/sn_store/v1/autoupgrade/poll?instance_id={instance_id}
	 *
	 * Carries the instance's installed SN managed apps; the Store returns the full
	 * set of apps assigned to this instance with their target versions.
	 *
	 * Returns { ok, code, body }, where body is { apps: [{scope, version}, ...] }.
	 */
	poll: function(installedApps) {
		var req     = new ScopedAppRepoRequest();
		var rawBody = req.pollAutoUpgrade(JSON.stringify({ installed_apps: installedApps }));
		var code    = req.getStatusCode();
		var ok      = code >= 200 && code < 300;
		if (!ok) gs.error('[AutoUpgrade/Store] HTTP ' + code + ': ' + rawBody);
		return { ok: ok, code: code, body: (ok && rawBody) ? JSON.parse(rawBody) : null };
	},

	/**
	 * Syncs app metadata (including sn_managed flag) from the Store into sys_store_app
	 * by delegating to sn_appclient.UpdateChecker.checkAvailableUpdates().
	 * Must be called before any sn_managed eligibility check.
	 */
	syncAppMetadata: function() {
		try {
			gs.info('[AutoUpgrade/Store] Syncing app metadata from Store.');
			new sn_appclient.UpdateChecker().checkAvailableUpdates(false, false, null, false);
			gs.info('[AutoUpgrade/Store] App metadata sync complete.');
		} catch(e) {
			gs.error('[AutoUpgrade/Store] App metadata sync failed: ' + e.message);
		}
	},

	type: 'SnAutoUpgradeStoreClient'
};
