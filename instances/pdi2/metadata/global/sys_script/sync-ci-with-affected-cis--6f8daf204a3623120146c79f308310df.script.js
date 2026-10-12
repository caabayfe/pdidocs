if (!previous.cmdb_ci.nil())
   removePreviousCI();

if (!current.cmdb_ci.nil())
   addCurrentCI();

function removePreviousCI() {
   // Delete Affected CI records for this task and previous CI
   var rec = new GlideRecord('task_ci');
   rec.addQuery('task', current.sys_id);
   rec.addQuery('ci_item', previous.cmdb_ci);
   rec.query();
   while (rec.next())
      rec.deleteRecord();
}

function addCurrentCI() {
   //Create Affected CI record for this task and current CI
   var rec = new GlideRecord('task_ci');
   rec.addQuery('task', current.sys_id);
   rec.addQuery('ci_item', current.cmdb_ci);
   rec.query();
   if (rec.next())
      return;

   rec.initialize();
   rec.task = current.sys_id;
   rec.ci_item = current.cmdb_ci;
   rec.insert();
}
