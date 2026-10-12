(function executeRule(current, previous /*null when async*/) {
	var stageMsg;
	if(!gs.nil(previous.getValue('stage')))
		stageMsg = "Clone stage changed from " + previous.getValue('stage') + " to " + current.getValue('stage');
	else
		stageMsg = "Clone stage changed to " + current.getValue('stage');

	SncCloneLoggerUtil.info(current.getValue('sys_id'), stageMsg, "CloneStageLogger");

})(current, previous);
