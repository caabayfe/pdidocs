// See DiscoveryCimClassificationSensor._runOnClassificationScript for a
// description of how this function is used.
/*
 * Set values in _discoveryData based on 'name' to signal which
 * exploration probes should be triggered.
 * Also check for the existance of the 'fileExport' subprofile in
 * the results.  This indicates that the SMI-S server supports the
 * profile and we can trigger the fileshares probe without
 * generating warnings.
 * Return 'true' for all names except fileExport to indicate that
 * the uniqueInstance should be explored as a storage server.
 */
function classify(name, instance, queries, uniqueInstance) {

	uniqueInstance._discoveryData.className = instance._classname;

	if (name == 'nasHeadSystems')
		uniqueInstance._discoveryData.isNAS = true;
	else if (name == 'arraySystems' || name == 'storageVirtualizer')
		uniqueInstance._discoveryData.isArray = true;

	// Check all query results to see if the fileExport profile is
	// supported.
	var hasExport = queries.fileExport && queries.fileExport.result;
	hasExport = hasExport && hasExport.instance && hasExport.instance.length;
	uniqueInstance._discoveryData.hasFileExport = !!hasExport;

	// The 'fileExport' query is simply checking for the existence of the profile -
	// there's no object to explore in this case.
	if (name != 'fileExport')
		return true;
}
