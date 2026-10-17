function getValue(go, dispatch, $, shapeTemplateUtilities, resolveThemeVariable) {
    return function(e, obj) {
        e.handled = true;
        dispatch("GO_DIAGRAM#DROP_ON_NODE_OR_LINK_REQUESTED", {
            event: e,
            obj: obj.part,
            isNode: true,
            additionalDropProps: {
                obj: obj
            }
        });
    };
}
