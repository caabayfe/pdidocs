runNext();

function runNext() {	
	// Don't run for Discover Now and Discover CI. Exceptional for Cloud Resources. 
	// Only for 'Cloud Resources' type, even if the description is 'Discover Now' proceed running VM Schedule.
	// If current.dscheduler is empty, there's no need to lookup discovery schedules.
	if ( (current.description == 'Discover Now' && current.discover != 'Cloud Resources') || current.description == 'Discover CI' || current.state == 'Canceled' || JSUtil.nil(current.dscheduler))
		return;

	// Gather any discovery schedules that should be run after us
	var nextScheduleGr = new GlideRecord('discovery_schedule');
	nextScheduleGr.addQuery('disco_run_type', 'after_discovery');
	nextScheduleGr.addQuery('run_after', current.dscheduler);
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
