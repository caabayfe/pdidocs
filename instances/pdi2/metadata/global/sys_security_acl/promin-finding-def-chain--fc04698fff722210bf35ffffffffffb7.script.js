if(current.finding_def.type == 'PROJECT') {
    answer = new global.ProminACLUtil(current.finding_def.project.getRefRecord()).canWriteInChildTableDef();
} else {
	answer = current.finding_def.getRefRecord().canWrite();
}
