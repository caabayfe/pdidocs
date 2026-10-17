//
// If state changes to complete, then mark release inactive
//
if (current.workflow_state.changesTo('complete')) {
   current.active.setValue(false);
   current.actual_end_date.setValue(gs.nowDateTime());
}
