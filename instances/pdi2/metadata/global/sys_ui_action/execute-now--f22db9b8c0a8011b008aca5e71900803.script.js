if (current.state == 0) {
   // we're currently in a ready state
   current.next_action.setDateNumericValue(0);
   current.claimed_by = '';
   current.update();
}
