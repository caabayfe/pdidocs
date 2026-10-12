function getValue(go, dispatch, $, shapeTemplateUtilities, resolveThemeVariable) {
    return function(e, obj, prev) {
        var parentNode = obj.part.findObject('flowLogicParentNode');
        if (parentNode) {
            parentNode.shadowOffset = new go.Point(0, 2);
            parentNode.shadowBlur = 4;
        }

        var bgRect = obj.part.findObject('bgRectangle');
        if (bgRect) {
            bgRect.stroke = resolveThemeVariable('(--now-color_border--secondary') || "#A9B2B7";
        }

        var contextMenu = obj.part.findObject('rightContextMenu');
        if (contextMenu) contextMenu.visible = true;
    };
}
