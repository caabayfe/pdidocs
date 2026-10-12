(function process(/*ResolverEnvironment*/ env) {
	// Need at least one of these roles to get KPIs
	if (!gs.hasRole('analytics_admin,analytics_viewer')) {
		return [];
	}

	var searchQuery = env.getArguments()['searchQuery'];

	var kpis = [
		{
			id: "events",
			name: gs.getMessage("Events")
		},
		{
			id: "sessions",
			name: gs.getMessage("Sessions")
		},
		{
			id: "users",
			name: gs.getMessage("Users")
		},
		{
			id: "pages",
			name: gs.getMessage("Pages")
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
