// See DiscoveryCimClassificationSensor._runOnClassificationScript for a
// description of how this function is used.
// Return 'true' to indicate that the uniqueInstance should be explored as
// a WBEM service.
function classify(name, instance, queries, uniqueInstance) {
	return true; // pass all results back to classifier as valid
}
