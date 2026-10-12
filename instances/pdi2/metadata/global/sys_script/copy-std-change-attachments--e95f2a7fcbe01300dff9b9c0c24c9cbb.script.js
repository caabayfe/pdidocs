(function executeRule(current, previous /*null when async*/) {

	if (new StdChangeUtils().isChangeStandardAndTwoStepEnabled(current))
		GlideSysAttachment.copy("std_change_record_producer", current.std_change_producer_version.std_change_producer, current.getTableName(), current.getUniqueValue());

})(current, previous);
