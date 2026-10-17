function getValue(go, dispatch, $, shapeTemplateUtilities, resolveThemeVariable) {
    return function(e, obj) {
        const diagram = e.diagram;
        //Avoid D&D if the diagram is ReadOnly
        if (diagram.model.modelData._isReadOnly) return;
        const nodeSelected = diagram.selection.first();
        //Avoid D&D if there are children for the dropping node or link.
        if ((nodeSelected instanceof go.Link) || ((nodeSelected instanceof go.Node) && nodeSelected.linksConnected?.count > 0))
            return;

        var additionalDropProps = {
            target: obj,
        };
        dispatch("GO_DIAGRAM#DROP_ON_NODE_OR_LINK_REQUESTED", {
            event: e,
            obj: obj,
            isNode: true,
            additionalDropProps: additionalDropProps,
        });
    };
}
