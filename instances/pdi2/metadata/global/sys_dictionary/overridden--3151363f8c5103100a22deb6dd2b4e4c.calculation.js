(function calculatedFieldValue(current) {  
	var overridesGr = new GlideRecord("ua_tablestats_override");  
	overridesGr.addQuery("definition_id", current.definition_id);  
	overridesGr.addQuery("type", "stats_definition");  
	overridesGr.query();   
	if (!overridesGr.next())   
		return false;
	  // Only apply the overridden table stats if original table stats is active or if it's disabled by the system.  
	if (current.active == true || (current.active == false && current.sys_updated_by == "system"))  
		return true;  
	
	return false;
})(current);
