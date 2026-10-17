function getValue(go, dispatch, $, shapeTemplateUtilities, resolveThemeVariable) {
    //Recursively bringing up the node and if Group its children to "Foreground" layer
    function changeLayer(node, newlayer) {
        if (node.containingGroup) {
            changeLayer(node.containingGroup, newlayer)
            node.containingGroup.memberParts.each(function(memberPart) {
                //Preventing current member to be added with siblings as it needs to stay on top of siblings
                if (node.key !== memberPart.key) {
                    if (memberPart instanceof go.Group) {
                        memberPart.findSubGraphParts().each((siblingPart) => {
                            siblingPart.layerName = newlayer;
                        });
                    }
                    //Adding the current member at the end so it stays on top of siblings
                    memberPart.layerName = newlayer;
                }
            });
            //Adding node to the "Foreground" layer
            node.layerName = newlayer;
        } else {
            node.layerName = newlayer;
        }
    }

    return node => {
        var newlayer = node.isSelected ? "Foreground" : "";
        if (node.containingGroup) {
            changeLayer(node, newlayer);
        } else {
            node.layerName = newlayer;
        }
    };
}
