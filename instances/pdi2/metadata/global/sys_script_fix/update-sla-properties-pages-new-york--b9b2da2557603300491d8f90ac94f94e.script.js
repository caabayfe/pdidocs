(function() {
	var engineVersion = "2010";
	var propertyGr = new GlideRecord('sys_properties');
	if (propertyGr.get("6d2b60427f0000016a7ec9e914cc4cee"))
		engineVersion = propertyGr.getValue("value");

	SLAProperties.updatePropertiesModules(engineVersion);	
})();
