function getValue(go, dispatch, $) {
    return function(e, obj, prev) {
        var parent = obj.part.findObject('flowTryParentNode');
        if (!parent || !parent.isSelected) {
            obj.background = 'rgb(233, 225, 241)';
        }
        var shape = obj.part.findObject('rightContextMenu');
        if (shape) shape.visible = false;
    };
}
