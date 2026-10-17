function sys_sg_master_item_tableGetChoices() {
	if (current.screen == null || current.screen.data_item == null || current.screen.data_item.table == null)
		return;

    var table = current.screen.data_item.table;
	var getTables = new InheritedTablesUtils();
	var values = getTables.getInheritedTables(table);
	for (var key in values)
		if (values[key].hasOwnProperty('table_name') && values[key].hasOwnProperty('label'))
			answer.push(values[key].table_name, values[key].label);
}
