if (current.approval.changesTo('approved')) {
   current.actual_end_date.setValue(gs.nowDateTime());
   current.state.setValue(3);
} else if (current.state.changesTo(3))
   current.actual_end_date.setValue(gs.nowDateTime());


if (current.approval.changesTo('rejected')) {
   current.actual_end_date.setValue(gs.nowDateTime());
   current.state.setValue(4);
}
