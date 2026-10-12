// delete all the user labels assigned by the group to its members
// and the group labels assigned to the children

deleteMembersAndChildrenLabels();

function deleteMembersAndChildrenLabels() {
	var update = new LabelUpdate();
	update.removeGroupLabelFromMembers(current);
	update.removeGroupLabelFromChildren(current);
}
