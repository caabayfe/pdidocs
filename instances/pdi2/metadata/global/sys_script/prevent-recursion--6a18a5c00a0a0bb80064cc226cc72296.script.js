var rt = new RecursionTester('sys_db_object', 'super_class');
if (rt.isRecursive(current)) {
   current.setAbortAction(true);
   current.parent.setError('Invalid Parent');
   gs.addErrorMessage(gs.getMessage('The selected parent loops back to this record (recursive loop)'));
}

// Prevent duplicates
if (current.operation() == 'insert') {
   var dup = new GlideRecord('sys_db_object');
   dup.addQuery('name', current.name);
   dup.query();
   if (dup.hasNext()) {
      current.setAbortAction(true);
      current.name.setError(gs.getMessage('Table name {0} is already in use', current.name));
      gs.addErrorMessage(gs.getMessage('Table name {0} is already in use', current.name));
   }
}
