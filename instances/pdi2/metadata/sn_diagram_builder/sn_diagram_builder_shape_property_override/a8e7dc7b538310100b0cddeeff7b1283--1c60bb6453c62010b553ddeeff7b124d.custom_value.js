function getValue(go, dispatch, $, shapeTemplateUtilities, resolveThemeVariable) {
    var forcedColorsDarkTheme = window.matchMedia('(forced-colors)').matches && window.matchMedia('(prefers-color-scheme: dark)');
    return forcedColorsDarkTheme ? 'GrayText' : resolveThemeVariable('--now-color_text--primary');
}
