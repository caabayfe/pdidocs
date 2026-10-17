answer=false;
if(current.comm_task){
	var commTaskGr = new GlideRecord('comm_task');
	if (commTaskGr.get(current.comm_task)) {
		answer=commTaskGr.state.canWrite();
	}
}
