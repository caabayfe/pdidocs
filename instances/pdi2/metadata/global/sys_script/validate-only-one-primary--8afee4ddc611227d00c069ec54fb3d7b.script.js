var test = new GlideRecord('core_company');
test.addQuery('primary', 'true');
test.addQuery('sys_id', '!=', current.sys_id);
test.query();
if (test.next()) {
   current.setAbortAction(true);
   var error = gs.getMessage('Only one company record may be defined as primary') + 
      '. "' + test.name + '" ' + 
      gs.getMessage('is currently the primary company.');
   current.primary.setError(error);
}
