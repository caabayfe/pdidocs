function getBinding(go, source, target, dispatch, resolveThemeVariable) {
    return new go.Binding(target, source, function(h) {
        return h ? resolveThemeVariable('--now-color_grouped--yellow-1') : resolveThemeVariable('--now-color_border--tertiary');
    }).ofObject();
}
