/**
 * Monthly Breakdown of 10 Slowest Average Sensor Execution Times in Current Build
 *
 * Steps to Build JSON:
 * 1) Find all MultiPage Patterns and aggregate them
 *     (ex. "Pattern Launcher: Solaris Server - MultiPage 1 of 2",
 *      "Pattern Launcher: Solaris Server - MultiPage 2 of 2" must be aggregated
 *      into one average)
 * 2) Find Patterns that match any Patterns found in Step 1 and aggregate them
 *     (ex. "Pattern Launcher: Solaris Server")
 * 3) Find the slowest average Sensors that are not MultiPage Patterns
 *     (i.e. Exclude anything found in Step 1 and 2)
 * 4) Add the aggregated MultiPage Patterns from Step 2 to the slowest average
 *     Sensors from Step 3
 * 5) Sort the list by slowest, splice it to 10, and add rank
 */

var build, rollUpEnabled, indEnabled;
var MULTI_PAGE_PATT = /(.+) - MultiPage \d+ of (\d+)/;
var PATTERN_NAME_PATT = /Pattern Launcher: (.+)/;
var TOTAL_PAGE_PATT = /.+\+ (\d+)/;
var HORIZONTAL_PATTERN_SYS_ID = '4f64c6389f230200fe2ab0aec32e7068';

answer = JSON.stringify(buildSlowSensorJSON());

function buildSlowSensorJSON() {
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
	var stringOfMultiPagePatts = "";
	var multiPageMap = {};
	var aggregatedMultiPageMap = {};

	// 1) Find all MultiPage Patterns and aggregate them
	var multiPageGr = new GlideRecord('discovery_perf_metric_probe_sensor_rollup_by_build');
	multiPageGr.addQuery('build_version', build);
	// Look for Patterns with MultiPage
	multiPageGr.addQuery('ecc_queue_name', 'CONTAINS', 'MultiPage');
	multiPageGr.query();
	while (multiPageGr.next()) {
		// Extract "Pattern Launcher: Solaris Server" and "2" from
		// "Pattern Launcher: Solaris Server - MultiPage 1 of 2"
		var multiMatch = MULTI_PAGE_PATT.exec(multiPageGr.getValue('ecc_queue_name'));
		if (!multiMatch)
			continue;

		var sensorTimeCount = parseInt(multiPageGr.getValue('sensor_time_count'));
		var sensorTimeAverage = parseFloat(multiPageGr.getValue('sensor_time_average'));
		var sensorECCTopic = multiPageGr.getValue('ecc_queue_topic');
		
		populateMultiPageMap(multiPageMap, multiMatch, sensorTimeCount, sensorTimeAverage, sensorECCTopic);
	}

	// 2) Find Patterns that match any Patterns found in Step 1 and aggregate them
	Object.keys(multiPageMap).forEach(function(key) {
		// Extract "2" from "Solaris Server + 2" (should be total pages)
		var totalMatch = TOTAL_PAGE_PATT.exec(key);
		// Skip if no match
		if (!totalMatch)
			return;

		var pattNameFromMap = multiPageMap[key]['pattLauncher'];
		var pattCountFromMap = multiPageMap[key]['sensorCount'];
		var pattAvgFromMap = multiPageMap[key]['sensorTotalAvg'];
		var pattTopicFromMap = multiPageMap[key]['eccQTopic'];

		// Skip if the pattern is void (due to inconsistent count across MultiPages)
		if (multiPageMap[key]['void'])
			return;
		// Skip if there is a mismatch in total MultiPage count for this pattern
		if (multiPageMap[key]['multiPageCount'] != parseInt(totalMatch[1]))
			return;
		
		if (!aggregatedMultiPageMap[pattNameFromMap]) {
			var singlePattGr = new GlideRecord('discovery_perf_metric_probe_sensor_rollup_by_build');
			singlePattGr.addQuery('build_version', build);
			singlePattGr.addQuery('ecc_queue_name', pattNameFromMap);
			singlePattGr.query();
			if (singlePattGr.next()) {
				// Check for singular cases of the MultiPage pattern and aggregate
				var singlePattCount = parseInt(singlePattGr.getValue('sensor_time_count'));
				var singlePattAvg = parseFloat(singlePattGr.getValue('sensor_time_average'));

				var totalCount = pattCountFromMap + singlePattCount;
				var totalSensorTime = (pattAvgFromMap * pattCountFromMap) + (singlePattAvg * singlePattCount);

				aggregatedMultiPageMap[pattNameFromMap] = {
					sensorCount: totalCount,
					sensorAvg: totalSensorTime / totalCount,
					eccQTopic: pattTopicFromMap
				};
				// Save singular pattern names to query out later
				stringOfMultiPagePatts += pattNameFromMap + ",";
			} else {
				// If no singular cases exist, add the MultiPage pattern to the new map
				aggregatedMultiPageMap[pattNameFromMap] = {
					sensorCount: pattCountFromMap,
					sensorAvg: pattAvgFromMap,
					eccQTopic: pattTopicFromMap
				};
			}
		} else if (aggregatedMultiPageMap[pattNameFromMap])
			// If the MultiPage pattern is already in the map, aggregate
			calculateAverage(pattCountFromMap, pattAvgFromMap, pattNameFromMap, aggregatedMultiPageMap);
	});

	// 3) Find the slowest average Sensors
	// This includes Probes and all other Patterns that are not MultiPage
	var rollUpGr = new GlideRecord('discovery_perf_metric_probe_sensor_rollup_by_build');
	rollUpGr.addQuery('build_version', build);
	// Filter out MultiPage patterns and their singular counterparts
	rollUpGr.addQuery('ecc_queue_name','DOES NOT CONTAIN', 'MultiPage');
	rollUpGr.addQuery('ecc_queue_name', 'NOT IN', stringOfMultiPagePatts);
	rollUpGr.orderByDesc('sensor_time_average');
	rollUpGr.setLimit(10);
	rollUpGr.query();
	while (rollUpGr.next()) {
		var rollUpSensorAvg = parseFloat(rollUpGr.getValue('sensor_time_average'));
		populateArrayWithSlowestSensors(rollUpGr, arrayOfMappings, rollUpSensorAvg);
	}

	// 4) Add the aggregated MultiPage Patterns from Step 2 to the slowest average Sensors from Step 3
	combineMultiPattToArray(aggregatedMultiPageMap, arrayOfMappings);

	// 5) Sort the list by slowest, splice it to 10, and add rank and sensor information
	sortAndSplice(arrayOfMappings);
	addRanksAndSensorInfo(arrayOfMappings);

	result['avg_slowest_sensors_in_current_build'] = arrayOfMappings;
	result['count'] = arrayOfMappings.length;
}

function populateMultiPageMap(theMap, regexMatch, countOfSensors, averageOfSensors, topicOfSensor) {
	var patternName = regexMatch[1];
	var multiPageNum = regexMatch[2];
	// Superficial key used to match MultiPage records ex. "Solaris Server + 2"
	var key = regexMatch[1] + " + " + regexMatch[2];
	if (!theMap[key]) {
		// If the MultiPage is not in the map, add it
		theMap[key] = {
			pattLauncher: patternName,
			sensorCount: countOfSensors,
			sensorTotalAvg: averageOfSensors,
			eccQTopic: topicOfSensor,
			multiPageCount: 1
		};
	} else if (theMap[key] && !theMap[key]['void']) {
		// If the MultiPage is in the map and is not void, add it
		if (countOfSensors === theMap[key]['sensorCount']) {
			// Aggregate the sum of the sensor time
			theMap[key]['sensorTotalAvg'] += averageOfSensors;
			// Keep track of MultiPage Count
			theMap[key]['multiPageCount']++;
		} else
			// If sensor count is not consistent, void the multiPage Pattern
			// This is possible if bad data exists or manual manipulation of the
			// data occurs. Ex. If a sensor is run again but the ecc_queue_name
			// has been manipulated, that would yield bad data which we do not
			// care for.
			theMap[key]['void'] = true;
	}
}

// Function to combine averages
function calculateAverage(newSensorCount, newSensorAvg, pattName, pattMap) {
	var total1 = pattMap[pattName]['sensorCount'] * pattMap[pattName]['sensorAvg'];
	var total2 = newSensorCount * newSensorAvg;
	var totalNum = pattMap[pattName]['sensorCount'] + newSensorCount;
	pattMap[pattName]['sensorCount'] = totalNum;
	pattMap[pattName]['sensorAvg'] = (total1 + total2) / totalNum;
}

function populateArrayWithSlowestSensors(query, theArray, averageOfSensor) {
	// e.g. extract 'Network Switch' from 'Pattern Launcher: Network Switch'
	var pattMatch = PATTERN_NAME_PATT.exec(query.getValue('ecc_queue_name'));
	if (!pattMatch) {
		// If there is no match, must be a probe
		theArray.push({
			probe: {
					probe_name: query.getDisplayValue('probe'),
					probe_sys_id: query.getValue('probe'),
					ecc_queue_topic: query.getValue('ecc_queue_topic'),
					ecc_queue_name: query.getValue('ecc_queue_name')
					},
			avg_time_ms: averageOfSensor,
		});
	} else {
		// Must be a pattern if not a probe
		var pattSysId = getPattSysId(pattMatch[1]);
		if (!pattSysId)
			return;

		theArray.push({
			pattern: {
					pattern_name: pattMatch[1],
					pattern_sys_id: pattSysId,
					ecc_queue_topic: query.getValue('ecc_queue_topic'),
					ecc_queue_name: query.getValue('ecc_queue_name')
					},
			avg_time_ms: averageOfSensor,
		});
	}
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
		var pattMatch = PATTERN_NAME_PATT.exec(key);
		var pattSysId = getPattSysId(pattMatch[1]);
		if (!pattSysId)
			return;

		theArray.push({
				pattern: {
						pattern_name: pattMatch[1],
						pattern_sys_id: pattSysId,
						ecc_queue_topic: multiPatterns[key]['eccQTopic'],
						ecc_queue_name: key
						},
				avg_time_ms: multiPatterns[key]['sensorAvg']
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

// Adds rank and sensor info
function addRanksAndSensorInfo(theArray) {
	for (var i = 0; i < theArray.length; i++) {
		var sensorGr = new GlideRecord('discovery_sensor');
		var type;
		if (theArray[i]['probe']) {
			sensorGr.query('reacts_to_probe', theArray[i]['probe']['probe_sys_id']);
			type = 'probe';
		} else {
			sensorGr.query('reacts_to_probe', HORIZONTAL_PATTERN_SYS_ID);
			type = 'pattern';
		}
		sensorGr.next();
		theArray[i][type]['sensor_name'] = sensorGr.getValue('name');
		theArray[i][type]['sensor_sys_id'] = sensorGr.getValue('sys_id');

		// Add Rank
		theArray[i]['rank'] = i + 1;
	}
}
