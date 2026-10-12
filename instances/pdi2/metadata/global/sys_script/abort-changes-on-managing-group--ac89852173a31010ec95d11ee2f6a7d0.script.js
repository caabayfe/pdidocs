(function executeRule(current, previous /*null when async*/ ) {

    var ownedBy = current.owned_by;
    var owningGroup = current.managed_by_group;


    var grp = new GlideRecord('sys_user_grmember');
    grp.addQuery('group.sys_id', owningGroup);
    grp.addQuery('user', ownedBy);
    grp.query();

    if (!grp.hasNext()) {
        gs.addErrorMessage(gs.getMessage("Owned by {0} must be member of Managed By Group {1} ", [ownedBy.getDisplayValue(), owningGroup.getDisplayValue()]));
        current.setAbortAction(true);
    }

})(current, previous);
