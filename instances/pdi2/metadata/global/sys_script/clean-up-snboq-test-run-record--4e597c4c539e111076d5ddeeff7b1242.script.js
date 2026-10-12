(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	new SNBOQCleanup().cancelSNBOQRecord(current.getValue("root_tracker_id"), gs.getMessage("ATF_TG:tracker_message_test_result_deleted"));

})(current, previous);
