(function executeRule(current, previous /*null when async*/ ) {

    gs.eventQueue(EFConstants.EVENT_NAMES.ACTION_STANDARD, current, gs.getUserID());

})(current, previous);
