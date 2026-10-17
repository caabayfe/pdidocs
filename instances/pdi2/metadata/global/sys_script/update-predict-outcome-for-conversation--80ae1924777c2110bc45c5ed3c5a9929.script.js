(function executeRule(current, previous /*null when async*/ ) {
    var sys_id = current.sys_id;
    var state = current.state;
    new NluPredictOutcomeUtils().updateNluOutcomeOnConversationEnd(sys_id, state);
})(current, previous);
