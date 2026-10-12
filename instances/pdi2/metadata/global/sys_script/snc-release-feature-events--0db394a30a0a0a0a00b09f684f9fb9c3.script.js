// create release feature 
 
var name = 'release_feature';
simple_events(current);

if (!current.assigned_to.nil() && current.assigned_to.changes()) {
   gs.eventQueue(name + ".assigned", current, current.assigned_to.getDisplayValue(), 
                   previous.assigned_to.getDisplayValue());
}


/**

if (current.active.changesTo(false)) {
   gs.eventQueue(name + ".inactive", current, current.incident_state, previous.incident_state);
	

}

**/


if (current.workflow_state.changes()) {
   gs.eventQueue(name + ".state.change", current, current.workflow_state, previous.workflow_state);
}

if (current.percent_complete == 100) {
   gs.eventQueue(name + ".complete", current, current.percent_complete, previous.percent_complete);
}


// do the inserted, updated events
function simple_events(current) {
 var name = 'release_feature';

 if (current.operation() == 'insert') {
  gs.eventQueue(name + ".inserted", current, gs.getUserID(), gs.getUserName());
 }

 if (current.operation() == 'update') {
  gs.eventQueue(name +".updated", current, gs.getUserID(), gs.getUserName());
 }
}
