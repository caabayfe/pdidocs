//
// Insert events for others to react to
//
createEvents(current);


function createEvents(current) {
   var name = 'release_project';

   if (current.operation() == 'insert') {
      gs.eventQueue(name + ".inserted", current, gs.getUserID(), gs.getUserName());
      var wanted = current.phases_wanted;
      if (wanted == true) {
          current.scheduleScript("SNC Release Insert Phases");      
      }
   }

   if (current.operation() == 'update') {
      gs.eventQueue(name +".updated", current, gs.getUserID(), gs.getUserName());  
      if (current.phases_wanted.changesTo(true)) {     
           current.scheduleScript("SNC Release Insert Phases");
      }
      if (current.phases_wanted.changesTo(false)) {
           current.scheduleScript("SNC Release Delete Phases");
      }
   }

   if (current.active.changesTo(false)) {
      gs.eventQueue(name +".inactive", current, current.workflow_state, current.workflow_state);
   }

   if (current.workflow_state.changes()) {
      gs.eventQueue(name +".state.change", current, current.workflow_state, previous.workflow_state);
   }

   if (current.workflow_state.changesTo('complete')) { 
      current.scheduleScript("SNC Release Complete");
   }
}
