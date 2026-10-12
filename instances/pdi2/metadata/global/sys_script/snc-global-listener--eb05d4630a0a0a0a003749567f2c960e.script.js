//
// Gets control for each field that has an attribute of "listen"
// If a change has not been authorized then a problem record will
// be cut for the change
//
function globalListen(fileName, fieldName, newValue, oldValue) {
   gs.log('Starting Global Listen->' + fileName);
   var fn = new String(fileName);
   if (fn.indexOf('cmdb_ci') >= 0) {
      if (checkForUnscheduled()) {
         var change = new GlideRecord('change_request');
         change.addQuery('active', 'true');      
         change.addQuery('cmdb_ci', current.sys_id);      
         change.query();
         if (!change.next()) {
            createProblem(fileName, fieldName, newValue, oldValue);
            gs.eventQueue("cmdb.unscheduled.change", current, null, null);
         } else {
            var comment = "Detected change of " + fieldName + " in " + current.getDisplayValue() + " from " + oldValue + " to " + newValue;
            change.comments.setJournalEntry(comment);
            change.update();
         }
      }
   }
   gs.log('Ending Global Listen->' + fileName);
}

//
// Create a new problem OR append to a current problem with
// the fact that a field has had an unscheduled change
//
function createProblem(fileName, fieldName, newValue, oldValue) {
   var comment = "Unscheduled change of " + fieldName + " from " + oldValue + " to " + newValue + " by " + gs.getUserName();
   var problem = new GlideRecord('problem');
   problem.addQuery('cmdb_ci', current.sys_id);
   problem.query();
   if (problem.next()) {
      gs.log("SNC Global Listener: Problem updated: " + problem.getDisplayValue());
      problem.comments.setJournalEntry(comment);   
      problem.update();
   } else {
      problem.initialize();
      problem.cmdb_ci = current.sys_id;    
      problem.comments.setJournalEntry(comment);   
      problem.insert();
      gs.log("SNC Global Listener: Problem created: " + problem.getDisplayValue());

   }
}

//
// Check to see if this change is something to be interested in
// If we have a user and the user has 'cmdb_admin' role then let the update
// go without notice.
//
// If we do not have a user but this is the first discovery then let it go.
//
function checkForUnscheduled() {
   var answer = true;
   if (gs.isInteractive()) {
      gs.log("SNC Global Listener: Interactive change");
      if (gs.hasRole('cmdb_admin'))
         answer = false;
   } else {
      gs.log("SNC Global Listener: Non Interactive change");
      if (current.first_discovered.getDateValue() == current.last_discovered.getDateValue())
         answer = false;
   }
   gs.log("SNC Global Listener: Returning-->" + answer);

   return answer;
}
