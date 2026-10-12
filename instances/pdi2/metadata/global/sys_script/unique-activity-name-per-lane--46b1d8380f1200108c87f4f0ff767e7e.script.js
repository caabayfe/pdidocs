(function executeRule(current, previous) {
	if ((current.operation() === "insert" || isMovedToDifferentLane()) && !isLaneActivity(current.getValue('name'))) {
		new PDNameGenerator().generateNameFromLabel(["process_definition", "lane"]);
	} else if (current.name.changes()) {
		var gr = new GlideRecord("sys_pd_activity");
		gr.addQuery("name", current.name);
		gr.addQuery("lane", current.lane);
		gr.addQuery("sys_id", "!=", current.sys_id);
		gr.query();
		
		//Aborts update if the name is already in use
		if (gr.hasNext()) {
			gs.addErrorMessage(
				gs.getMessage('An activity with the name "{0}" already exists for this lane.', current.name));
			current.setAbortAction(true);
		}
	}
	
	function isLaneActivity(name) {
		if (JSUtil.nil(name)) {
			//name wasn't provided - can't be a lane special
			return false;
		}
		//otherwise does it end in a lane acitvity identifier
		var laneActivities = ["$start", "$end", "$restart"];
		for(i in laneActivities) {
			if (name.endsWith(laneActivities[i])) {
				return true;
			}
		}
		return false;
	}

	function isMovedToDifferentLane() {
		return current.operation() === 'update' && previous.lane.toString() !== current.lane.toString();
	}
})(current, previous);
