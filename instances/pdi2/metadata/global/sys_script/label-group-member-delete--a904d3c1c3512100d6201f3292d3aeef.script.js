// delete all the user labels that the user had inherited from this group
removeGroupLabelsFromUser();

function removeGroupLabelsFromUser() {
	var update = new LabelUpdate();
	update.removeGroupLabelsFromUser(current.group, current.user);
}
