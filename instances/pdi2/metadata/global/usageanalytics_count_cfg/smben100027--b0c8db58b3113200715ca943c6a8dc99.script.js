function getActiveIndicators () {
	var indicatorGR = new GlideRecord('sn_bm_common_indicator');
	indicatorGR.addActiveQuery();
	indicatorGR.query();
	var activeIndicators = [];
	while(indicatorGR.next()) {
		activeIndicators.push(indicatorGR.getValue('sys_id'));
	}
	return activeIndicators;
}
var activeIndicators = getActiveIndicators();
answer = '{"active_indicators" : "'+activeIndicators.join(',')+'", "count" : "'+activeIndicators.length+'"}';
