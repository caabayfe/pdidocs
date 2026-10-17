function getValue(go, dispatch, $) {
    return function(e, menuButton) {
        if(menuButton?.part?.data?.showContextMenu) {
            e.diagram.commandHandler.showContextMenu(menuButton.part);
        }
    };
}
