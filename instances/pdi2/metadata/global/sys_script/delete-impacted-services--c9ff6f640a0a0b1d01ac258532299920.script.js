removeAffectedServices();

function removeAffectedServices() {
   var m2m = new GlideRecord('task_cmdb_ci_service');
   m2m.addQuery('task',current.sys_id);
   m2m.query();
   m2m.deleteMultiple();
}
