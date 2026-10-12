function onCondition() {
 g_form.setReadonly("hierarchy_level",true);
	g_form.setReadonly("leaf_node",true);
	// we wrote a display br to get the system property for "use_business_capability_custom_hierarchy_id"
	
	// set hierarchy_id field to be readonly depending  on isCustomHierarchyIdPropertySet
	// if the property is set(true) then it means that customer want to put hierarchy ids in that case we should not make it read only
	// else if the property is not set or the property does not exist then we should make it read only.
	
	var isCustomHierarchyIdPropertySet = g_scratchpad.use_business_capability_custom_hierarchy_id;
	
	if(isCustomHierarchyIdPropertySet != "true")
			g_form.setReadOnly("hierarchy_id", true);
}
