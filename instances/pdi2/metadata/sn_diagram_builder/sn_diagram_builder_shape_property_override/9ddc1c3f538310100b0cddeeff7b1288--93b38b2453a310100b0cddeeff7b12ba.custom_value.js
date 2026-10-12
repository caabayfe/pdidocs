function getValue(go, dispatch, $, shapeTemplateUtilities, resolveThemeVariable) {
    var forcedColorsDarkTheme = window.matchMedia('(forced-colors)').matches && window.matchMedia('(prefers-color-scheme: dark)');
    return forcedColorsDarkTheme ? 'ButtonText' : resolveThemeVariable('--now-color_grouped--teal-2');
}
