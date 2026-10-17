function getValue(go, dispatch, $, shapeTemplateUtilities, resolveThemeVariable) {
    return function(e, obj, prev) {
        var rectST = obj.part.findObject('groupPlaceholder');
        var modelData = e.diagram.model.modelData;

        if (rectST && !modelData._isPaletteNode && !modelData._isReadOnly && modelData._isDragAndDropEnabled) {
            // Get the dragged parts from diagram
            const draggingTool = e.diagram.toolManager.draggingTool;
            const draggedParts = draggingTool.draggedParts || draggingTool.copiedParts;
            var skipHighlight = false;
            // Iterate over the dragged parts to find if the dragged part is a link or a node and if it is already connected and if the node belongs to the same group.
            draggedParts.each(function(part) {
                var draggedPart = part.key;
                if (draggedPart instanceof go.Link || draggedPart.linksConnected?.count > 0 || (draggedPart.data.group && draggedPart.data.group === e.targetObject.part.data.key)) {
                    // Prevent the drag enter from proceeding if the part is already in the group OR part is linked OR is part is link
                    skipHighlight = true;
                    return;
                }
            });
            if (!skipHighlight) {
                rectST.fill = resolveThemeVariable('--now-color_grouped--green-yellow-2');
            }
        }
    };
}
