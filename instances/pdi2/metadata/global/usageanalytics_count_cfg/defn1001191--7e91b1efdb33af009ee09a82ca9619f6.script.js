var build, rollUpEnabled, indEnabled;
answer = JSON.stringify(buildSlowProbeJSON());

function buildSlowProbeJSON() {
	var result = {};
	var buildTag, buildDate;

	// Find buildTag
	var reusedGr = new GlideRecord('sys_properties');
	reusedGr.query('name', 'glide.buildtag.last');
	if (reusedGr.next())
		buildTag = reusedGr.getValue('value');
	
	// Find buildDate
	reusedGr = new GlideRecord('sys_properties');
	reusedGr.query('name', 'glide.builddate.last');
	if (reusedGr.next())
		buildDate = reusedGr.getValue('value');

	// Return empty result if build/version not found
	if (buildTag && buildDate)
		build = buildTag + '_' + buildDate;
	else
		return result;
	
	// Find rollup-by-build toggle
	reusedGr = new GlideRecord('sys_properties');
	reusedGr.query('name', 'glide.discovery.perf.metrics.rollup_by_build');
	if (reusedGr.next())
		rollUpEnabled = reusedGr.getValue('value');

	// Find Individual Metric toggle
	reusedGr = new GlideRecord('sys_properties');
	reusedGr.query('name', 'glide.discovery.perf.metrics.enable_collection');
	if (reusedGr.next())
		indEnabled = reusedGr.getValue('value');

	// If rollup-by-build exists, we try the rollup-by-build table
	if (rollUpEnabled)
		useRollUpTable(result);

	// Extra fields added to resulting JSON if populated
	if (result['count'] >= 0) {
		result['current_build_version'] = build;
		result['glide.discovery.perf.metrics.rollup_by_build'] = rollUpEnabled;
		result['glide.discovery.perf.metrics.enable_collection'] = indEnabled;
	}
	
	return result;
}

function useRollUpTable(result) {
	if (!GlideTableDescriptor.isValid('discovery_perf_metric_probe_sensor_rollup_by_build'))
		return result;
	
	var arrayOfMappings = [];
	var i = 1;
	
	var rollUpGr = new GlideRecord('discovery_perf_metric_probe_sensor_rollup_by_build');
	// Do not include 'Horizontal Pattern'
	rollUpGr.addQuery('probe', '!=', '4f64c6389f230200fe2ab0aec32e7068');
	rollUpGr.addQuery('build_version', build);
	rollUpGr.orderByDesc('probe_time_average');
	rollUpGr.setLimit(10);
	rollUpGr.query();
	while(rollUpGr.next()) {
		arrayOfMappings.push({
			probe: {
					name: rollUpGr.getDisplayValue('probe'),
					sys_id: rollUpGr.getValue('probe'),
					ecc_queue_topic: rollUpGr.getValue('ecc_queue_topic'),
					ecc_queue_name: rollUpGr.getValue('ecc_queue_name')
					},
			avg_time_ms: parseFloat(rollUpGr.getValue('probe_time_average')),
			rank: i++
		});
	}
	
	result['avg_slowest_probes_in_current_build'] = arrayOfMappings;
	result['count'] = arrayOfMappings.length;
}
