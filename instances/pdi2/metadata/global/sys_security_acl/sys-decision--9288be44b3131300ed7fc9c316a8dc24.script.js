answer = true;

var decisionDomain = current.getValue('sys_domain');

if (decisionDomain && decisionDomain != GlideDomainSupport.getCurrentDomainValueOrGlobal()) {
    answer = false;
}

if (gs.getProperty('com.glide.decision_table.gate_feature') == 'true' && !(gs.hasRole('maint'))) {
    answer = false;
}
