(function executeRule(current, previous /*null when async*/ ) {
    var portalExtensibleNavigation = new sn_ex_sp.PortalExtensibleNavigationUtil();
    var isActiveFieldChanged = current.active != previous.active;
    if (portalExtensibleNavigation.getActivePortalNavRecord(current.portal) && isActiveFieldChanged) {
        current.setAbortAction(true);
        gs.addErrorMessage(gs.getMessage("Only one Advanced portal navigation record can be active per portal. It looks like there's another one already active for {0}. If you want to activate this record, please deactivate the other one first.", current.getDisplayValue('portal')));
    }
})(current, previous);
