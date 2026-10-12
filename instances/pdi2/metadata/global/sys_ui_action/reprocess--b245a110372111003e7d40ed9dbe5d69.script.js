mark();

function mark(){
	var msg = sc_Factory.wrap(current, gs).markForReprocessing();
	gs.addInfoMessage(gs.getMessage(msg));
	gs.setRedirect(current.getTableName() + "_list.do");
}
