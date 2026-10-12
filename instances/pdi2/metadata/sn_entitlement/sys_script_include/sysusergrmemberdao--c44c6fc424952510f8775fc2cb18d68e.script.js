var SysUserGrmemberDAO = Class.create();
SysUserGrmemberDAO.prototype = {
    initialize: function() {
        this.logger = new LoggingUtil();
        this.licensingEngineCommonUtil = new LicensingEngineCommonUtil();
    },

    // returns an array of sys_ids of the groups associated with the given user
    getUserGroups: function(userId) {
        var groupIds = [];
        var grmemberGR = new GlideRecord(LicensingEngineDBConstants.SYS_USER_GRMEMEBER);
        grmemberGR.addQuery(LicensingEngineDBConstants.USER, userId);
        grmemberGR.query();
        while (grmemberGR.next())
            groupIds.push(grmemberGR.getValue((LicensingEngineDBConstants.GROUP)));
        return groupIds;
    },

    /**
     * Get unique set of users belonging to the groups
     * 
     * @param {array} the list of the group sysId 
     */
    getUsersByGroupIds: function(groupIds) {
        const userSysIds = new Set();
        const grmemberGR = new GlideRecord(LicensingEngineDBConstants.SYS_USER_GRMEMEBER);
        grmemberGR.addQuery('group.sys_id', 'IN', groupIds);
        this.licensingEngineCommonUtil.addSysUserActiveFilter(grmemberGR, "user");
        grmemberGR.query();

        while (grmemberGR.next())
            userSysIds.add(String(grmemberGR.user.sys_id));
        return userSysIds;
    },

    /**
     * Get unique set of users belonging to the group
     * 
     * @param {array} the list of the group sysId 
     */
    getUsersByGroupId: function(groupId) {
        const userSysIds = new Set();
        const grmemberGR = new GlideRecord(LicensingEngineDBConstants.SYS_USER_GRMEMEBER);
        grmemberGR.addQuery('group.sys_id', groupId);
        this.licensingEngineCommonUtil.addSysUserActiveFilter(grmemberGR, "user");
        grmemberGR.query();

        while (grmemberGR.next())
            userSysIds.add(String(grmemberGR.user.sys_id));
        return userSysIds;
    },

    /**
     * Get unique set of users belonging to the groups
     * 
     * @param {array} the list of the group sysId 
     * @param {array} the list of the user sysId 
     * 
     * @return {array} list of unique user sysIds which belongs to atleast one or more of the input list of groups
     */
    getUsersBelongingToGroups: function(groupSysIds, userSysIds) {
        const userResultSet = new Set();
        groupSysIds.forEach((groupId) => {
            const grmemberGR = new GlideRecord(LicensingEngineDBConstants.SYS_USER_GRMEMEBER);
            grmemberGR.addQuery('group.sys_id', groupId);
            grmemberGR.query();
            while (grmemberGR.next()) {
                if (userSysIds.has(String(grmemberGR.user.sys_id)))
                    userResultSet.add(String(grmemberGR.user.sys_id));
            }
        });

        return userResultSet;
    },

    type: 'SysUserGrmemberDAO'
};
