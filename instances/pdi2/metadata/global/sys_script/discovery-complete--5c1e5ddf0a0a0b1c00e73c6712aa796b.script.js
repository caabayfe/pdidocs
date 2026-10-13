checkComplete();

function checkComplete() {
	// When optimized counting is active, DiscoveryStatusMonitor is the sole authority
	// for completing the status. Skip this BR to prevent premature completion caused by
	// counter inflation from duplicate IP processing or other unsynchronized paths.
	if (current.scratchpad && current.scratchpad.isOptimizedCounting)
		return;

	if (DiscoveryStatus.isStatusWaitingForDependency(current))
		return;

	var dp = new DiscoveryPhaser(current);
	if (!dp.hasNextPhase()) {
		if (current.state == 'Canceled')
			return;

		gs.eventQueue('discovery.phase.complete', current);
		current.state = 'Completed';
	}
}
