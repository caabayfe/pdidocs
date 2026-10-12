(function process(/*ResolverEnvironment*/ env) {
	var companyId = env.getArguments().companyId;
	return ThemeRepository.getCompanyUILogosrc(companyId);
})(env);
