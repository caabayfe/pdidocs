(function executeRule(current, previous /*null when async*/) {

	var request_sys_id = current.sampling_configuration_id;
	var samplingUtil = new sn_ws.RestSamplingUtil();
	samplingUtil.finishSamplingIfNeeded(request_sys_id);

})(current, previous);
