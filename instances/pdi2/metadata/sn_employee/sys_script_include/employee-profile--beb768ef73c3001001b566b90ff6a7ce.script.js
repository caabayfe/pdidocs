var employee_profile = Class.create();


employee_profile.prototype = {
    initialize: function(_gr, _gs) {
        this._gr = _gr;
        this._gs = _gs || gs;
    },


    /**
     * Tests for if sys_user record has a matching employee profile.
     *
     * @param userId sys_id field of user
     * @return true if an sn_employee_profile record exists for this userId , false otherwise
     */
    userHasEmployeeProfile: function(userId) {
        if (this.getCurrentEmployeeProfile(userId))
            return true;
        else
            return false;
    },

    /**
     * Returns matching employee profile for the sys_user sys_id.
     *
     * @param userId sys_id field of user
     * @return empl0yee profile glide record , null otherwise
     */
    getCurrentEmployeeProfile: function(userId) {
        if (!userId)
            return null;

        var employeeGR = new GlideRecord('sn_employee_profile');
        employeeGR.addQuery("user", userId);
        employeeGR.query();
        if (employeeGR.next())
            return employeeGR;
        else
            return null;
    },

    /**
     * Tests for if sys_user record has a matching employee profile.
     *
     * @param userId sys_id field of user
     * @return true if an sn_employee_profile record exists for this userId and teh current user can read the same , false otherwise
     */
    canViewEmployeeProfile: function(userId) {
        if (!userId)
            return null;

        var employeeGR = this.getCurrentEmployeeProfile(userId);
        if (employeeGR && employeeGR.canRead())
            return true;
        else
            return false;
    },

    createNewProfile: function(userId, start_date, end_date, work_phone, work_mobile, location_type, position_type) {
        var employeeGR = new GlideRecord('sn_employee_profile');
        employeeGR.initialize();
        employeeGR.user = userId;
        employeeGR.employment_start_date = start_date;
        employeeGR.employment_end_date = end_date;
        employeeGR.work_phone = work_phone;
        employeeGR.work_mobile = work_mobile;
        employeeGR.location_type = location_type;
        employeeGR.position_type = position_type;
        var success = employeeGR.insert();
        if (!success)
            gs.error('Error inserting an employee profile record for userId' + userId + ' : employee_profile:createNewProfile()');

    }
};
