function getValue(go, dispatch, $, shapeTemplateUtilities, resolveThemeVariable) {
    //Recursively bringing up the Group and its children to "Foreground" layer
    function changeLayer(group, newlayer) {
        if (group.containingGroup) {
            changeLayer(group.containingGroup, newlayer)
            group.containingGroup.memberParts.each(function(memberPart) {
                //Preventing current member to be added with siblings as it needs to stay on top of siblings
                if (group.key !== memberPart.key) {
                    if (memberPart instanceof go.Group) {
                        memberPart.findSubGraphParts().each((siblingPart) => {
                            siblingPart.layerName = newlayer;
                        });
                    }
                    //Adding the current member at the end so it stays on top of siblings
                    memberPart.layerName = newlayer;
                }
            });
            //Adding Group to the "Foreground" layer
            group.layerName = newlayer;
        } else {
            group.layerName = newlayer;
        }
    }
    return group => {
        var newlayer = group.isSelected ? "Foreground" : "";
        changeLayer(group, newlayer);
        group.findSubGraphParts().each((memberPart) => {
            memberPart.layerName = newlayer;
        });
    };
}
