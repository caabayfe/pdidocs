(function executeRule(current, previous /*null when async*/ ) {
    var url = gs.action.getGlideURI().toString();
    if (url && url.indexOf('sn_nb_action_condition_based_rule_list') != -1) {
        gs.addInfoMessage(gs.getMessage('New rules can only be created from context records.'));
    }
})(current, previous);
