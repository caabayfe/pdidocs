redirectToOriginalEvent();
function redirectToOriginalEvent() {
	var originalID = current.getValue("parm1").substring(11);
	var table = current.getTableName();
    var event = new GlideRecord(table);
    
    if (!event.get("sys_id", originalID)) {
        gs.addErrorMessage(gs.getMessage("Event record not found."));
        action.setRedirectURL(current);
        return;
    }
    
    action.setRedirectURL(event);
}
