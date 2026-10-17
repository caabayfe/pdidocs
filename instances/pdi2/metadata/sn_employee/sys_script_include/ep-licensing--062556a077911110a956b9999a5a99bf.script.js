var ep_Licensing = Class.create();
ep_Licensing.prototype = {
    initialize: function() {},

    /** 
     *  Function to return if there is an active app access record for the user and app name provided
     *  @param {String} appName - app name of Licensed Application (sn_employee_app)
     *  @param {String} userId - user sys_id
     *  @returns Boolean if there is an active app access record, false otherwise
     */
    isUserLicensed: function(appName, userId) {
        var licenseGr = new GlideRecord('sn_employee_app_access');
        if (licenseGr.isValidField('user'))
            return this.isUserLicensedInNewApp(appName, userId);
        licenseGr.addQuery('profile.user', userId);
        licenseGr.addQuery('app.name', appName);
        licenseGr.addActiveQuery();
        licenseGr.query();
        return licenseGr.hasNext();
    },

    /** 
     *  Checks if a user is licensed for a specific application in the new app structure.
     *  @param {String} appName - app name of Licensed Application (sn_employee_app)
     *  @param {String} userId - user sys_id
     *  @returns Boolean if there is an active app access record, false otherwise
     */
    isUserLicensedInNewApp: function(appName, userId) {
        //No employee profile return false
        var empGr = new sn_employee.ep_Utils().getEmployeeProfileRecord(userId);
        if (!empGr || empGr.user.active == false)
            return false;

        var appGr = new GlideRecord('sn_employee_app');
        appGr.addQuery("name", appName);
        appGr.setLimit(1);
        appGr.query();
        //app not found. return false
        if (!appGr.next())
            return false;

        var lastRunTime = appGr.getDisplayValue('last_run_time');
        var gdt = new GlideDateTime();
        gdt.setDisplayValue(lastRunTime);
        var licenseGr = new GlideRecord('sn_employee_app_access');
        licenseGr.addQuery('user', userId);
        licenseGr.addQuery('app.name', appName);
        licenseGr.addQuery('last_granted', '>=', gdt);
        licenseGr.addActiveQuery();
        licenseGr.setLimit(1);
        licenseGr.query();
        if (licenseGr.next())
            return true;

        //Employee record might have not made it in previous schedule job. 
        return this._checkUserSatisfiesCriteria(userId);
    },

    /**
     * Checks if the user satisfies any of the active application access criteria.
     * @param {string} userId - The user's unique identifier.
     * @returns {boolean} - True if the user meets any access criteria, otherwise false.
     */
    _checkUserSatisfiesCriteria: function(userId) {
        var hrProfileCondition = "";
        var empProfileCondition = "";
        var accessGr = new GlideRecord("sn_employee_app_access_criteria");
        accessGr.addQuery("active", true);
        accessGr.query();
        while (accessGr.next()) {
            var tableName = accessGr.getValue("table");
            var criteria = accessGr.getValue("criteria");
            if (tableName == "sn_hr_core_profile")
                hrProfileCondition += (hrProfileCondition ? '^NQ' : '') + criteria;
            else if (tableName == "sn_employee_profile")
                empProfileCondition += (empProfileCondition ? '^NQ' : '') + criteria;
        }
        return this._checkProfileTableCriteria("sn_employee_profile", empProfileCondition, userId) || this._checkProfileTableCriteria("sn_hr_core_profile", hrProfileCondition, userId);
    },

    /**
     * Checks if a user meets the specified criteria for a given table.
     * @param {string} table - The name of the table to query.
     * @param {string} eq - Encoded query string defining the criteria.
     * @param {string} userId - The user's unique identifier.
     * @returns {boolean} - True if the user meets the criteria, otherwise false.
     */
    _checkProfileTableCriteria: function(table, eq, userId) {
        if (!eq || !userId || !table)
            return false;
        var profileGr = new GlideRecord(table);
        profileGr.addEncodedQuery(eq);
        profileGr.addQuery("user", userId);
        profileGr.setLimit(1);
        profileGr.query();
        return profileGr.hasNext();
    },

    type: 'ep_Licensing'
};
