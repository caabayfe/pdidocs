function getMobileLayoutCatalogs(current_catalog) {
	var ignore = "";
	var layout = new GlideRecord("sc_mobile_layout");
    layout.query();
	while(layout. next()) {
		if (ignore.length > 0) 
			ignore += ",";
		ignore += layout.sc_catalog;
	}
	var list = "";
	var catalog = new GlideRecord("sc_catalog");
	catalog.addActiveQuery();
	catalog.query();
	while(catalog.next()) {
		if (ignore.indexOf(catalog.sys_id) == -1 || catalog.sys_id == current_catalog) {
			if (list.length > 0) 
				list += ",";
			list += catalog.sys_id;
		}	
	}
	return list;
}
