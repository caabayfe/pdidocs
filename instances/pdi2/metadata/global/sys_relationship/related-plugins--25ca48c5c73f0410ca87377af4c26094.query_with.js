(function refineQuery(current, parent) {

	// Add your code here, such as current.addQuery(field, value);
	var licFamilyUtils = new LicFamilyUtils();
	var appids = licFamilyUtils.getAppIDs(parent.family_id);

	current.addQuery('id', appids);
	current.orderBy('name');


})(current, parent);
