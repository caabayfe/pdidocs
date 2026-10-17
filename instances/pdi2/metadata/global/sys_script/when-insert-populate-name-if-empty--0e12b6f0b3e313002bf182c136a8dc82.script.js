(function executeRule(current, previous /*null when async*/) {
	if(current.name.nil())
		current.name = current.cxs_search_res_config.name;
})(current, previous);
