(function process(/*ResolverEnvironment*/ env) {
  return ThemeRepository.deleteTheme(env.getArguments().deleteThemeInput);
})(env);
