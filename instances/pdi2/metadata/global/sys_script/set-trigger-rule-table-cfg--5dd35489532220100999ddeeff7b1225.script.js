(function executeRule(current, previous /*null when async*/ ) {

    var triggerRuleTableCfgSysId = new TriggerRuleUtil().getTriggerConfigSysId(current.table);
    if (triggerRuleTableCfgSysId)
        current.trigger_rule_table_cfg = triggerRuleTableCfgSysId;

})(current, previous);
