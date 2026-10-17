(function process(/*ResolverEnvironment*/ env) {
  return ThemeRepository.createTheme(env.getArguments().createThemeInput);
})(env);
