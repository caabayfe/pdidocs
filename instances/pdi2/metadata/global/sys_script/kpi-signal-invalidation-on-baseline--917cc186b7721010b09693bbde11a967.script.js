/*
 *  When baseline is updated, delete associated signals.
 */
(function executeRule(current, previous /*null when async*/) {
	var signalsGlideRecord = new GlideRecord('pa_xmr_signals');
	signalsGlideRecord.addQuery('baseline', current.sys_id);
	signalsGlideRecord.query();
	signalsGlideRecord.deleteMultiple();
})(current, previous);
