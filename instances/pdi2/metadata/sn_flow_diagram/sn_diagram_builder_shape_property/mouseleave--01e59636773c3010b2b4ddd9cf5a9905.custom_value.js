function getValue(go, dispatch, $) {
    return function(e, obj, prev) {
        var showNodeHighlight = obj?.part?.data?.showNodeHighlight;


        if (showNodeHighlight) {
            var parentNode = obj.part.findObject('flowActionParentNode');
            if (parentNode) {
                parentNode.shadowOffset = new go.Point(0, 1);
                parentNode.shadowBlur = 2;
            }
        }


        var shape = obj.part.findObject('rightContextMenu');
        if (shape) shape.visible = false;
    };
}
