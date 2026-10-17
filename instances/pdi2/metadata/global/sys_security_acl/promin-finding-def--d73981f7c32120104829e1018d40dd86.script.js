if (current.type == 'PROJECT') {
    var grProject = current.project.getRefRecord();
    answer = grProject.canRead();
} else {
	answer = current.process_def.getRefRecord().canRead();
}
