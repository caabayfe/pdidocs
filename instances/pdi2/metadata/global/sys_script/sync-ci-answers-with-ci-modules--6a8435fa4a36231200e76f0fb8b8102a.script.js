synchModule();

function synchModule() {
   // Synch CI classes roles and active status based on interceptor answers
   var destTbl = current.target_url.split('.')[0];
   // Ignore if 'cmdb_ci_database' since no 1:1 match
   if (destTbl == 'cmdb_ci_database')
      return;
   
   // Query for corresponding module records
   var mod = new GlideRecord('sys_app_module');
   mod.addQuery('application.name', 'configuration_management');
   mod.addQuery('name', destTbl);
   mod.query();
   while (mod.next()) {
      if (current.roles.changes()) {
         gs.log('CI module roles synchronized to interceptor answer roles for table: ' + destTbl);
         if (current.roles == "")
            mod.roles = "NULL";
         else
            mod.roles = current.roles;
      }
      if (current.active.changes()) {
         gs.log('CI module active status synchronized to interceptor answer active status for table: ' + destTbl);
         mod.active = current.active;
      }
      do_not_sync = "true";
      mod.update();
      delete do_not_sync;
   }
}
