answer = false;
if (current.finding_def.type == 'PROJECT') {
	answer = new global.ProminACLUtil(current.finding_def.project.getRefRecord()).canWriteInChildTableDef();
}
