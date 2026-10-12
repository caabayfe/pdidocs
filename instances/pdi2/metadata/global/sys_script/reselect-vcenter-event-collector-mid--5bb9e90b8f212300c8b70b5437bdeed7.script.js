(function executeRule(current, previous /*null when async*/) {

	var gr, extension;

	// See if a vCenter collector is running on the associated MID.
	// If so, reselect the MID it should use.
	gr = new GlideRecord('ecc_agent_ext_context_vcenter');
	gr.addQuery('executing_on', current.agent);
	gr.query();
	while (gr.next()) {
		extension = new MIDExtensionContext(gr, null, [ { capability: 'VMware' } ]);
		// Reselect won't change the MID if the current MID is still valid.
		// If the current MID isn't valid it will restart the collector which will
		// cause the MID to be re-selected.
		extension.reselect();
	}
})(current, previous);
