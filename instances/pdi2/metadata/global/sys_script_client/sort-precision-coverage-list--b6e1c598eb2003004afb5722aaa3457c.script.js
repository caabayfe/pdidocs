function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	//Does not work is you use onLoad, presumably it runs before the related list was available.
   if (!isLoading)
      return;
	
	// set "Class Level Statistics" tab as active 
	g_tabs2Sections.setActive(1);
	
	var relatedList = GlideList2.get(g_form.getTableName() + '.ml_pc_lookup.class_name');	
	if (relatedList)
		relatedList.sortDescending('precision');
}
