var rt = new RecursionTester('core_company', 'parent');
if (rt.isRecursive(current)) {
   current.setAbortAction(true);
   current.parent.setError('Invalid Parent');
   gs.addErrorMessage(gs.getMessage('The selected parent loops back to this record (recursive company loop)'));
}
