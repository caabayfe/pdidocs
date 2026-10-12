if (!gs.nil(current.project)) {
    answer = new global.ProminACLUtil(current.project.getRefRecord()).canRead();
} else {
	answer = current.process_def.getRefRecord().canRead();
}
