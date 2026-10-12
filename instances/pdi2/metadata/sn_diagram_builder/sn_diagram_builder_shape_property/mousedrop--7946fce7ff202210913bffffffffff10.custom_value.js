function getValue(go, dispatch, $, shapeTemplateUtilities, resolveThemeVariable) {
    return function(e, obj) {
        const diagram = e.diagram;
        //Avoid D&D if the diagram is ReadOnly
        if (diagram.model.modelData._isReadOnly) return;
        const nodeSelected = diagram.selection.first();
        //Avoid D&D if there are children for the dropping node or link.
        if ((nodeSelected instanceof go.Link) || ((nodeSelected instanceof go.Node) && nodeSelected.linksConnected?.count > 0))
            return;

        dispatch("GO_DIAGRAM#DROP_ON_NODE_OR_LINK_REQUESTED", {
            event: e,
            obj: obj,
            isNode: true,
        });
        setTimeout(function() {
            if (typeof obj.mouseEnter === "function") {
                //Trigger the mouseEnter handler to update adornment properties
                obj.mouseEnter(e, obj);
            }
        }, 25);
    };
}
