if (current.finding_def.type == 'PROJECT') {
	answer = new global.ProminACLUtil(current.finding_chain.finding_def.project.getRefRecord()).canWriteInChildTableDef();
} else {
	answer = current.finding_chain.finding_def.getRefRecord().canWrite();
}
