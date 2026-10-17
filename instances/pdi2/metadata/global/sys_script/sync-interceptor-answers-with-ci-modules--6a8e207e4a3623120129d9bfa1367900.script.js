synchAnswers();

function synchAnswers() {
   // Sync CI classes roles and active status based on module values
   var destTbl = current.name + '.do';
   // Ignore if 'cmdb_ci_database' since no 1:1 match
   if (destTbl == 'cmdb_ci_database.do')
      return;

   // Query for any corresponding interceptor answer records
   var ans = new GlideRecord('sys_wizard_answer');
   ans.addQuery('question.intercepts', 'cmdb_ci.do');
   ans.addQuery('target_url', destTbl);
   ans.query();
   while (ans.next()) {
      if (current.roles.changes()) {
         gs.log('CI interceptor answer roles synchronized to module roles for table: ' + current.name);
         if (current.roles == "")
            ans.roles = "NULL";
         else
            ans.roles = current.roles;
      }
      if (current.active.changes()) {
         gs.log('CI interceptor answer active status synchronized to module active status for table: ' + current.name);
         ans.active = current.active;
      }
      do_not_sync = "true";
      ans.update();
      delete do_not_sync;
   }
}
