var TSTextSearchDashboardAjax = Class.create();

TSTextSearchDashboardAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {

	// Returns the confirmation message the dashboard should show before disable/enable, tailored to
	// the table (warn-tier / indexed-children escalation for disable; reindex note for enable). Lets
	// the client stay policy-free - it just shows whatever text this returns.
	ajaxFunction_getActionContext: function() {
		if (!gs.hasRole('ts_admin'))
			return gs.getMessage('Access denied');

		var table = this.getParameter('sysparm_table');
		var action = this.getParameter('sysparm_action');
		var admin = new GlideTSTextSearchAdmin();
		var display = this._tableDisplay(table);

		if (action == 'enable')
			return gs.getMessage('Turn on text indexing for {0}? Rebuilding the index can take a while on large tables.', display);

		var msg = gs.getMessage('Turn off text indexing for {0}? Its records will no longer appear in search results. You can turn it back on anytime.', display);
		var warning = admin.getWarningReason(table);
		if (warning)
			msg += ' ' + warning;

		return msg;
	},

	// Renders the table as "Label [name]" (matches the dashboard grid and is session-language aware via
	// GlideMetaData; using GlideRecord.getValue('label') would return the base language only). Falls
	// back to the technical name when there is no distinct label.
	_tableDisplay: function(table) {
		var label = new GlideMetaData().getTableLabel(table);
		label = label ? '' + label : '';
		if (label && label !== table)
			return label + ' [' + table + ']';

		return table;
	},

	ajaxFunction_disable: function() {
		// Full message inside getMessage (no concatenation) so it extracts for translation per i18n
		// DoD (KB0562047). Client treats any non-'OK:'-prefixed answer as an error, so the leading
		// 'ERROR:' here is informational only and success detection is unaffected.
		if (!gs.hasRole('ts_admin'))
			return gs.getMessage('ERROR: Access denied');

		var table = this.getParameter('sysparm_table');
		var admin = new GlideTSTextSearchAdmin();
		var result = admin.disableTextSearch(table);

		// Verify the state actually changed rather than trusting the message text, since
		// disableTextSearch returns a human-readable string either way (success or refusal).
		var success = admin.isTextSearchDisabled(table);
		return (success ? 'OK:' : 'ERROR:') + result;
	},

	ajaxFunction_enable: function() {
		if (!gs.hasRole('ts_admin'))
			return gs.getMessage('ERROR: Access denied');

		var table = this.getParameter('sysparm_table');
		var admin = new GlideTSTextSearchAdmin();
		var result = admin.enableTextSearch(table);

		var success = !admin.isTextSearchDisabled(table);
		return (success ? 'OK:' : 'ERROR:') + result;
	},

	type: 'TSTextSearchDashboardAjax'
});
