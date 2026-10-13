(function executeRule(current, previous /*null when async*/) {
	var evGr;
	var m2mGr;
	var i;
	var qc;
	
	// Find all the events we have OOB handlers for.
	evGr = new GlideRecord('vcenter_event');
	evGr.addQuery('event_id', 'IN', Object.keys(VCenterVmStateUpdater.handlers));
	evGr.query();
	
	// For each event name found, add to vctr_evt_vctr_ext_cx_m2m for this vCenter context.
	while (evGr.next()) {
		m2mGr = new GlideRecord("vctr_evt_vctr_ext_cx_m2m");
		m2mGr.initialize();
		m2mGr.context = current.getUniqueValue();
		m2mGr.event = evGr.getUniqueValue();
		m2mGr.insert();
	}
	gs.addInfoMessage(gs.getMessage('vCenter Event Collector Context "{0}" has been pre-populated with events handled by default in the base system', current.name));
})(current, previous);
