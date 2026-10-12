(function executeRule(current, previous /*null when async*/) {

	//in case business service process status is changed to approved, BS should become operational.
	if(previous.process_status != current.process_status && current.process_status == 5 && current.operational_status != 1)
	   current.operational_status = 1;

})(current, previous);
