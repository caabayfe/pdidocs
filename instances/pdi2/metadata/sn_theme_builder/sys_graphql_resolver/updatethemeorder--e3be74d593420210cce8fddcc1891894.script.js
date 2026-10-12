(function process( /*ResolverEnvironment*/ env) {
    return ThemeRepository.triggerUpdateThemeOrder(env.getArguments().themeId, env.getArguments().order);
})(env);
