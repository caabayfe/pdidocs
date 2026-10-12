answer = false;
if (current.type == 'PROCESS') {
	answer = new global.ProminConfigACLUtil(current.process_def).canWrite();
}
