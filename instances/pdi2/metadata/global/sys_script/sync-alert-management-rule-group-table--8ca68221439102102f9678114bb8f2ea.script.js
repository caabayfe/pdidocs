(function executeRule(current, previous /*null when async*/ ) {
      
      // EvtMgmtRuleGroupUtil is part of stored app (sn_em_ai) and it will not be present in older version of app.
      // Checking here if the script exists before calling the sync function.
      if (typeof sn_em_ai.EvtMgmtRuleGroupUtil !== 'undefined') {
        var evtMgmtRuleGroupUtil = new sn_em_ai.EvtMgmtRuleGroupUtil();
        if (typeof evtMgmtRuleGroupUtil.syncGroupAssignmentTableRecord !== 'undefined')
        evtMgmtRuleGroupUtil.syncGroupAssignmentTableRecord(current.sys_id, current.assignment_group, "em_alert_management_rule_group");
      }
      
})(current, previous);
