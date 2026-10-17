function getBinding(go, source, target, dispatch, resolveThemeVariable) {
    return new go.Binding(target, source, function(currentFocusOn){
        if(currentFocusOn == "replaceNodeButton"){
           const themeColor = resolveThemeVariable('--now-color--primary-1');
           return themeColor;
        }
        return null;
    });
}
