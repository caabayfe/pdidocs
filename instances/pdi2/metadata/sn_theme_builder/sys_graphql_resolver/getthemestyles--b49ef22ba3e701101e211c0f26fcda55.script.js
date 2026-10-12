(function process(/*ResolverEnvironment*/ env) {

	var themeId = env.getSource();
	return ThemeRepository.getThemeStyles(themeId);

})(env);
