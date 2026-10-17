
            
            (function process( /*ResolverEnvironment*/ env) {
                var themeId = env.getSource();
                if (themeId && !ThemeRepository.isThemeReadOnly(themeId)) {
                    var theme = ThemeRepository.getCustomizationGR(themeId);
                    if (theme === null || theme === '')
                        return false;
                }
                return true;
            })(env);
