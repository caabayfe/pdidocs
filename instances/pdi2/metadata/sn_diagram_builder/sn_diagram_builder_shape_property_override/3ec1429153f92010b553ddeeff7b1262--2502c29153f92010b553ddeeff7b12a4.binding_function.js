function getBinding(go, source, target, dispatch, resolveThemeVariable) {
    return new go.Binding(target, source, function(exp) {
        return exp ? resolveThemeVariable("--now-color_background--secondary") : resolveThemeVariable("--now-color_background--primary");
    }).ofObject();
}
