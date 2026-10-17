function onSubmit() {
	var approverSequence = g_form.getIntValue('sequence');
	if (approverSequence <= 0) {
		g_form.showFieldMsg('sequence', getMessage("Approver sequence should be greater than 0."), 'error');
		return false;
	}
}
