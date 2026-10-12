function onSubmit() {
   var gr = new GlideRecord(g_form.getTableName());
   gr.addQuery('applies_to', g_form.getValue('applies_to'));
   gr.query();
   if (gr.next() && gr.sys_id!=g_form.getUniqueValue()) {
      var msg = getMessage("There is already an identifier created for this CI class, use and edit rules associated with it!");
      alert(msg);
      return false;
   } else
      return true;
}
