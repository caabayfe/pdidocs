(function executeRule(current, previous /*null when async*/) {

if (!previous.business_service.nil())
   removePreviousBS();

if (!current.business_service.nil())
   addCurrentBS();

function removePreviousBS() {
   // Delete impacted service records for this task and previous business service
   var gr = new GlideRecord('task_cmdb_ci_service');
   gr.addQuery('task', current.sys_id);
   gr.addQuery('cmdb_ci_service', previous.business_service);
   gr.deleteMultiple();
}

function addCurrentBS() {
   //Create impacted service record for this task and current business service
   var gr = new GlideRecord('task_cmdb_ci_service');
   gr.addQuery('task', current.sys_id);
   gr.addQuery('cmdb_ci_service', current.business_service);
   gr.query();
   if (gr.next())
      return;

   gr.initialize();
   gr.task = current.sys_id;
   gr.cmdb_ci_service = current.business_service;
   gr.insert();
}
})(current, previous);
