// The scheduled trigger the design doc's §2.3 names. Deliberately the sync entry point: this is already
// running on a worker thread of its own, so queuing an event to move the work to another one would buy
// nothing and would lose the one thing a scheduled job gives for free - a run that is finished when the job
// is finished, and so cannot overlap the next one.
//
// runAll opens its own Scan Job row and executes every active definition, catching per-definition failures so
// that one bad scan script cannot stop the rest. Nothing is returned to a caller here, so the outcome is
// logged: the row it writes is the durable record.
(function runScheduledSearchHealthScan() {
	var summary = new SearchHealthMetricOrchestrator().runAll();

	if (!summary) {
		gs.error('Search health: the scheduled scan returned nothing, so no run was recorded. A call to a '
			+ 'method the orchestrator does not define yields undefined rather than throwing, so the likely '
			+ 'cause is a renamed entry point.');
		return;
	}

	if (summary.error) {
		gs.error('Search health: the scheduled scan did not complete: ' + summary.error);
		return;
	}

	gs.info('Search health: the scheduled scan ran ' + summary.definitionsRun + ' metric definition(s) and '
		+ 'recorded itself on scan job ' + summary.scanJobId + '.');
})();
