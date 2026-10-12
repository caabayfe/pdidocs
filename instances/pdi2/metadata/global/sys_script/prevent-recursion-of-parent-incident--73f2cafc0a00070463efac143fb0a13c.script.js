var rt = new RecursionTester('incident', 'parent_incident');
if (rt.isRecursive(current)) {
   current.setAbortAction(true);
   current.parent_incident.setError(gs.getMessage('Invalid Parent Incident'));
   gs.addErrorMessage(gs.getMessage('The selected Parent Incident loops back to this record (recursive incident loop)'));
}
