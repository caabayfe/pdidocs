(function process(/*ResolverEnvironment*/ env) {

	var uploadCustomFontsInput = env.getArguments().uploadCustomFontsInput;
	return ThemeRepository.uploadCustomFonts(uploadCustomFontsInput);

})(env);
