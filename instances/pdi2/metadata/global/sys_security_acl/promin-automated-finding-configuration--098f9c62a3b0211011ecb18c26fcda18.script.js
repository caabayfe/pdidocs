answer = false;
if (!gs.nil(current.automated_finding.project)) {
    answer = new global.ProminACLUtil(current.automated_finding.project.getRefRecord()).canRead();
} else if (!gs.nil(current.automated_finding.process_def)) {
    answer = current.automated_finding.process_def.getRefRecord().canRead();
}
