(function refineQuery(current, parent) {

    /* Display groups that can granted access to user based on its subscriptions */

    //Get the list of license sysIDs that contains the application that user has accessed.
    var licSysIdsBasedOnApp = [];
    var licHasFamilyGR = new GlideRecord('license_has_family');
    licHasFamilyGR.addQuery('license_family.family_id', parent.lineage_id);
    licHasFamilyGR.query();
    while (licHasFamilyGR.next())
        licSysIdsBasedOnApp.push(licHasFamilyGR.getValue("license"));


    //get list of role types sys_ids that are equal or higher than the user's accessed entitlement type.
    var higherRoleTypeList = SNC.UsageAnalyticsScriptUtils.getHigherRoleTypes(parent.entitlement_type, true);


    //Get the list of subscriptions sysIDs that can grant access to user based on measured role type
    var licSysIdsBasedOnRoleType = [];
    var licDetailsGR = new GlideRecord('license_details');
    licDetailsGR.addQuery('sys_id', 'IN', licSysIdsBasedOnApp);
    licDetailsGR.query();

    while (licDetailsGR.next()) {
        var measuredRoleTypes = licDetailsGR.getValue("measured_role_types").split(",");
        for (i = 0; i < measuredRoleTypes.length; i++) {
            if (higherRoleTypeList.indexOf(measuredRoleTypes[i]) >= 0)
                licSysIdsBasedOnRoleType.push(licDetailsGR.getValue("sys_id"));
        }
    }

    //get the groups that are mapped to subscriptions that can grant access
    var userGroupSysIDs = [];
    var groupSubscriptionGR = new GlideRecord('license_group_has_subscription');
    groupSubscriptionGR.addQuery('license', 'IN', licSysIdsBasedOnRoleType);
    groupSubscriptionGR.query();
    while (groupSubscriptionGR.next())
        userGroupSysIDs.push(groupSubscriptionGR.getValue("group"));

    current.addQuery('sys_id', 'IN', userGroupSysIDs);
    current.addQuery('active', true);


})(current, parent);
