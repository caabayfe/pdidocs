// assigns all the parents labels to the child
updateParentLabels();

function updateParentLabels() {
	var update = new LabelUpdate();
	if (!previous.parent.nil())
		update.removeGroupLabelsFromGroup(current, previous.parent);
	
	if (current.parent)
	    update.addGroupLabelsToGroup(current, current.parent);
}
