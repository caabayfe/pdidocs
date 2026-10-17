/**
 * Monthly Breakdown of 10 Slowest Average Pattern Execution Times in Current Build
 *
 * Steps to Build JSON:
 * 1) Find all MultiPage Patterns and aggregate them
 *     (ex. "Pattern Launcher: Solaris Server - MultiPage 1 of xx")
 * 2) Find Patterns that match any Patterns found in Step 1 and aggregate them
 *     (ex. "Pattern Launcher: Solaris Server")
 * 3) Find the slowest average Patterns that are not MultiPage Patterns
 *     (i.e. Exclude anything found in Step 1 and 2)
 * 4) Add the aggregated MultiPage Patterns from Step 2 to the slowest average
 *     Patterns from Step 3
 * 5) Sort the list by slowest, splice it to 10, and add rank
 */

var build, rollUpEnabled, indEnabled;
var MULTI_PAGE_PATT = /(.+?) - MultiPage .+/;
var PATTERN_NAME_PATT = /Pattern Launcher: (.+)/;
var HORIZONTAL_PATTERN_SYS_ID = '4f64c6389f230200fe2ab0aec32e7068';

answer = JSON.stringify(buildSlowPatternJSON());

function buildSlowPatternJSON() {
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
	var multiPageMap = {};
	var stringOfMultiPagePatts = "";

	var multiPageGr = new GlideRecord('discovery_perf_metric_probe_sensor_rollup_by_build');
	multiPageGr.addQuery('build_version', build);
	// Only 'Horizontal Pattern'
	multiPageGr.addQuery('probe', HORIZONTAL_PATTERN_SYS_ID);
	// Get every unique MultiPage record
	multiPageGr.addQuery('ecc_queue_name', 'CONTAINS', ' - MultiPage 1 of');
	multiPageGr.query();
	while(multiPageGr.next()) {
		// e.g. extract 'Pattern Launcher: Tomcat' from 'Pattern Launcher: Tomcat - MultiPage 1 of 14'
		var match = MULTI_PAGE_PATT.exec(multiPageGr.getValue('ecc_queue_name'));
		if (!match)
			continue;
		
		// Find all MultiPage patterns and aggregate them
		var probeTimeCount = parseInt(multiPageGr.getValue('probe_time_count'));
		var probeTimeAverage = parseFloat(multiPageGr.getValue('probe_time_average'));
		var patternName = match[1];
		if (!multiPageMap[patternName]) {
			multiPageMap[patternName] = {
				probeCount: probeTimeCount,
				probeAvg: probeTimeAverage,
				eccQTopic: multiPageGr.getValue('ecc_queue_topic')
			};
		} else if (multiPageMap[patternName])
			calculateAverage(probeTimeCount, probeTimeAverage, patternName, multiPageMap);
	}

	// Find the singular versions of the MultiPage patterns and aggregate them
	// (i.e. 'Pattern Launcher: Solaris Server')
	Object.keys(multiPageMap).forEach(function(key) {
		var singlePattGr = new GlideRecord('discovery_perf_metric_probe_sensor_rollup_by_build');
		singlePattGr.addQuery('build_version', build);
		singlePattGr.addQuery('ecc_queue_name', key);
		singlePattGr.query();
		if (singlePattGr.next()) {
			var singlePattProbeCount = parseInt(singlePattGr.getValue('probe_time_count'));
			var singlePattProbeAvg = parseFloat(singlePattGr.getValue('probe_time_average'));
			calculateAverage(singlePattProbeCount, singlePattProbeAvg, key, multiPageMap);
			// Save pattern names to query out later
			stringOfMultiPagePatts += key + ",";
		}
	});
	
	var rollUpGr = new GlideRecord('discovery_perf_metric_probe_sensor_rollup_by_build');
	rollUpGr.addQuery('build_version', build);
	// Filter by 'Horizontal Pattern'
	rollUpGr.addQuery('probe', HORIZONTAL_PATTERN_SYS_ID);
	// Filter out MultiPage patterns and their singular counterparts
	rollUpGr.addQuery('ecc_queue_name','DOES NOT CONTAIN', 'MultiPage');
	rollUpGr.addQuery('ecc_queue_name', 'NOT IN', stringOfMultiPagePatts);
	rollUpGr.orderByDesc('probe_time_average');
	rollUpGr.setLimit(10);
	rollUpGr.query();
	while (rollUpGr.next()) {
		// e.g. extract 'Network Switch' from 'Pattern Launcher: Network Switch'
		var pattMatch = PATTERN_NAME_PATT.exec(rollUpGr.getValue('ecc_queue_name'));
		var pattSysId = getPattSysId(pattMatch[1]);
		if (!pattSysId)
			continue;
	
		// Get top ten average longest patterns minus MultiPage patterns
		arrayOfMappings.push({
			pattern: {
					name: pattMatch[1],
					sys_id: pattSysId,
					ecc_queue_topic: rollUpGr.getValue('ecc_queue_topic'),
					ecc_queue_name: rollUpGr.getValue('ecc_queue_name')
					},
			avg_time_ms: parseFloat(rollUpGr.getValue('probe_time_average')),
		});
	}

	combineMultiPattToArray(multiPageMap, arrayOfMappings);
	sortAndSplice(arrayOfMappings);
	addRanks(arrayOfMappings);
	
	result['avg_slowest_patterns_in_current_build'] = arrayOfMappings;
	result['count'] = arrayOfMappings.length;
}

// Function to combine averages
function calculateAverage(newProbeCount, newProbeAvg, pattName, pattMap) {
	var total1 = pattMap[pattName]['probeCount'] * pattMap[pattName]['probeAvg'];
	var total2 = newProbeCount * newProbeAvg;
	var totalNum = pattMap[pattName]['probeCount'] + newProbeCount;
	pattMap[pattName]['probeCount'] = totalNum;
	pattMap[pattName]['probeAvg'] = (total1 + total2) / totalNum;
}

// Queries for Pattern sys_id
function getPattSysId(pattName) {
	if (!pattName)
		return null;

	var pattGr = new GlideRecord('sa_pattern');
	pattGr.query('name', pattName);
	if (pattGr.next())
		return pattGr.getValue('sys_id');
	return null;
}

function combineMultiPattToArray(multiPatterns, theArray) {
	// Push the aggregated MultiPage patterns into the list
	Object.keys(multiPatterns).forEach(function(key) {
		var multiPattMatch = PATTERN_NAME_PATT.exec(key);
		var multiPattSysId = getPattSysId(multiPattMatch[1]);
		if (!multiPattSysId)
			return;

		theArray.push({
			pattern: {
					name: multiPattMatch[1],
					sys_id: multiPattSysId,
					ecc_queue_topic: multiPatterns[key]['eccQTopic'],
					ecc_queue_name: key
					},
			avg_time_ms: multiPatterns[key]['probeAvg']
		});
	});
}

function sortAndSplice(theArray) {
	// Sort by descending average time
	theArray.sort(function(a, b) {
		return b['avg_time_ms'] - a['avg_time_ms'];
	});

	// Take only the 10 slowest (first 10 elements)
	theArray.splice(10);
}

// Adds rank to each pattern for explicitness
function addRanks(theArray) {
	for (var i = 0; i < theArray.length; i++)
		theArray[i]['rank'] = i + 1;
}
