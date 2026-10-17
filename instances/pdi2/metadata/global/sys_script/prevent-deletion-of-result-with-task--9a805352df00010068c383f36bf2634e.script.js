var gr = new GlideRecord(current.table + '');
if (gr.get(current.id)) {
	gs.addErrorMessage(gs.getMessage("An audit result cannot be deleted if there are tasks remaining."));
	current.setAbortAction(true);
}
