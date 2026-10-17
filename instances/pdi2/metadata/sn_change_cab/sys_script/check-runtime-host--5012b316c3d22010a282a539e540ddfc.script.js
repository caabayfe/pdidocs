(function executeRule(current, previous /*null when async*/) {

	CABRuntimeState.get(current.getUniqueValue()).syncHost();

})(current, previous);
