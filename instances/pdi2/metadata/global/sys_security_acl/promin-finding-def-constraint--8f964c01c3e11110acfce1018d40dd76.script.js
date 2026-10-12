answer = true;
if (current.finding_def.type == 'PROJECT') {
    var grProject = current.finding_chain.finding_def.project.getRefRecord();
    answer = grProject.canRead();
}
