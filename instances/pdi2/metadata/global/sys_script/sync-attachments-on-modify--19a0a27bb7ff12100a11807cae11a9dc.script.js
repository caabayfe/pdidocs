(function executeRule(current, previous /*null when async*/) {

	var template = current.std_change_producer.getRefRecord();
	if (template)
		new StdChangeUtils().copyAttachments(template, current, true);

})(current, previous);
