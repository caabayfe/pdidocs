var ep_secondaryManagerRelationUtilsSNC = Class.create();
ep_secondaryManagerRelationUtilsSNC.prototype = {
    initialize: function() {},


    /* Description: Returns true if the given manager is the secondary manager to the employee
     *  @param {String} empID - user sys_id of employee
     *  @param {String} secondaryManagerID - user sys_id of secondary manager
     *  @returns {Boolean} - returns true if the given manager is the secondary manager to the employee   
     */
    isSecondaryManager: function(empID, secondaryManagerID) {
        if (gs.nil(empID) || gs.nil(secondaryManagerID)) 
            return false;

        var secondaryManagerRelGr = new GlideRecordSecure("sn_employee_secondary_manager_relationship");
        secondaryManagerRelGr.addQuery("secondary_manager.user", secondaryManagerID);
        secondaryManagerRelGr.addQuery("employee.user", empID);
        secondaryManagerRelGr.query();
        return secondaryManagerRelGr.hasNext();
    },

    /* Description : Returns the user sys_ids of all the secondary reportees of the given secondary manager
     *  @param {String} secondaryManagerID - user sys_id of secondary manager
     *  @returns {Array} - returns array of user sys_ids of secondary reportees 
     */

    getSecondaryReporteeIds: function(secondaryManagerID) {
        if (gs.nil(secondaryManagerID)) 
            return [];
	var secondaryReporteesIds = [];
        var secondaryManagerRelGr = new GlideRecordSecure("sn_employee_secondary_manager_relationship");
        secondaryManagerRelGr.addQuery("secondary_manager.user", secondaryManagerID);
        secondaryManagerRelGr.addQuery("employee.user.active", true);
        secondaryManagerRelGr.query();
        while (secondaryManagerRelGr.next()) {
            secondaryReporteesIds.push(secondaryManagerRelGr.employee.user);
        }
        return secondaryReporteesIds;
    },


    verifyCyclicReporting: function(current, user, isCyclic) {
        // race condition to exit.
        if (isCyclic) {
            return true;
        }
        // recursively check for cyclic.
        var secManagerGr = new GlideRecord(current.getTableName());
        secManagerGr.addQuery("employee", current.getValue("secondary_manager"));
        secManagerGr.query();
        if (secManagerGr.next()) {
            if (secManagerGr.getValue("secondary_manager") == user) {
                isCyclic = true;
            } else {
                return this.verifyCyclicReporting(secManagerGr, user, isCyclic);
            }
        } else {
            return false;
        }
        return isCyclic;
    },

    type: 'ep_secondaryManagerRelationUtilsSNC'
};
