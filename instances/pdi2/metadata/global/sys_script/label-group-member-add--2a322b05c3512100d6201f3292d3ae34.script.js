// when a user is added to a group
// user inherit all labels from that group
addGroupLabelsToMember();

function addGroupLabelsToMember() {
	var update = new LabelUpdate();
	update.addGroupLabelsToUser(current.group, current.user);
}
