(function() {
	var agent = current.sys_id;
	var status = current.status;
	var contextGr = getNonErrorContextsForAgent(agent);

	if (status == 'Down') {
		// When this MID server goes down, we want to restart all contexts
		// currently assigned to it so they might be picked up by another
		// MID server.
		startContexts(contextGr);
	} else {
		// When this MID server goes up, there might be a situation where some
		// contexts were running on this server but have not been updated to offline
		// yet when it went down. Mark them offline now so that the restart logic
		// is simplified in the main script include MIDExtensionContext.
		offlineContexts(contextGr);
		
		// We might have other offline contexts that can be executed on this
		// server now that it's up. Attempt to restart them all.
		var offlineGr = new GlideRecord(MIDExtensionConstants.CONTEXT_TABLE);
		offlineGr.addQuery(MIDExtensionConstants.STATUS, MIDExtensionConstants.CONTEXT_STATUS_OFFLINE);
		offlineGr.query();
		startContexts(offlineGr);
	}

	/*
	 * Gets all contexts currently assigned to the MID server so they can
	 * be failed over. We don't want to automatically restart contexts in
	 * Error state though.
	 */
	function getNonErrorContextsForAgent(agent) {
		var gr = new GlideRecord(MIDExtensionConstants.CONTEXT_TABLE);
		gr.addQuery(MIDExtensionConstants.EXECUTING_ON, agent);
		gr.addQuery(MIDExtensionConstants.STATUS, '!=', MIDExtensionConstants.CONTEXT_STATUS_ERROR);
		gr.query();
		return gr;
	}

	/*
	 * Updates these contexts to Offline.
	 */
	function offlineContexts(gr) {
		while (gr.next()) {
			var offlineGr = new GlideRecord(MIDExtensionConstants.CONTEXT_TABLE);
			offlineGr.get(contextGr.sys_id);
			offlineGr.status = MIDExtensionConstants.CONTEXT_STATUS_OFFLINE;
			offlineGr.update();
		}
	}

	/*
	 * Attempts to automatically start these contexts.
	 */
	function startContexts(gr) {
		while (gr.next()) {
			var context = new MIDExtensionContext(gr);
			context.start();
		}
	}
}());
