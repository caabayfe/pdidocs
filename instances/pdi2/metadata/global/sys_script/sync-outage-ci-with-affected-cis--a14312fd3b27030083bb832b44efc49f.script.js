if (!previous.cmdb_ci.nil())
   removePreviousCI();

if (!current.cmdb_ci.nil())
   addCurrentCI();

function removePreviousCI() {
   // Delete Affected CI records for this outage and previous CI
   var rec = new GlideRecord('cmdb_outage_ci_mtom');
   rec.addQuery('outage', current.sys_id);
   rec.addQuery('ci_item', previous.cmdb_ci);
   rec.query();
   while (rec.next())
      rec.deleteRecord();
}

function addCurrentCI() {
   //Create Affected CI record for this outage and current CI
   var rec = new GlideRecord('cmdb_outage_ci_mtom');
   rec.addQuery('outage', current.sys_id);
   rec.addQuery('ci_item', current.cmdb_ci);
   rec.query();
   if (rec.next())
      return;

   rec.initialize();
   rec.outage = current.sys_id;
   rec.ci_item = current.cmdb_ci;
   rec.insert();
}
