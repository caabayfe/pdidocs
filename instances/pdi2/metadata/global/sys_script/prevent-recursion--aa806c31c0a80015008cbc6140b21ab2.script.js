var rt = new RecursionTester('sys_user_group', 'parent');
if (rt.isRecursive(current)) {
   current.setAbortAction(true);
   current.parent.setError('Invalid Parent');
   gs.addErrorMessage(gs.getMessage('The selected parent loops back to this record (recursive group loop)'));
}
