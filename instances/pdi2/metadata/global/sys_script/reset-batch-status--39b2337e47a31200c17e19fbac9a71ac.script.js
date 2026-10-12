(function executeRule(current, previous /*null when async*/) {
	var baseUpdateSet = new GlideRecord("sys_update_set");
	baseUpdateSet.get(current.base_update_set.sys_id);
	
	//Reset the batch base status
	if (baseUpdateSet.state == "complete") {
		gs.addInfoMessage(gs.getMessage('Resetting update set "{0}" to "In Progress" because an update set in the batch is also "In Progress"', baseUpdateSet.name));
		baseUpdateSet.state = "in progress";
		baseUpdateSet.update();
	}

})(current, previous);
