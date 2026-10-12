function getValue(go, dispatch, $) {
    return function(e, obj, prev) {
        var parent = obj.part.findObject('flowTryParentNode');
        if (!parent || !parent.isSelected) {
            obj.background = 'rgb(204, 186, 222)';
        }
        var shape = obj.part.findObject('rightContextMenu');
        if (shape) shape.visible = true;
    };
}
