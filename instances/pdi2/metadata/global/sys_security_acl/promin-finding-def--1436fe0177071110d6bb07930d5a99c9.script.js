answer = false;
if (current.type == 'PROJECT') {
	answer = new global.ProminACLUtil(current.project.getRefRecord()).canWriteInChildTableDef();
}
