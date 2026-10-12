(function refineQuery(current, parent) {

	var licFamilyUtils = new LicFamilyUtils();
	var appids = licFamilyUtils.getStoreAppIDs(parent.lineage_id);

	current.addQuery("app_id", appids);
	current.addQuery("app_family_id.lineage_id", parent.lineage_id);

})(current, parent);
