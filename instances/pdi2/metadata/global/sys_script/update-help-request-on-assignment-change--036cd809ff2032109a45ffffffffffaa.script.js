(function executeRule(current, previous /*null when async*/ ) {
    new global.InteractionHelpRequestUtil().cancelHelpRequest(current, previous.assigned_to);
})(current, previous);
