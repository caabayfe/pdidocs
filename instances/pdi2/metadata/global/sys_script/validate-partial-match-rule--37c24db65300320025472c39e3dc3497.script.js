(function executeRule(current, previous) {
    if (!new GlideTSUtil().isPartialMatchRuleValid(current.partial_match_rule)) {
        current.partial_match_rule.setError('Invalid Partial Match Rule');
        current.setAbortAction(true);
    }
})(current, previous);
