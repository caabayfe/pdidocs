(function executeRule(current, previous /*null when async*/ ) {

    var fieldValueMap = {
        'queue': current.getValue('queue'),
        'name': current.getValue('name')
    };
    var recordExists = SNC.ProcessingFrameworkUtil.isDuplicateRecord(current.getTableName(), fieldValueMap);
    if (recordExists == true) {
        current.setAbortAction(true);
		var queueName = current.queue.getRefRecord().queue;
        gs.addErrorMessage(gs.getMessage("Queue parameter '{0}' is already configured for queue '{1}'", [current.name,queueName]));
    }

})(current, previous);
