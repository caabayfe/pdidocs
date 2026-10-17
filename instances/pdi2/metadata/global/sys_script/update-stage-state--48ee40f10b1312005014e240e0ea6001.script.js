(function executeRule(current, previous /*null when async*/) {
	
	// We know we are running Legacy
	// but ensure it is Legacy with no Icon Attribute
	if (!current.workflow_state.getED().hasAttribute('icon'))
		updateVistitedStages();

	function updateVistitedStages() {
		// Lookup our Stage status GlideRecord
		var stageStatusGr = getStageStatus();
		if (stageStatusGr == null)
			return;         // if the base kb associate with flows, let the flow handle the stage_status field in stage_state record
		
		// Create a StageState JSON Object with Value and Visited array
		var stageStatus = new StageStatus(stageStatusGr.getValue('stage_status'));
		var visited = stageStatus.getVisited();

		// Add our last Stage to the list of visited
		if ((current.workflow_state != previous.workflow_state) && (visited.indexOf(previous.workflow_state.toString()) == -1))
			visited.push(previous.workflow_state.toString());

		// Update our Stage state list with our new stage
		updateStages(stageStatusGr, stageStatus, visited);
	}
	
	function updateStages(stageStatusGr, ss, stages) {
		ss.setValue(current.workflow_state.toString());
		ss.setVisited(stages);
		
		stageStatusGr.setValue("stage_status", ss.toString1());
		stageStatusGr.update();
	}
	
	function getStageStatus() {
		if (isFlowDesigner(current.kb_knowledge_base))
			return null;
		var ss = new GlideRecord("stage_state");
		ss.addQuery("id", current.sys_id);
		ss.addQuery("table", current.getTableName());
		ss.query();
		if (ss.next())
			return ss;
		else
			return createStageState();
	}

	function isFlowDesigner(kbBase) {
		if (kbBase == null)
			return false;
		if ((typeof kbBase.kb_publish_flow == 'undefined') || (typeof kbBase.kb_retire_flow == 'undefined'))	// check if the fields exist
			return false;
		return !kbBase.nil('kb_publish_flow') || !kbBase.nil('kb_retire_flow');
	}
	
	function createStageState() {
		// Create an new StageStatus JSON object with our current value
		var ss = new StageStatus();
		ss.setValue(current.workflow_state.toString());
		
		var stageStates = new GlideRecord("stage_state");
		stageStates.initialize();
		stageStates.setValue("table", current.getTableName());
		stageStates.setValue("id", current.sys_id);
		stageStates.setValue("stage_status", ss.toString1());
		stageStates.insert();
		return stageStates;
	}
	
})(current, previous);
