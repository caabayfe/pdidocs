var SOWITSMCommonUtilsSNC = Class.create();
SOWITSMCommonUtilsSNC.prototype = {
    initialize: function() {},
    TABLES: {
        SYS_USER_GRMEMBER: 'sys_user_grmember'
    },

    getMemberGroups: function(userSysID, setlimit) {
        var memberGroups = [];
        var grMembers = new GlideRecord(this.TABLES.SYS_USER_GRMEMBER);
        grMembers.addQuery('group.active', 'true');
        grMembers.addQuery('user', userSysID);
        if (setlimit)
            grMembers.setLimit(setlimit);
        grMembers.query();
        while (grMembers.next()) {
            memberGroups.push(grMembers.group.sys_id);
        }
        return memberGroups;
    },

    canAssignToMe: function(current) {
        var currentTable = current.getTableName();
        var arrayUtil = new global.ArrayUtil();
        var allowedTables = ["problem", "incident", "change_request", "problem_task", "sc_task"];
        if (!arrayUtil.contains(allowedTables, currentTable))
            return false;
        if (!current.active && !current.isNewRecord())
            return false;
        if (!this._checkRolesForAssignment(currentTable))
            return false;
        if (!current.assigned_to.canWrite())
            return false;
        if (current.assigned_to)
            return false;
        return current.assignment_group.nil() || gs.getUser().isMemberOf(current.assignment_group.toString());
    },

    canAssignToMeOnList: function(current) {
        var currentTable = current.getTableName();
        var arrayUtil = new global.ArrayUtil();
        var allowedTables = ["problem", "incident", "change_request"];
        if (!arrayUtil.contains(allowedTables, currentTable))
            return false;
        if (!this._checkRolesForAssignment(currentTable))
            return false;
        return true;
    },

    _checkRolesForAssignment: function(currentTable) {
        if (currentTable === "problem" && !gs.hasRole('problem_coordinator'))
            return false;
        if (currentTable === "incident" && !gs.hasRole('itil') && !gs.hasRole('sn_incident_write'))
            return false;
        if (currentTable === "change_request" && !gs.hasRole('itil') && !gs.hasRole('sn_change_write'))
            return false;
        if (currentTable === "problem_task" && !gs.hasRole('problem_task_analyst'))
            return false;
        if (currentTable === "sc_task" && !gs.hasRole('itil') && !gs.hasRole('sn_request_write'))
            return false;		
        return true;
    },

    type: 'SOWITSMCommonUtilsSNC'
};
