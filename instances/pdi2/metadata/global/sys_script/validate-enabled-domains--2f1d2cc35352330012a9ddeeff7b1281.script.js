(function executeRule(current, previous /*null when async*/ ) {
    gs.clearMessages();
    var currentDomainTable = current.getTableName();
    var currentDomainGr = new GlideRecord(currentDomainTable);
    var domainTable = GlideDomainSupport.getDomainTable();
    var gr = new GlideRecord(domainTable);
	
	//check current domain
    gr.initialize();
    gr.get(current.getValue('sys_domain'));
    if (!gr.isValidRecord()) {
        gs.addErrorMessage(gs.getMessage("Domain '{0}' cannot be found in domain table [{1}]. Please 'Refresh Domains' and try again.", current.getDisplayValue('domain'), domainTable));
        current.setAbortAction(true);
        return;
    }
	
    //check its parents
    var currentDomain = current.sys_domain;
    while (!gs.nil(currentDomain.parent) && currentDomain.parent.toString() !== currentDomain.toString()) {
        var parent = currentDomain.parent;
        //check domains which are active
        if (!parent.isValidField('active') || parent.active) {
            currentDomainGr.initialize();
            currentDomainGr.addQuery('sys_domain', parent.toString());
            currentDomainGr.query();
            if (!currentDomainGr.next()) {
                //domain record may not exist because
                //  1. domain asset process setting table is not sync'ed with domain table, so 'Refresh Domains'
                //  2. user is on form view and record domain is used, and user is not able to see parent domain, so 'Toggle Domain Scope'
                gs.addErrorMessage(gs.getMessage("'Refresh Domains' and 'Toggle Domain Scope' before performing this action."));
                current.setAbortAction(true);
                return;
            } else {
                if (currentDomainGr.run_asset_process) {
                    gs.addErrorMessage(gs.getMessage("Parent domain '{0}' in your domain hierarchy is set to true, please disable it first. Cannot run Software Asset Management processes simultaneously at both parent and child level.", parent.getDisplayValue()));
                    current.setAbortAction(true);
                    return;
                }
            }
        }
        //we always move to parent even if it is not active, because we need to check its grandparent which still has visibility to grandchild
        currentDomain = parent;
    }
	
    //check its children using BFS
    var enabledChildren = [];
    var q = [];
    q.push(current.sys_domain.toString());
    while (q.length !== 0) {
        var currentDomainSysId = q.shift();
        gr.initialize();
        gr.addQuery('parent', currentDomainSysId);
        gr.query();
        while (gr.next()) {
            //we always add child even if it is not active, because we need to check its grandchild which is still visible to grandparent
            q.push(gr.getUniqueValue());
            //check domains which are active
            if (!gr.isValidField('active') || gr.active) {
                currentDomainGr.initialize();
                currentDomainGr.addQuery('sys_domain', gr.getUniqueValue());
                currentDomainGr.query();
                if (!currentDomainGr.next()) {
                    gs.addErrorMessage(gs.getMessage("Domain '{0}' cannot be found in domain table [{1}]. Please 'Refresh Domains' and try again.", gr.getDisplayValue(), currentDomainTable));
                    current.setAbortAction(true);
                    return;
                } else {
                    if (currentDomainGr.run_asset_process) {
                        enabledChildren.push(gr.getDisplayValue());
                    }
                }
            }
        }
    }
	if (enabledChildren.length === 1) {
		gs.addErrorMessage(gs.getMessage("Child domain '{0}' in your domain hierarchy is set to true, please disable it first. Cannot run Software Asset Management processes simultaneously at both parent and child level.", enabledChildren[0]));
		current.setAbortAction(true);
	} else if (enabledChildren.length > 1) {
		gs.addErrorMessage(gs.getMessage("More than one child domains in your domain hierarchy are set to true, please disable them first. Cannot run Software Asset Management processes simultaneously at both parent and child level."));
		current.setAbortAction(true);
	}
})(current, previous);
