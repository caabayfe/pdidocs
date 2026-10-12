(function executeRule(current, previous /*null when async*/) {
	var msgArray = [];
	var restrictLevel = false;
	//get the difference of level to be updated.
	var levelManager = new global.CapabilityLevelManager();
	// check if current.parent and current children are same
	if(current.sys_id == current.parent) {
		msgArray = [];
		msgArray.push(current.name);
		msgArray.push(current.parent.name);
		gs.addErrorMessage(gs.getMessage("Cannot add the {0} Capability as a child of {1} Capability as it creates a Circular Relationship between Capabilities.", msgArray ));
		current.setAbortAction(true);
	}
	else {
		var isCircular = levelManager.checkCircularLoop(current.sys_id,current.parent );
		if(isCircular) {
			msgArray = [];
			msgArray.push(current.name);
			msgArray.push(current.parent.name);
			gs.addErrorMessage(gs.getMessage( "Cannot add the {0} Capability as a child of {1} Capability as it creates a Circular Relationship between Capabilities.", msgArray));
			current.setAbortAction(true);
		}
		else {
			msgArray = [];
			msgArray.push(current.name);
			msgArray.push(current.parent.name);
			restrictLevel = levelManager.updateLevelsOnParentChange(current, previous);
			if(restrictLevel){
				gs.addErrorMessage(gs.getMessage("Capability Hierarchy up to level-5 is only supported. Cannot add the {0} Capability as a child of {1} Capability which results in level-6 capability.", msgArray));
				current.setAbortAction(true);
			}
		}
	}
})(current, previous);
