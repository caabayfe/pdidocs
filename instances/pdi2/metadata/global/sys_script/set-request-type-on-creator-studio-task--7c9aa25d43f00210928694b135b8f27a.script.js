(function executeRule(current, previous /*null when async*/) {
	var recordProducerSysId = current.getEngineParameter('sc_cat_item_producer');
	if (recordProducerSysId) {
		current.setValue('request_type', recordProducerSysId);
	}
})(current, previous);
