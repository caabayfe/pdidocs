function updateNavigationFieldLabels() {
	gs.info("Field labels update for `sys_sg_navigation` has started");
	var sysDictGr = new GlideRecord('sys_dictionary');
	sysDictGr.addQuery("name", "sys_sg_navigation");
	sysDictGr.addQuery("element", ["color", "quick_actions_menu_color"]);
	sysDictGr.query();
	
	while (sysDictGr.next()) {
		if (sysDictGr.getValue('column_label') === 'Color')
			sysDictGr.setValue("column_label", "Legacy Color");
		else if (sysDictGr.getValue('column_label') === 'Quick Actions Menu Color')
			sysDictGr.setValue('column_label', "Legacy Quick Actions Menu Color");
		sysDictGr.update();
	}
	gs.info("Field labels update for `sys_sg_navigation` has ended");
}

updateNavigationFieldLabels();
