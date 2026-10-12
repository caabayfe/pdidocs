function getPAIndicators() {
    var indicatorGR = new GlideRecord('sn_bm_common_indicator');
	indicatorGR.addActiveQuery();
	indicatorGR.query();
	var indicators = [];
	while(indicatorGR.next()) {
		indicators.push(indicatorGR.getValue('indicator'));
	}
    return indicators;
}

function getUpdatedIndicators (indicators) {
	var queryString = indicators.map(function(indicator_sys_id) {
	   return 'pa_indicators_' + indicator_sys_id;
	});

	var updatedIndicators = [];
	var sysUpdateXMLGR = new GlideRecord('sys_update_xml');
    sysUpdateXMLGR.addQuery('type', 'Indicator');
	sysUpdateXMLGR.addQuery('name', 'IN', queryString);
	sysUpdateXMLGR.query();
	while(sysUpdateXMLGR.next()) {
		updatedIndicators.push(sysUpdateXMLGR.getValue('name').replace('pa_indicators_', ''));
	}
	return updatedIndicators;
}

function getUpdatedIndicatorSources(indicators) {
	var indicatorSources = [];
	var paIndicatorsGR = new GlideRecord('pa_indicators');
	paIndicatorsGR.addNotNullQuery('cube');
	paIndicatorsGR.addQuery('sys_id', 'IN', indicators.join(','));
    paIndicatorsGR.query();
	while(paIndicatorsGR.next()) {
		indicatorSources.push(paIndicatorsGR.getValue('cube'));
	}

	var queryString = indicatorSources.map(function(sys_id) {
		return 'pa_cubes_' + sys_id;
	});
    var updatedIndicatorSources = [];
    var sysUpdateXMLGR = new GlideRecord('sys_update_xml');
    sysUpdateXMLGR.addQuery('type', 'Indicator Source');
    sysUpdateXMLGR.addQuery('name', 'IN', queryString);
    sysUpdateXMLGR.query();
	while(sysUpdateXMLGR.next()) {
		updatedIndicatorSources.push(sysUpdateXMLGR.getValue('name').replace('pa_cubes_', ''));
	}
    return updatedIndicatorSources;
}

var pa_indicators = getPAIndicators();
var updatedIndicators = getUpdatedIndicators(pa_indicators);
var updatedIndicatorSources = getUpdatedIndicatorSources(pa_indicators);
answer = '{"updated_pa_indicators" : "'+updatedIndicators.join(',')+'", "updated_indicator_sources" : "'+updatedIndicatorSources.join(',')+'", "count" : "'+updatedIndicators.length+'"}';
