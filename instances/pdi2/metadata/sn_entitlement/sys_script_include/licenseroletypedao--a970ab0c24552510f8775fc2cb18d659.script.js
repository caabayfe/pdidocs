var LicenseRoleTypeDAO = Class.create();
LicenseRoleTypeDAO.prototype = {
    initialize: function() {},

    // returns an array of role types sys_ids that have equal or high privileges than given role type
    getRoleTypesWithEqualOrHighPrivileges: function(roleType) {
        var resultRoleTypeSysIds = [];
        var roleTypeGR = new GlideRecord(LicensingEngineDBConstants.LICENSE_ROLE_TYPE);
        roleTypeGR.addActiveQuery();
        roleTypeGR.orderByDesc(LicensingEngineDBConstants.ORDER);
        roleTypeGR.query();
        while (roleTypeGR.next()) {
            var queriedRoleType = roleTypeGR.getValue(LicensingEngineDBConstants.ID);
            var queriedRoleTypeSysId = roleTypeGR.getValue(LicensingEngineDBConstants.SYS_ID);
            if (queriedRoleType === roleType)
                resultRoleTypeSysIds.push(queriedRoleTypeSysId);

            else if (resultRoleTypeSysIds.length > 0)
                resultRoleTypeSysIds.push(queriedRoleTypeSysId);
        }
        return resultRoleTypeSysIds;
    },

    type: 'LicenseRoleTypeDAO'
};
