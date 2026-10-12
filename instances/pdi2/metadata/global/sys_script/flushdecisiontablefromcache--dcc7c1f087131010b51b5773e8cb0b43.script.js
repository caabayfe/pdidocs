(function executeRule(current, previous /*null when async*/ ) {
    if (current.decision_table)
        new AuthPolicyDecisionTableUtil().flushDecisionTableFromCache(current.decision_table);
})(current, previous);
