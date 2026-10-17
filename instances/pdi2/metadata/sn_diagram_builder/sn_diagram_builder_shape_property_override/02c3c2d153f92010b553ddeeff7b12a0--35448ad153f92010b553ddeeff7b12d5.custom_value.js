function getValue(go, dispatch, $) {
    function scrollToFocusedObject(group) {
            const focusObj = group.diagram?.commandHandler?.focus;
            if (focusObj) {
                group.diagram.scrollToRect(focusObj.getDocumentBounds());
            }
    }
    return function(e, tb) {
        const group = tb.part;

        if (group.isSubGraphExpanded) {
            group.diagram.commandHandler.collapseSubGraph(group);
        } else {
            group.diagram.commandHandler.expandSubGraph(group);
        }
        scrollToFocusedObject(group);

        setTimeout(function() {
            // Clear selection and hover from the clicked group inner parts.
            group.memberParts.each(part => {
                if (part.findAdornment("mouseEnter")) {
                    part.removeAdornment('mouseEnter');
                }
            });
            if (typeof group.mouseEnter === "function") {
                //Trigger the group's mouseEnter handler to update adornment properties
                group.mouseEnter(e, tb);
            }
        }, 0);
    };
}
