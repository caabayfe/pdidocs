(function executeRule(current, previous /*null when async*/) {

	new SNC.EventProcessorRegister().createOrUpdateProcessor(current);

})(current, previous);
