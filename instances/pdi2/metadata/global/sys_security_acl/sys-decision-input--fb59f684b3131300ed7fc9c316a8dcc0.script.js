answer = true;

if (parent.getValue("sys_domain") != GlideDomainSupport.getCurrentDomainValueOrGlobal())
	answer = false;

if (gs.getProperty('com.glide.decision_table.gate_feature') == 'true' && !(gs.hasRole('maint')))
	answer = false;
