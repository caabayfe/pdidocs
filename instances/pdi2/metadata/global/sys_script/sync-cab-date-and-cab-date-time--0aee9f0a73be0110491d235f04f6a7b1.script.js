(function executeRule(current, previous /*null when async*/) {

	if (current.cab_date_time.changes())
		current.setValue("cab_date", current.getValue("cab_date_time"));
	else
		current.setValue("cab_date_time", current.getValue("cab_date"));

})(current, previous);
