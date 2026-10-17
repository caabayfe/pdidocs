var EP_MyTeamsUtilsSNC = Class.create();
EP_MyTeamsUtilsSNC.prototype = {
    initialize: function() {},

    /**
     * Checks if EC Pro is installed
     * returns {Boolean} 
     */
    isECProInstalled: function() {
        return GlidePluginManager().isActive("sn_ex_sp_pro");
    },

    /**
     * Checks if instance is entitled for Dotted Relationship
     * returns {Boolean} 
     */
    isEntitled: function() {
        return this.isECProInstalled();
    },

    /**
     * Returns Employee Profile Record of the given user
     * @param {GlideRecord} userGr - GlideRecord of a user
     * returns {GlideRecord}
     */
    getEmpProfileRecord: function(userGr) {
        var empProfileGR = new GlideRecord('sn_employee_profile');
        empProfileGR.addQuery("user", userGr.getUniqueValue());
        empProfileGR.query();
        empProfileGR.next();
        return empProfileGR;
    },

    /**
     * Returns manager of the given user
     * @param {GlideRecord} userGr - GlideRecord of a user
     * returns {GlideRecord}
     */
    getManager: function(userGr) {
        var mgr = userGr.getValue('manager');
        if (mgr) {
            var gr = new GlideRecord('sys_user');
            if (gr.get(mgr))
                return gr;
        }
    },

    /**
     * Returns unique dotted Managers of the given user
     * @param {GlideRecord} userGr - GlideRecord of a user
     * returns {Array}{GlideRecord}
     */
    getDottedManagers: function(userGr) {
        if (!this.isEntitled())
            return;
        var empProfileGR = this.getEmpProfileRecord(userGr);
        var secondaryRelationshipGA = new GlideAggregate("sn_employee_secondary_manager_relationship");
        secondaryRelationshipGA.addQuery("employee", empProfileGR.getUniqueValue());
        secondaryRelationshipGA.addAggregate("COUNT", "secondary_manager");
        secondaryRelationshipGA.addNotNullQuery("secondary_manager");
        secondaryRelationshipGA.groupBy("secondary_manager");
        secondaryRelationshipGA.orderBy("secondary_manager");
        secondaryRelationshipGA.query();
        return secondaryRelationshipGA;
    },

    /**
     * Returns team members of the given user
     * @param {GlideRecord} userGr - GlideRecord of a user
     * returns {Array}{GlideRecord}
     */
    getTeamMembers: function(userGr) {
        var teamGR = new GlideRecord("sys_user");
        teamGR.addActiveQuery();
        teamGR.orderBy("name");
        teamGR.addQuery("manager", userGr.getValue('manager'));
        teamGR.addQuery("sys_id", "!=", userGr.getUniqueValue());
        teamGR.addNotNullQuery("manager");
        teamGR.query();
        return teamGR;
    },

    /**
     * Returns direct reportees of the given user
     * @param {GlideRecord} userGr - GlideRecord of a user
     * returns {Array}{GlideRecord}
     */
    getDirectReports: function(userGr) {
        var directReportGR = new GlideRecord("sys_user");
        directReportGR.addActiveQuery();
        directReportGR.orderBy("name");
        directReportGR.addQuery("manager", userGr.getUniqueValue());
        directReportGR.query();
        return directReportGR;
    },

    /**
     * Returns unique dotted reportees of the given user
     * @param {GlideRecord} userGr - GlideRecord of a user
     * returns {Array}{GlideRecord}
     */
    getDottedReports: function(userGr) {
        if (!this.isEntitled())
            return;
        var empProfileGR = this.getEmpProfileRecord(userGr);
        var dottedReportGA = new GlideAggregate("sn_employee_secondary_manager_relationship");
        dottedReportGA.addAggregate("COUNT", "employee");
        dottedReportGA.addQuery("secondary_manager", empProfileGR.getUniqueValue());
        dottedReportGA.addNotNullQuery("employee");
        dottedReportGA.groupBy("employee");
        dottedReportGA.orderBy("employee");
        dottedReportGA.query();
        return dottedReportGA;
    },

    /* 
    	Param : current,
    	Type : {
    	selected_user : sys_id of the User record for current record context,
    	logged_inP_user : sys_id of the current logged in user
    	},
    	Returns : current selected user manager sys_id
    */
    getCurrentUserManager: function(current) {
        var currentUser = current.manual_user || current.selected_user || current.logged_in_user;
        var userRecord = new GlideRecord('sys_user');
        if (userRecord.get(currentUser)) {
            var managerGR = this.getManager(userRecord);
            if (managerGR) return managerGR.sys_id
        } else return null;
    },

    /*
     * This method builds query string to pull users based on their roles
     * @param roleBasedUsers - Users with roles
     * @param noRoleUsers - Users without roles
     * 
     * Returns : query string
     */

    roleBasedEmployeeProfileQuery: function(roleBasedUsers, noRoleUsers) {
        var query = '';
        if (roleBasedUsers.length > 0) {
            query = 'suhr_sys_idIN' + roleBasedUsers;
        }
        if (query.length > 0) {
            query = query + '^OR';
        }
        if (noRoleUsers.length > 0) {
            query = query + 'sysuser_sys_idIN' + noRoleUsers;
        }

        return query;
    },

    /* 
    	Param : current,
    	Type : {
    	selected_user : sys_id of the User record for current record context,
    	logged_inP_user : sys_id of the current logged in user
    	},
    	Returns : array of sys ids from sys_user table for users, who share the same manager
    */
    getCurrentUserCoworkers: function(current) {
        var currentUser = current.manual_user || current.selected_user || current.logged_in_user;
        var currentUserRecord = new GlideRecord('sys_user');
        if (currentUserRecord.get(currentUser)) {
            var roleBasedCoworkers = [],
                noRoleCoworkers = [];
            var coworkerGR = this.getTeamMembers(currentUserRecord);
            while (coworkerGR.next()) {

                //DEF0462437: As part this defect we supported role based employee definition
                //but it caused regression in coworkers and direct reportees. This change is
                //to fix the regression.
                var userId = coworkerGR.getValue('sys_id');
                var userRoleGr = new GlideRecord('sys_user_has_role');
                userRoleGr.addQuery('user', userId);
                userRoleGr.query();
                if (userRoleGr.next()) {
                    roleBasedCoworkers.push(userRoleGr.getValue('sys_id'));
                } else {
                    noRoleCoworkers.push(userId);
                }
            }

            return this.roleBasedEmployeeProfileQuery(roleBasedCoworkers, noRoleCoworkers);
        } else return [];
    },

    /* 
        Param : current,
        Type : {
        selected_user : sys_id of the User record for current record context,
        logged_inP_user : sys_id of the current logged in user
        },
        Returns : array of sys ids from sys_user table for users, for whom current user is the manager
    */
    getCurrentUserReports: function(current) {
        var currentUser = current.manual_user || current.selected_user || current.logged_in_user;
        var noRoleReportees = [],
            roleBasedReportees = [];
        var userGR = new GlideRecord('sys_user');
        if (userGR.get(currentUser)) {
            var reportsGR = this.getDirectReports(userGR);
            while (reportsGR.next()) {

                //DEF0462437: As part this defect we supported role based employee definition
                //but it caused regression in coworkers and direct reportees. This change is
                //to fix the regression.
                var userId = reportsGR.getValue('sys_id');
                var userRoleGr = new GlideRecord('sys_user_has_role');
                userRoleGr.addQuery('user', userId);
                userRoleGr.query();
                if (userRoleGr.next()) {
                    roleBasedReportees.push(userRoleGr.getValue('sys_id'));
                } else {
                    noRoleReportees.push(userId);
                }
            }

            return this.roleBasedEmployeeProfileQuery(roleBasedReportees, noRoleReportees);
        } else return [];

    },
    type: 'EP_MyTeamsUtilsSNC'
};
