(function executeRule(current, previous /*null when async*/) {

	var service = current.service_plan.name.toString();
	var feature = current.feature.name.toString();
	var name = service + ": " + feature;
	current.sys_name = name;

})(current, previous);
