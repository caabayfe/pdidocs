(function process(/*ResolverEnvironment*/ env) {
	var encodedQuery = env.getArguments().encodedQuery;
	var start = env.getArguments().start;
	var pageSize = env.getArguments().pageSize;
    return ThemeRepository.getAllThemes(encodedQuery, start, pageSize);
})(env);
