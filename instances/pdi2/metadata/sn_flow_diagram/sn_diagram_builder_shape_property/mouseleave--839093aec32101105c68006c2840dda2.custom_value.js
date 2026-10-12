function getValue(go, dispatch, $, shapeTemplateUtilities, resolveThemeVariable) {
    return function(e, obj, prev) {
        var parentNode = obj.part.findObject('flowActionParentNode');

        if (parentNode) {
            parentNode.shadowOffset = new go.Point(0, 1);
            parentNode.shadowBlur = 2;
        }

        if (!obj.part.isSelected) {
            var bgRect = obj.part.findObject('bgRectangle');
            if (bgRect) {
                if (bgRect.stroke !== (resolveThemeVariable("--now-color_alert--critical-1") || "#EE7482")) {
                    bgRect.stroke = resolveThemeVariable("--now-color_grouped--yellow-1") || "#F5E09B";
                }
            }
        }

        // Hide the stage close button
        var stageCloseObj = obj.part.findObject('flowStageClose');
        if (stageCloseObj) {
            stageCloseObj.visible = false;
        }

        // Restore the stage label width
        var stageNameObj = obj.part.findObject('stageNameContainer');
        if (stageNameObj) {
            stageNameObj.maxSize = new go.Size(265, 18);
        }
        var stageContentPanelObj = obj.part.findObject('stageContentPanel');
        if (stageContentPanelObj) {
            stageContentPanelObj.width = 265;
        }
    };
}
