(function executeRule(current, previous /*null when async*/ ) {

    var findingProcessTable = '',
        findingConfigType = current.finding_chain.finding_def.type.getValue();

    if (findingConfigType == "PROCESS") {
        findingProcessTable = current.finding_chain.finding_def.process_def.table.getValue();
    }
    g_scratchpad.findingConfigType = findingConfigType;
    g_scratchpad.findingProcessTable = findingProcessTable;
	g_scratchpad.findingDefSysId = current.finding_chain.finding_def.getValue();
	chain = current.finding_chain.getValue();
	if (chain) {
        var grRule = new GlideRecord("promin_finding_def_rule");
        grRule.addQuery('finding_chain', chain);
        grRule.orderByDesc('sequence');
        grRule.query();
        if (grRule.next()) {
            g_scratchpad.maxSequenceForRule = grRule.sequence;
        } else {
            g_scratchpad.maxSequenceForRule = 0;
        }
    }

})(current, previous);
