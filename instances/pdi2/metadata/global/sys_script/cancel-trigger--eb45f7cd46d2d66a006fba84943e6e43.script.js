deleteTriggers();

function deleteTriggers() {
   //Search for a pre-existing triggers
   var trigger = new GlideRecord("sys_trigger");
   trigger.addQuery("document_key", current.sys_id);
   trigger.addQuery('name', 'STARTSWITH', 'SLA');
   trigger.query();
   while (trigger.next()) {
      //You found a trigger...delete it
      trigger.deleteRecord();
   }
}
