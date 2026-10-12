answer = false;
if(gs.nil(current.finding_def)){
	answer = current.entity.project.getRefRecord().canRead();
} else {
    answer = current.finding_def.getRefRecord().canRead();
}
