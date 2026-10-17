answer = false;
if(gs.nil(current.finding_def)){
	if(!gs.nil(current.entity)){
		answer = new global.ProminACLUtil(current.entity.project.getRefRecord()).canWriteInChildTableDef();
	}else{
		answer = true;
	}
}else if(current.finding_def.type == 'PROJECT') {
    answer = new global.ProminACLUtil(current.finding_def.project.getRefRecord()).canWriteInChildTableDef();
} else {
    answer = current.finding_def.getRefRecord().canWrite();
}
