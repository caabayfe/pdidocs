checkCompatibility();

function checkCompatibility() {
	var label = new GlideRecord('label');
	if (label.get(current.label)) {
		if (label.viewable_by == 'everyone') {
			current.setAbortAction(true);
			gs.addErrorMessage(gs.getmessage('Tag is already shared with everyone in the system'));
		}
	}
}
