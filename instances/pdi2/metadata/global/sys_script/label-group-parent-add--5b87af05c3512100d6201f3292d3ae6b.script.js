// assigns all the parent group's labels to the child group
addParentLabels();

function addParentLabels() {
	var update = new LabelUpdate();
	update.addGroupLabelsToGroup(current, current.parent);
}
