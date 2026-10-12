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
            isNode: false,
            isLink: true,
        });
        setTimeout(function() {
            const groupNode = obj.fromNode?.containingGroup;
            //Checking if it's a group node and has a 'mouseEnter' adornment
            if (groupNode?.findAdornment?.("mouseEnter")) {
                // Remove the adornment to clear the group outline or hover effect
                groupNode.removeAdornment("mouseEnter");
                groupNode.mouseEnter("", groupNode);
            }
        }, 50);
    };
}
