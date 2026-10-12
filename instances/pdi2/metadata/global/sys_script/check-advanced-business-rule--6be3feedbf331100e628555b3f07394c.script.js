var newRecord = current.newRecord();
if(current.script != newRecord.getValue('script'))
	gs.addInfoMessage(gs.getMessage("The business rule contains script, but is not marked as advanced"));
