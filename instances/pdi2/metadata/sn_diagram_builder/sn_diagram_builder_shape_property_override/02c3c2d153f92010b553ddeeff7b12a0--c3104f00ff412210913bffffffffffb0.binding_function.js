function getBinding(go, source, target, dispatch, resolveThemeVariable) {
    
    return new go.Binding(target, source, function(currentFocusOn){
        if(currentFocusOn == "showHideLink"){
            const themeColor = resolveThemeVariable("--now-color_background--secondary-actionable", false);
            const themeColorWithOpacity = "rgba(" + themeColor + ",0.25)";
            return themeColorWithOpacity;
        }
        return null;
    });
}
