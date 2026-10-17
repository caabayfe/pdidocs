answer = true;
if (current.finding_def.type == 'PROJECT') {
    var grProject = current.finding_def.project.getRefRecord();
    answer = grProject.canRead();
}
