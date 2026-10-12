function transform(input) {
	var actionHandler = new MIDServerActionHandler(input.midSysId, input.action);
	var result = actionHandler.runAction();
	if (result.status == 'error' && this.result.action) {
			gs.addErrorMessage(gs.getMessage("{0} failed: {1}", input.action, result.message)); 
	}
	return result;
}
