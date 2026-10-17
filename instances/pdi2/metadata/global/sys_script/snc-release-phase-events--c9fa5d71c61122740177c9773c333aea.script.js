global_events(current);

if (current.approval.changesTo('approved')) {
  gs.eventQueue("release.phase.approved", current, current.approval, previous.approval);
  updateProject(current, 'Phase ' + current.name.getDisplayValue()+" has been approved");
  activateNextPhase(current);
} else if (current.state.changesTo(3)) {
  activateNextPhase(current);
}

if (current.approval.changesTo('rejected')) {
  gs.eventQueue("release.phase.rejected", current, current.approval, previous.approval);
  updateProject(current, 'Phase ' + current.name.getDisplayValue()+" has been rejected");
  setReleaseState(current, 'rejected');
}

function updateProject(me, journal) {  
  var friends = new GlideRecord('release_project');
  friends.addQuery('sys_id', me.release);
  friends.query();
  while(friends.next()) {       
     friends.release_history.setJournalEntry(journal);
     friends.update();
  }
}

function activateNextPhase(me) {
  gs.eventQueue("release.phase.complete", current, current.name, current.name);
  var grNext = new GlideRecord('release_phase');
  grNext.addQuery('order', '>', me.order);
  grNext.addQuery('release', '=', me.release);
  grNext.addQuery('name', '!=', 'back out');
  grNext.orderBy('order');
  grNext.query();
  if (grNext.next()) {
     if (grNext.active == false) {
        grNext.active.setValue(true);
        grNext.actual_start_date.setValue(gs.nowDateTime());
        grNext.state.setValue(2);
        grNext.update();
        updateProject(me, 'Phase ' + grNext.name.getDisplayValue()+" has been activated");
        var phase = grNext.name;
        if (phase == 'deploy')
           setReleaseState(current, 'launch');
        if (phase == 'accept')
           setReleaseState(current, 'testing');
     }
  } else {
     setReleaseState(current, 'complete');
  }
}

function setReleaseState(me, state) {
  var rls = new GlideRecord('release_project');
  rls.addQuery('sys_id', me.release);
  rls.query();
  while(rls.next()) {       
     rls.workflow_state.setValue(state);
     rls.update();
  }
}
