var rt = new RecursionTester('kb_category', 'parent_id');
if (rt.isRecursive(current)) {   
	current.setAbortAction(true);
	gs.addErrorMessage(gs.getMessage('The selected parent loops back to this record'));
}
