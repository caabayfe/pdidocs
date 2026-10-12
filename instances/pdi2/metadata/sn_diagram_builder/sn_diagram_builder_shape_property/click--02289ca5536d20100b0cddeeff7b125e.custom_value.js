function getValue(go, dispatch, $) {
    return function(e, menuButton) {
		e.diagram.commandHandler.showContextMenu(menuButton.part);
		e.handled = true;
    };
}
