// when a group is labeled
// all users from this group inherit the label
// all child groups inherit the label

addLabelToMembersAndChildren();

function addLabelToMembersAndChildren() {
	var update = new LabelUpdate();
	update.addGroupLabelToMembers(current);
	update.addGroupLabelToChildren(current);
}
