(function process(/*ResolverEnvironment*/ env) {

    // implement data resolver here
	return ThemeRepository.updateGroupName(env.getArguments().themeId, env.getArguments().groupName);

})(env);
