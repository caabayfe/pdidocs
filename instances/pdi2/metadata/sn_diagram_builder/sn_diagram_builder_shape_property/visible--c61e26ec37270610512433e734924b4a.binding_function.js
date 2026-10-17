function getBinding(go, source, target, dispatch, resolveThemeVariable, customProps) {
    return new go.Binding(target, source, function(loaderState) {
        return customProps.hasOwnProperty(loaderState);
    });
}
