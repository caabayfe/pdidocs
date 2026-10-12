var PlaybookTabUtil = Class.create();
PlaybookTabUtil.prototype = {
	EXTENSION_POINT: 'sn_itam_workspace.PlaybookTabProvider',

	initialize: function() {},

	/**
	 * Decide whether the Playbook tab should be hidden for the given record by
	 * dispatching to registered PlaybookTabProvider extensions for the table.
	 *
	 * Resolution policy is "show wins": if any provider that handles the table
	 * wants the tab shown, the tab is shown. The tab is hidden when no provider
	 * handles the table or every handling provider votes to hide.
	 *
	 * A provider that throws is treated as a vote to hide (skipped), so a broken
	 * or partially-installed provider can never crash the decision and leave the
	 * tab showing by default.
	 *
	 * @param {string} table - The record's table.
	 * @param {string} sysId - The record's sys_id.
	 * @returns {boolean} true to hide the tab, false to show it.
	 */
	hidePlaybookTab: function(table, sysId) {
		if (!table || !sysId) {
			return true;
		}

		var providers = new GlideScriptedExtensionPoint().getExtensions(this.EXTENSION_POINT);
		if (!providers || !providers.length) {
			return true;
		}

		for (var i = 0; i < providers.length; i++) {
			var provider = providers[i];
			try {
				if (provider &&
					typeof provider.handlesTable === 'function' &&
					provider.handlesTable(table) &&
					provider.hidePlaybookTab(table, sysId) === false) {
					return false;
				}
			} catch (ex) {
				gs.error('PlaybookTabUtil: provider failed for table ' + table + ', treating as hide: ' + ex.message);
			}
		}

		return true;
	},

	type: 'PlaybookTabUtil',
};
