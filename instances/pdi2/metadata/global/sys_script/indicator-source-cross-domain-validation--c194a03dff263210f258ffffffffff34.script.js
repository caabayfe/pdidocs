(function executeRule(current, previous /*null when async*/ ) {
    if (!new SNC.PADomainUtils().isDomainAccessible(current.sys_domain)) {
        gs.addErrorMessage(gs.getMessage("Action could not be completed due to insufficient domain permissions."));
        current.setAbortAction(true);
    }

})(current, previous);
