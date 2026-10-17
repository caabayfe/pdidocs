var VA_NLU_PREDICTION_TIMEOUT = parseInt(gs.getProperty('com.glide.cs.nlu.predict.timeout') || 30); // seconds

var timeoutThreshold = new GlideDateTime();
timeoutThreshold.add(-(VA_NLU_PREDICTION_TIMEOUT * 1000));

var staleVAPredictionStateGR = new GlideRecord('open_nlu_predict_state_tracking');
staleVAPredictionStateGR.addQuery('state', 'NOT IN', 'COMPLETED,CANCELLED,TIMED_OUT,SERVICE_ERROR,PREDICT_ERROR');
staleVAPredictionStateGR.addQuery('app', 'Virtual Agent');
staleVAPredictionStateGR.addQuery('app_document_table', 'sys_cs_conversation_task');
staleVAPredictionStateGR.addQuery('mode', 'ASYNC');
staleVAPredictionStateGR.addQuery('sent_on', '<=', timeoutThreshold);
staleVAPredictionStateGR.query();
var timeoutCandidates = [];
while (staleVAPredictionStateGR.next()) {
	if ('suspended' == staleVAPredictionStateGR.app_document.getRefRecord().state) {
		var stateTrackingSysId = '' + staleVAPredictionStateGR.getUniqueValue();
		var convSysId = '' + staleVAPredictionStateGR.app_document.getRefRecord().conversation;
		var csTaskSysId = '' + staleVAPredictionStateGR.app_document;
		var userSysId = '' + staleVAPredictionStateGR.user_id;
		sn_cs.VASystemObject.timeoutNLUPrediction(convSysId, csTaskSysId, stateTrackingSysId, userSysId);
	} else {
		// Just manually mark is as TIMED_OUT, so we never have to revisit this record again
		staleVAPredictionStateGR.setValue('state', 'TIMED_OUT');
		staleVAPredictionStateGR.update();
	}
}
