function getBinding(go, source, target, dispatch, resolveThemeVariable) {
    return new go.Binding(target, source, function(currentFocusOn) {
        if (currentFocusOn == "colorPicker") {
            return resolveThemeVariable('--now-color--primary-1');
        }
        return null;
    });
}
