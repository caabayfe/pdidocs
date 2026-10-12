verifyNotFieldAgent();

function verifyNotFieldAgent() {
    if (current.stockroom.type.value == 'field_agent') {
		gs.addErrorMessage(gs.getMessage("Default stockrooms cannot be of type Field Agent"));
		current.setAbortAction(true);
	}
}
