(function executeRule(current, previous /*null when async*/ ) {

    if(!current.assignment_group)
      return;

    if (typeof sn_em_ai.EvtMgmtRuleGroupUtil !== 'undefined') {
        var util = new sn_em_ai.EvtMgmtRuleGroupUtil();
        if (typeof util.isMissingGroup !== 'undefined') {
            if (util.isMissingGroup(current.assignment_group)) {
                current.active = false;
                current.error_msg = 'Assigned group not found';
            }
        }
    } else {
      gs.addErrorMessage(gs.getMessage("Please install latest version of 'Event Management Core' plugin to enable assignment group support on rule."));
      current.setAbortAction(true);
    }

})(current, previous);
