runNext();

function runNext() {
	// Don't run for Discover Now and Discover CI
	// If schedule value is empty, there's no need to look up discovery schedules.
	if (current.description == 'Discover Now' || current.description == 'Discover CI' || JSUtil.nil(current.dscheduler))
		return;
	
	// Gather any discovery schedules that should be run after us
	var nextScheduleGr = new GlideRecord('discovery_schedule');
	nextScheduleGr.addQuery('disco_run_type', 'after_discovery');
	nextScheduleGr.addQuery('run_after', current.dscheduler);
	nextScheduleGr.addQuery('even_if_canceled', 'true');
	nextScheduleGr.addActiveQuery();
	nextScheduleGr.query();
	
	while (nextScheduleGr.next()) {
		if (isValidDiscoverySchedule(nextScheduleGr)) {
			SncTriggerSynchronizer.executeNow(nextScheduleGr);
		}
	}
}

function isValidDiscoverySchedule(discoScheduleGr) {
	// Check that we have discovery range set...
	var disco = new Discovery();
	return disco.isValidDiscoverySchedule(discoScheduleGr);
}
