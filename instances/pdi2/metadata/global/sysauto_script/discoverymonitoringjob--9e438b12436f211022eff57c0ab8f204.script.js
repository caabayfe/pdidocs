var staleCheckSeconds = DiscoveryStatusMonitor.config.staleCheckSeconds || (new GlideDateTime(current.run_period).getNumericValue() / 1000) * 2;
DiscoveryStatusMonitor.findAndHandlePotentialStuckStatuses(staleCheckSeconds);
