answer = true;
if (current.type == 'PROCESS') {
	answer = new global.ProminConfigACLUtil(current.process_def).canCreate();
}
