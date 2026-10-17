(function process( /*ResolverEnvironment*/ env) {
    return ThemeRepository.publishTheme(env.getArguments().themeId, env.getArguments().newOrder);
})(env);
