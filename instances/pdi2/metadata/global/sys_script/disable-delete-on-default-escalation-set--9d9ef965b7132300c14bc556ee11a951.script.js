if(current.cmn_rota && current.cmn_rota.getRefRecord().isValidRecord() && previous.getValue('default') == true && previous.getValue('active') == true) {
	gs.addErrorMessage(gs.getMessage('Default escalation set cannot be deleted'));
	current.setAbortAction(true);
}
