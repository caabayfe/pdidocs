(function executeRule(current, previous /*null when async*/) {
	if (current.type == "1"){ //metric name
		current.ci_type = '';
		current.cmdb_ci ='';
		current.promotion_parameter ='';
		current.update();
		return;
	}
	if (current.type == "2"){ // ci_type
		current.metric_name = '';
		current.cmdb_ci ='';
		current.promotion_parameter ='';
		current.update();
		return;	
	}
	if (current.type == "3"){ // cmdb_ci
		current.ci_type = '';
		current.metric_name ='';
		current.promotion_parameter ='';
		current.update();
		return;
	}
	if (current.type == "4"){ // promotion parameter
		current.ci_type = '';
		current.cmdb_ci ='';
		current.metric_name ='';
		current.update();
	}
})(current, previous);
