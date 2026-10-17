(function executeRule(current, previous /*null when async*/) {

	var currDomain = new EvtMgmtCommons().getCurrentDomainID();
	
	var includedDomains = gs.getProperty("sa_analytics.included_domains_for_filter","");
	includedDomains = includedDomains.split(',');
	// Always include "global" domain
	includedDomains.push('global');
		
	includedDomains = includedDomains.filter(function(s) { return s }).join(',');
	
	if( ! includedDomains.includes(currDomain) ){
		gs.addErrorMessage(gs.getMessage("Users from this domain are not allowed to make changes in filters"));
		current.setAbortAction(true);
	}
})(current, previous);
