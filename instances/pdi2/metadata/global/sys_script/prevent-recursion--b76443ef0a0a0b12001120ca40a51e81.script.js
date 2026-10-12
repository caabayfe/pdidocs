var rt = new RecursionTester('sc_category', 'parent');
if (rt.isRecursive(current)) {
   current.setAbortAction(true);
   current.parent.setError('Invalid Parent');
   gs.addErrorMessage(gs.getMessage('The selected parent loops back to this record (recursive category loop)'));
}
