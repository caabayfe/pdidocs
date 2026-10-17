function updateSearchContextConfigLabel () {
	var dict = new GlideRecord("sys_dictionary");
		dict.addQuery("name", "sys_sg_global_search");
		dict.addQuery("column_label", "Search Context Configuration");
		dict.addQuery("element", "search_context_config");
		dict.setLimit(1);
		dict.query();
		while(dict.next()) {
			dict.setValue("column_label", "Search Application Configuration");
			if (dict.update())
				gs.info("updated dictionary sys_sg_global_search.search_context_config column_label to Search Application Configuration");
			else
				gs.error("failed to update dictionary sys_sg_global_search.search_context_config column_label to Search Application Configuration");
		}
}
updateSearchContextConfigLabel();
