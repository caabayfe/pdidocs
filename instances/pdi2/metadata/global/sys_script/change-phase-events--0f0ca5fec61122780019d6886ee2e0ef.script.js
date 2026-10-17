if (current.approval.changesTo('approved')) {
  gs.eventQueue("task.approved", current, current.approval, previous.approval);
  updateChange(current, 'Phase ' + current.name.getDisplayValue()+" has been approved");
  activateNextPhase(current, true);
} else if (current.state.changesTo(3)) {
  activateNextPhase(current, false);
}

if (current.approval.changesTo('rejected')) {
  gs.eventQueue("task.rejected", current, current.approval, previous.approval);
  updateChange(current, 'Phase ' + current.name.getDisplayValue()+" has been rejected");
  setChangeState(current, 'rejected');
}

function updateChange(me, journal) {  
  var friends = new GlideRecord('change_request');
  friends.addQuery('sys_id', me.change);
  friends.query();
  while(friends.next()) {       
     friends.approval_history.setJournalEntry(journal);
     friends.update();
  }
}

function updateChangePhase(me, phase) {  
  var journal = 'Phase '+phase+' has been activated';
  var friends = new GlideRecord('change_request');
  friends.addQuery('sys_id', me.change);
  friends.query();
  while(friends.next()) {     
     friends.approval_history.setJournalEntry(journal);
     friends.phase = phase;
     friends.update();
  }
}

function setChangeState(me, state) {
  var change = new GlideRecord('change_request');
  change.addQuery('sys_id', me.change);
  change.query();
  while(change.next()) {    
     change.approval  = state;      
     change.update();
  }
}



function activateNextPhase(me, setRequested) {
  var grNext = new GlideRecord('change_phase');
  grNext.addQuery('order', '>', me.order);
  grNext.addQuery('change', '=', me.change);
  grNext.orderBy('order');
  grNext.query();
  if (grNext.next()) {
     if (grNext.active == false) {
        grNext.active.setValue(true);
     }
     grNext.actual_start_date.setValue(gs.nowDateTime());
     grNext.state.setValue(2);
     if (setRequested == true) {
           if (grNext.auto_request == true) {
                 if (grNext.approval == 'not requested')
                     grNext.approval.setValue('requested');
           }
     }
     grNext.update();
     updateChangePhase(me, grNext.name);        
  } 
}
