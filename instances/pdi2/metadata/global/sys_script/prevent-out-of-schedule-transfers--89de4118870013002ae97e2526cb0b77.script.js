(function executeRule(current, previous /*null when async*/) {
	var queueRecord = current.to_queue.getRefRecord();
	if (!queueRecord.isValidRecord()) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("Unable to transfer to undefined queue"));
		return;
	}
	
	var queueInSchedule = sn_interaction.InteractionQueue.getQueue(queueRecord).isInSchedule();
	if (!queueInSchedule) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("Unable to transfer interaction to out-of-schedule queue"));
		return;
	}
})(current, previous);
