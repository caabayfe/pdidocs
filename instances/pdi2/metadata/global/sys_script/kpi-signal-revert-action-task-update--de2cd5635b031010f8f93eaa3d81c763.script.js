(function executeRule(current, previous /*null when async*/) {

	var signalSysId = current.sys_id;
	var signalTaskGlideRecord = new GlideRecord("kpi_signals_task");
	signalTaskGlideRecord.addQuery("signal", signalSysId);
	signalTaskGlideRecord.query();
	if(!signalTaskGlideRecord.next())
		return;
	
	var closeNote = gs.getMessage("Referenced signal was reverted");
	//update the task record
	signalTaskGlideRecord.setValue("active", false);
	signalTaskGlideRecord.setValue("close_code", 30);// Closed Code =(30-signal reverted)
	signalTaskGlideRecord.setValue("state", 30); //State=closed
	signalTaskGlideRecord.setValue("closed_at", new GlideDateTime());
	signalTaskGlideRecord.setValue("closed_by", gs.getUserID()); // User in session is the user who deleted the signal record
	signalTaskGlideRecord['close_notes'].setJournalEntry(closeNote); 
	signalTaskGlideRecord.update();

})(current, previous);
