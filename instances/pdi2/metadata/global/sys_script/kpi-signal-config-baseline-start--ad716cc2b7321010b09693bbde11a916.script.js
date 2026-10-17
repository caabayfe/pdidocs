/*
 *  When baseline changes or is deleted, update the parent process to point to the latest baseline.
 */
(function executeRule(current, previous /*null when async*/) {
	var processId = current.getValue('process');
	var baselineGlideRecord = new GlideRecord('pa_xmr_baselines');
	baselineGlideRecord.addQuery('process', processId);
	baselineGlideRecord.orderByDesc('start_at');
	baselineGlideRecord.limit(1);
	baselineGlideRecord.query();
	
	if (!baselineGlideRecord.next()) {
		return;
	}
	
	var newStartAtString = baselineGlideRecord.getValue('start_at');
	if (!newStartAtString || !newStartAtString.match(/^\d{8}$/)) {
		return;
	}
	
	var newStartAt = newStartAtString.substring(0, 4) 
		+ '-' + newStartAtString.substring(4, 6) 
		+ '-' + newStartAtString.substring(6, 8);
	var processGlideRecord = new GlideRecord('pa_xmr_processes');
	if (!processGlideRecord.get(processId)) {
		return;
	}
	if (processGlideRecord.getValue('start_at') == newStartAt) {
		return;
	}
	processGlideRecord.setValue('start_at', newStartAt);
	processGlideRecord.update();
})(current, previous);
