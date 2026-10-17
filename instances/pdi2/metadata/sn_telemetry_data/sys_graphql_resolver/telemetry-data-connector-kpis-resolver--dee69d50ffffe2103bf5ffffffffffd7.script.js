(function process(/*ResolverEnvironment*/ env) {
	// Need at least one of these roles to get KPIs
	if (!gs.hasRole('sn_telemetry_data.observability_metric_viewer')) {
		return [];
	}

	var searchQuery = env.getArguments()['searchQuery'];

	var kpis = [
		{
			id: "metrics",
			name: gs.getMessage("Metrics")
		}
	];

	// Apply search query on results
	if (searchQuery) {
		kpis = kpis.reduce(function(acc, kpi, index) {
			if (kpi.name.toLowerCase().indexOf(searchQuery) !== -1) {
				acc.push(kpi);
			}

			return acc;
		}, []);
	}

	// Sort by name (localeCompare is not supported on ES5)
	return kpis.sort(function(a, b) {
		if (a.name.toLowerCase() < b.name.toLowerCase()) {
			return -1;
		}

		if (a.name.toLowerCase() > b.name.toLowerCase()) {
			return 1;
		}

		return 0;
	});
})(env);
