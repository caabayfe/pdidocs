(function executeRule(current, previous /*null when async*/) {
	var parentMenuItem = current.getValue('sp_rectangle_menu_item');

	if (parentMenuItem) {
		var menuItemGR = new GlideRecord('sp_rectangle_menu_item');
		if (menuItemGR.get(parentMenuItem)) {
			if(menuItemGR.type == 'filtered' || menuItemGR.type == 'scripted') {
				gs.addErrorMessage(gs.getMessage('Filtered/Scripted menu items cannot have sub-menu items.'));
				current.setAbortAction(true);
			}
		}
	}

})(current, previous);
