function getValue(go, dispatch, $, shapeTemplateUtilities, resolveThemeVariable) {
    return function(e, obj) {
        var node = obj.part;
        node.removeAdornment('mouseEnter');
    };
}
