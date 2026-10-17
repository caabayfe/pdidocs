function getValue(go, dispatch, $, shapeTemplateUtilities, resolveThemeVariable) {
   return function(e) {
        dispatch("GO_DIAGRAM#DROP_ON_CANVAS_REQUESTED", {
            event: e,
        });
    };
}
