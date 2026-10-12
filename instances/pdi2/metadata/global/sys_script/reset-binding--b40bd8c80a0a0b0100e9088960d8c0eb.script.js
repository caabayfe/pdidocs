deleteOldBinding();

function deleteOldBinding() {
   var gr = new GlideRecord('state_binding');
   gr.addQuery('document', current.getRecordClassName());
   gr.addQuery('document_key', current.sys_id);
   gr.query();
   if (gr.next()) {
      var message= gs.getMessage('Resetting state bind on a re-entered change task');
      gs.info(message);
      gr.deleteRecord();
   }
}
