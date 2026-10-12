(function process(/*ResolverEnvironment*/ env) {
			var themeId = env.getArguments().id || env.getSource();
			if(!themeId) return null;
			return ThemeRepository.getMobileThemeGlideRecord(themeId);
		})(env);
