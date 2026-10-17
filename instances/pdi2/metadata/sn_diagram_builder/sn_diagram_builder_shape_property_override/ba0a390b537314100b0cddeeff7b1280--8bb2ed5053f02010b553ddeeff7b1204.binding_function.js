function getBinding(go, source, target, dispatch, resolveThemeVariable) {
    return new go.Binding(target, source, function(h) {
        return h ? resolveThemeVariable("--now-highlighted-value--tertiary_green--background-color") : resolveThemeVariable("--now-card--border-color");
    }).ofObject();
}
