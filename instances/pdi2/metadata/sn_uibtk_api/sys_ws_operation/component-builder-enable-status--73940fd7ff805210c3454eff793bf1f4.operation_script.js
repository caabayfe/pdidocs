(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	const sysPropertyGr = new GlideRecord('sys_properties');
	// matches name
	sysPropertyGr.addQuery('name', 'CONTAINS', 'uib.enable.cb');
	// matches scope
	sysPropertyGr.addQuery('sys_scope.sys_id', 'IN', 'e9b68250cdffe4e1c64e494026ec6e9a,5eff1dd0c1153209fa3a662cd38a2479');
	// is actually enabled
	sysPropertyGr.addQuery('value', 'true');
	sysPropertyGr.query();

	// if it exists, Component Builder is enabled
	return !!(sysPropertyGr.next());
})(request, response);
