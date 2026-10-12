(function executeRule(current, previous /*null when async*/) {

	// set the step's table to the module's table
	current.table = current.inputs.module.name;

})(current, previous);
