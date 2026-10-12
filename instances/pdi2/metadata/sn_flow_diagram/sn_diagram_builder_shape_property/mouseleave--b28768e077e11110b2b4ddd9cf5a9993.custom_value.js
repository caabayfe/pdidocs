function getValue(go, dispatch, $) {
    return function(e, obj, prev) {
        var parentNode = obj.part.findObject('flowLogicParentNode');
        if (parentNode) {
            parentNode.shadowOffset = new go.Point(0, 1);
            parentNode.shadowBlur = 2;
        }

        if (!obj.part.isSelected) {
            var bgRect = obj.part.findObject('bgRectangle');
            if (bgRect) {
                bgRect.stroke = bgRect.fill;
            }
        }

        var contextMenu = obj.part.findObject('rightContextMenu');
        if (contextMenu) contextMenu.visible = false;
    };
}
