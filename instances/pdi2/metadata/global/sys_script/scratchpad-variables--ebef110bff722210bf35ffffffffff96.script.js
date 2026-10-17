(function executeRule(current, previous /*null when async*/ ) {

    findingDef = current.finding_def.getValue();
    if (findingDef) {
        var grChain = new GlideRecord("promin_finding_def_chain");
        grChain.addQuery('finding_def', findingDef);
        grChain.orderByDesc('chain');
        grChain.query();
        if (grChain.next()) {
            g_scratchpad.existingRuleMaxChainNumber = grChain.chain;
        } else {
            g_scratchpad.existingRuleMaxChainNumber = 0;
        }
    }

})(current, previous);
