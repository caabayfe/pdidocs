function getBinding(go, source, target, dispatch, resolveThemeVariable) {
    return new go.Binding("fill", "", function(node) {
        // 1. If color picker has set a background
        if (node.data && node.data.background) {
            return node.data.background;
        }
        // 2. Otherwise fall back to highlight
        return node.isHighlighted ?
            resolveThemeVariable("--now-color_grouped--yellow-1") :
            resolveThemeVariable("--now-color_background--primary");
    }).ofObject();
}
