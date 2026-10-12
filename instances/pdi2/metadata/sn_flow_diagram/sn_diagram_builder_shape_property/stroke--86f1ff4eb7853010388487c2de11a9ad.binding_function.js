function getBinding(go, source, target, dispatch, resolveThemeVariable) {
    return new go.Binding(target, "", function(graphObject) {
        var primary1 = resolveThemeVariable("--now-color--primary-1") || "#4C6CEB";
        var bgPrimary = resolveThemeVariable("--now-color_background--primary") || "#FFFFFF";

        var showNodeHighlight = graphObject?.data?.showNodeHighlight;

        if (showNodeHighlight && (graphObject.isSelected || graphObject.data.isSelected)) {
            graphObject.data.highlightMissingInputs = false;
            return primary1;
        } else if (graphObject.isHighlighted) {
            return primary1;
        } else {
            var bgRect = graphObject.part.findObject('bgRectangle');
            if (bgRect) {
                if (graphObject.data.hasMissingMandatoryInputs && graphObject.data.highlightMissingInputs) {
                    return resolveThemeVariable("--now-color_alert--critical-3") || "#B61C2D";
                } else if (bgRect.fill) {
                    return bgRect.fill;
                } else {
                    return bgPrimary;
                }

            } else {
                return bgPrimary;
            }
        }
    }).ofObject();
}
