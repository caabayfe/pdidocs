function getValue(go, dispatch, $, shapeTemplateUtilities, resolveThemeVariable) {
    return function(e, obj, prev) {
        var parentNode = obj.part.findObject('flowStageParentNode');

        if (parentNode) {
            parentNode.shadowOffset = new go.Point(0, 2);
            parentNode.shadowBlur = 4;
        }

        var bgRect = obj.part.findObject('bgRectangle');
        if (bgRect) {
            if (bgRect.stroke !== (resolveThemeVariable("--now-color_alert--critical-1") || "#EE7482")) {
                bgRect.stroke = resolveThemeVariable("--now-color_grouped--yellow-2") || "#FFC651";
            }
        }

        // Show the stage close button
        var stageCloseObj = obj.part.findObject('flowStageClose');
        if (stageCloseObj) {
            stageCloseObj.visible = true;
        }

        // Shorten the stage label width
        var stageNameObj = obj.part.findObject('stageNameContainer');
        if (stageNameObj) {
            var stageCloseIconObj = stageCloseObj.findObject('flowStageCloseIcon');
            var maxWidth = 260;
            if (stageCloseIconObj) {
                maxWidth -= stageCloseIconObj.width;
            }
            stageNameObj.maxSize = new go.Size(maxWidth, 18);
        }
        var stageContentPanelObj = obj.part.findObject('stageContentPanel');
        if (stageContentPanelObj) {
            stageContentPanelObj.width = 240;
        }
    };
}
