(function process(/*ResolverEnvironment*/ env) {
    return ThemeRepository.getAllThemeNames(env.getArguments().encodedQuery);
})(env);
