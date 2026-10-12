var SysUserDAO = Class.create();
SysUserDAO.prototype = {
    initialize: function() {},

    // returns sys_id of the user record from userId (that can be either user_name or sys_id directly)
    // for instance, userId can be 'abel.tuter' or '62826bf03710200044e0bfc8bcbe5df1', in both the cases return
    // string will be '62826bf03710200044e0bfc8bcbe5df1'
    getUserSysId: function(userId) {
        var userGR = new GlideRecord(LicensingEngineDBConstants.SYS_USER);
        var qc = userGR.addQuery(LicensingEngineDBConstants.SYS_ID, userId);
        qc.addOrCondition(LicensingEngineDBConstants.USER_NAME, userId);
        userGR.addActiveQuery();
        userGR.query();
        if (userGR.next())
            return userGR.getValue(LicensingEngineDBConstants.SYS_ID);
        return null;
    },

    type: 'SysUserDAO'
};
