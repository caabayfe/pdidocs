// This script categorizes the usage of PA in the platform into one of the following categories:
// 0 = No PA (Neither PA nor PA premium plugins installed)
// 1 = PA Premium installed and in use (active data collectors)
// 2 = PA Premium installed, not implemented (no active data collector)
// 3 = PA Freemium, hacked
// 4 = PA Freemium, in use
// 5 = PA Freemium, not implemented

var paInstalled = GlidePluginManager.isActive('com.snc.pa');
var paPremiumInstalled = SNC.PAUtils.isPremium();
var numActiveDataCollectors = 0;
var numIndicators = 0;
var totalFreemiumIndicators = getTotalFreemiumIndicators();

if (paInstalled || paPremiumInstalled) {

	var paJobsGR = new GlideRecord('sysauto_pa');
	paJobsGR.addQuery('active', true);
	paJobsGR.addNullQuery('benchmarking').addOrCondition('benchmarking', false);
	paJobsGR.query();
	numActiveDataCollectors = paJobsGR.getRowCount();

	var indicatorsGR = new GlideRecord('pa_indicators');
	indicatorsGR.addNullQuery('benchmarking').addOrCondition('benchmarking', false);
	indicatorsGR.query();
	numIndicators = indicatorsGR.getRowCount();
}

var cnt = 0;
var paType = 'PA Freemium';

if (paPremiumInstalled) {
	
	paType = 'PA Premium';
	if (numActiveDataCollectors > 0) {
		// premium in use
		cnt = 1;
	} else {
		// premium not used
		cnt = 2;
	}
	
} else if (paInstalled) { 
	
	// freemium case
	if (numIndicators > totalFreemiumIndicators) {
		// using more than allowed for freemium
		cnt = 3;
		
	} else {
		
		if (numActiveDataCollectors > 0) {
			//data collection active
			cnt = 4;
		} else {
			// no data collection
			cnt = 5;
		}
	}
}

answer = '{"count": "';
answer += cnt + '","paType":"' + paType + 
	'","active_data_collectors":"' + numActiveDataCollectors  + 
	'","indicators":"' + numIndicators + '"}';

/**
* Retrieve total indicators that are not benchmark and related to one of the freemium plugins:
* - com.glide.instance_sec_center
* - com.snc.pa.usage.overview
* - com.snc.pa
* - com.snc.pa.instance_sec_dash
*/
function getTotalFreemiumIndicators() {
	var totalFreemium = 0;
	if (GlidePluginManager.isActive('com.glide.instance_sec_center'))
		totalFreemium += 3;

	if (GlidePluginManager.isActive('com.snc.pa.usage.overview'))
		totalFreemium += 14;

	if (GlidePluginManager.isActive('com.snc.pa'))
		totalFreemium += 31;

	if (GlidePluginManager.isActive('com.snc.pa.instance_sec_dash'))
		totalFreemium += 10;

	return totalFreemium;
}
