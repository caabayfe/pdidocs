function getValue(go, dispatch, $) {
    return function(e, menuButton) {
        if(menuButton?.part?.data?.showContextMenu) {
            // hide any new-instance-wizard popover
            dispatch("FLOW_DIAGRAM#NEW_ACTION_TYPE_CANCELED");
            e.diagram.commandHandler.showContextMenu(menuButton.part);
        }
    };
}
