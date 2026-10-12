(function executeRule(current, previous /*null when async*/) {
	
	new SNBOQCleanup().deleteTestGen(previous.getValue("sys_id"), gs.getMessage("ATF_TG:tracker_message_boq_record_deleted"));
	

})(current, previous);
