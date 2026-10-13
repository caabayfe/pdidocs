var counters = DiscoveryStatusMonitor.calculateCountersForStatus(current);
DiscoveryStatus.setCountersForStatus(counters.started, counters.completed, current);
