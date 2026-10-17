function onSubmit() {
   var action = g_form.getActionName();
   if (action == 'sysverb_delete')
      return;

   var fromFieldName = g_form.getValue('m2m_from_field');
   var toFieldName = g_form.getValue('m2m_to_field');
   if (fromFieldName.toString() == toFieldName.toString()) {
      alert(getMessage('M2M from field and M2M to field must be different'));
      return false;
   }
   
   // Check table name against existing tables
   var tableName = g_form.getValue('m2m_table');
   var t = Table.get(tableName);
   if (t.getElements().length > 0) {
      alert(getMessage('Many to Many table name already exists - please choose another'));
      return false;
   }
}
