var VATelemetryTraceSamplingHelper = Class.create();

VATelemetryTraceSamplingHelper.enableOrDisableSampling = function() {
	try {
		sn_cs_commons.TraceSamplingHelper.clearCaches();
	} catch(error) {
		gs.error('Error clearing caches: ' + error);
	}
};
