(function executeRule(current, previous /*null when async*/) {
	var currentSwimLaneProcessDefinitionId = (current.swim_lane.process_definition && current.swim_lane.process_definition.toString()) || '';
    var currentProcessDefinitionId = (current.process_definition && current.process_definition.toString()) || '';

    if (!currentSwimLaneProcessDefinitionId || currentSwimLaneProcessDefinitionId !== currentProcessDefinitionId) {
        gs.addErrorMessage(gs.getMessage('Activity and swim lane are not in the same process'));
        current.setAbortAction(true);
    }

})(current, previous);
