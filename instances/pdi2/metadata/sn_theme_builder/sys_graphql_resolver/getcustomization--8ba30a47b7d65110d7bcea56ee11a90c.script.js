(function process( /*ResolverEnvironment*/ env) {
    var themeId = env.getArguments().themeId || env.getSource();
    return ThemeRepository.getCustomization(themeId);
})(env);
