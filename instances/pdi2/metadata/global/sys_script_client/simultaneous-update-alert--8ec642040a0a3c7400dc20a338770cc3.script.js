// Warn when two users are editing the same record
function onSubmit() {
   var updatedOn = gel('onLoad_sys_updated_on').value;
   if (!updatedOn)
      return;

   var gr = new GlideRecord(g_form.getTableName());
   if (!gr.get(g_form.getUniqueValue()))
      return;

   var dbUpdatedOn = gr.sys_updated_on + '';
   var dbUpdatedBy = gr.sys_updated_by + '';
   if (updatedOn != dbUpdatedOn)
      return confirm(new GwtMessage().getMessage("{0} updated this record since you opened it - overwrite with your changes? Additional comments and Work notes will not be overwritten.", dbUpdatedBy));
}
