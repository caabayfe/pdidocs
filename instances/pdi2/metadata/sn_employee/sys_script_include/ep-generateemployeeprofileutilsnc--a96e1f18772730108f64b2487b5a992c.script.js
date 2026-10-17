var ep_generateEmployeeProfileUtilSNC = Class.create();
ep_generateEmployeeProfileUtilSNC.prototype = {
    initialize: function() {
        this.DOMAIN_PLUGIN_ID = "com.glide.domain.msp_extensions";
        this.isDomainSeparationActive = GlidePluginManager.isActive(this.DOMAIN_PLUGIN_ID);
        this.employeeProfileUtils = new sn_employee.ep_Utils();
        this.currentDomainID = gs.getSession().getCurrentDomainID() || 'global';
    },

    /*
     * Determines if the scheduled job "Generate Employee Profiles from Users" should run or not
     * @parm: GlideRecord - sysauto_script
     * @return boolean
     */
    shouldJobRun: function(jobGR) {
        var jobId = jobGR.getUniqueValue();

        if (jobId === ep_Constants.JOB_GENERATE_PROFILES_FROM_USERS && this.isDomainSeparationActive)
            return false;

        if (jobId === ep_Constants.JOB_DOMAIN_GENERATE_PROFILES_FROM_USERS && !this.isDomainSeparationActive)
            return false;

        return true;
    },

    /**
     * Returns the glide record indicating the latest employee definition
     * returns {GlideRecord} 
     */
    getCurrentDefinition: function() {
        return this.employeeProfileUtils.getCurrentDefinition();
    },

    /**
     * Creates employee profile records for users who satisfy the active employee definition.
     * @return Integer - number of employee profile created
     */
    createEmployeeProfilesFromUsers: function() {
        var count = 0;

        var currentDefinition = this.isDomainSeparationActive ? this.employeeProfileUtils.getCurrentDefinitionInDomainByTable(this.currentDomainID,'sys_user') : this.employeeProfileUtils.getCurrentDefinitionByTable('sys_user');
        if (!currentDefinition || currentDefinition.getValue('table') !== 'sys_user')
            return count;

        var condition = currentDefinition.getValue('condition');
        var lastCreatedProfilesAt = this._getLastCreatedTime() || "";
        count = this._createProfilesForUsersSatisfyingDefinition(lastCreatedProfilesAt, condition);
        if (!lastCreatedProfilesAt)
            this._notifyEmployeeAdmin(currentDefinition, count);
        this._updateLastExecutionTime();
        return count;

    },

    _createProfilesForUsersSatisfyingDefinition: function(lastCreatedProfilesAt, query) {
        var continueBatching = true;
        var profileCount = 0;
        query = this.employeeProfileUtils.encodedQueryForProfiles("sysuser_", query);

        if (lastCreatedProfilesAt) {
            var userIds = [];
            var userHasRoleGr = new GlideAggregate('sys_user_has_role');
            userHasRoleGr.addQuery('user.active', true);
            userHasRoleGr.addQuery('sys_updated_on', '>=', lastCreatedProfilesAt);
            userHasRoleGr.groupBy('user');
            userHasRoleGr.query();
            while (userHasRoleGr.next()) {
                userIds.push(userHasRoleGr.getValue('user'));
            }
        }

        while (continueBatching) {
            var empprflDBViewGr = new GlideAggregate('sn_employee_profile_mobile');
            empprflDBViewGr.addQuery("sysuser_active", true);
            empprflDBViewGr.addEncodedQuery(query,true);
            empprflDBViewGr.addNullQuery("emprfl_user");
            empprflDBViewGr.groupBy('sysuser_sys_id');
            if (lastCreatedProfilesAt) {
                //fetch users whose records were updated after last time employee profiles were created
                var queryCondition = empprflDBViewGr.addQuery('sysuser_sys_updated_on', '>=', lastCreatedProfilesAt);
                //OR fetch users whose roles were modified after last time employee profiles were created
                if (userIds && userIds.length)
                    queryCondition.addOrCondition('sysuser_sys_id', 'IN', userIds);
            }
            empprflDBViewGr.query();
            if (!empprflDBViewGr.hasNext())
                continueBatching = false;
            while (empprflDBViewGr.next()) {
                if (this.employeeProfileUtils.createEmployeeProfileFromUser(empprflDBViewGr.getValue('sysuser_sys_id'), true))
                    profileCount++;
            }
        }
        return profileCount;
    },

    /**
     * Creates employee profile records for HR profiles who satisfy the active employee definition.
     * @return Integer - number of employee profile created
     */
    createEmployeeProfilesFromHRProfiles: function() {
        var currentDefinition = this.isDomainSeparationActive ? this.employeeProfileUtils.getCurrentDefinitionInDomainByTable(this.currentDomainID,'sn_hr_core_profile') : this.employeeProfileUtils.getCurrentDefinitionByTable('sn_hr_core_profile');
        if (!currentDefinition || currentDefinition.getValue('table') !== 'sn_hr_core_profile')
            return;

        var condition = currentDefinition.getValue('condition');
        var count = this._createProfilesForHRProfilesSatisfyingDefinition(condition);
        this._notifyEmployeeAdmin(currentDefinition, count);
        this._updateLastExecutionTime();
        return count;
    },

    _createProfilesForHRProfilesSatisfyingDefinition: function(query) {
        var continueBatching = true;
        var profileCount = 0;

        query = this.employeeProfileUtils.encodedQueryForProfiles("hrprf_", query);
        while (continueBatching) {
            var empprflDBViewGr = new GlideRecord("sn_employee_hr_profiles");
            empprflDBViewGr.addQuery("hrprf_user.active", true);
            empprflDBViewGr.addEncodedQuery(query);
            empprflDBViewGr.addNullQuery("emprf_hr_profile");
            empprflDBViewGr.query();

            if (!empprflDBViewGr.hasNext())
                continueBatching = false;
            while (empprflDBViewGr.next()) {
                var hrProfile = this.employeeProfileUtils.getHRProfileRecord(empprflDBViewGr.getValue("hrprf_user")) || '';
                if (hrProfile && this.employeeProfileUtils.createEmployeeProfileFromHRProfile(hrProfile, true))
                    profileCount++;
            }
        }
        return profileCount;
    },

    /*
     * Returns true if there is a generate employee profiles job is running
     * @return boolean
     */
    isEmployeeProfileGenerationJobRunning: function() {
        var DOC_KEY_CONDITION = "document_key=";
        var OR_CONDITION = "^OR";
        var encodedQuery = "";
        if (this.isDomainSeparationActive) {
            encodedQuery += DOC_KEY_CONDITION + ep_Constants.JOB_DOMAIN_GENERATE_PROFILES_FROM_USERS + OR_CONDITION;
            encodedQuery += DOC_KEY_CONDITION + ep_Constants.JOB_DOMAIN_GENERATE_PROFILES_FROM_HR_PROFILES;
        } else {
            encodedQuery += DOC_KEY_CONDITION + ep_Constants.JOB_GENERATE_PROFILES_FROM_USERS + OR_CONDITION;
            encodedQuery += DOC_KEY_CONDITION + ep_Constants.JOB_GENERATE_PROFILES_FROM_HR_PROFILES;
        }
        var scheduleGr = new GlideRecord("sys_trigger");
        scheduleGr.addEncodedQuery(encodedQuery);
        scheduleGr.addQuery("job_id.handler_class", "RunScriptJob");
        scheduleGr.addQuery("state", "IN", "2,1,0");
        scheduleGr.setLimit(1);
        scheduleGr.query();
        return scheduleGr.hasNext();
    },

    /*
     * Util function to trigger generate employee profile schedule job
     * Handles both the full and incremental scenarios
     * Triggers separate schedule jobs if domain separation is active
     * @parm profileTable - Table name
     * @return boolen - is scheduled job triggered successfully
     */
    triggerEmployeeProfileCreationJob: function(profileTable) {
        var jobId = this._getJobID(profileTable);

        if (!jobId) {
            gs.error(gs.getMessage("Generate employee profiles: Job not found"));
            return false;
        }

        var jobGr = this._getJobRecord(jobId);
        if (jobGr) {
            try {
                gs.executeNow(jobGr);
                return true;
            } catch (err) {
                gs.error(gs.getMessage("Generate employee profiles: Error occured while triggering the job: {0}", err));
            }
        }
        return false;
    },

    _getJobID: function(sourceTable) {
        if (this.isDomainSeparationActive) {
            if (sourceTable === 'sys_user')
                return ep_Constants.JOB_DOMAIN_GENERATE_PROFILES_FROM_USERS;
            else if (sourceTable === 'sn_hr_core_profile')
                return ep_Constants.JOB_DOMAIN_GENERATE_PROFILES_FROM_HR_PROFILES;
        } else {
            if (sourceTable === 'sys_user')
                return ep_Constants.JOB_GENERATE_PROFILES_FROM_USERS;
            else if (sourceTable === 'sn_hr_core_profile')
                return ep_Constants.JOB_GENERATE_PROFILES_FROM_HR_PROFILES;
        }
        return '';
    },

    _getJobRecord: function(jobId) {
        var jobGr = new GlideRecord("sysauto_script");
        jobGr.get(jobId);
        return jobGr;
    },

    /*
     * Resetting the last created at property will execute full scan 
     * in next scheduled job run for generate profiles
     */
    resetLastExecutionTime: function() {
        this._setLastCreatedTime("");
    },

    _updateLastExecutionTime: function() {
        this._setLastCreatedTime(new GlideDateTime().getValue());
    },

    _getLastCreatedTime: function() {
        var jobTrackerGR = this._getJobTrackerGR();
        if (gs.nil(jobTrackerGR))
            return "";
        return jobTrackerGR.getValue("last_successful_run_at");
    },

    _setLastCreatedTime: function(lastSuccessfulRunTime) {
        var jobTrackerGR = this._getJobTrackerGR();
        if (gs.nil(jobTrackerGR)) {
            return !!this._insertJobTrackerGR(lastSuccessfulRunTime);
        } else {
            jobTrackerGR.setValue("last_successful_run_at", lastSuccessfulRunTime);
            return jobTrackerGR.update();
        }
    },

    /*
     * Returns job tracker record in current domain
     * @return GlideRecord - sn_employee_job_tracker
     */
    _getJobTrackerGR: function() {
        var gr = new GlideRecord("sn_employee_job_tracker");
        gr.addQuery("sys_domain", this.currentDomainID);
        gr.setLimit(1);
        gr.query();
        if (gr.next())
            return gr;
        return null;
    },

    /*
     * Inserts new job tracker in current domain
     * @return SysId
     */
    _insertJobTrackerGR: function(lastSuccessfulRunTime) {
        var gr = new GlideRecord("sn_employee_job_tracker");
        gr.initialize();
        gr.setValue("last_successful_run_at", lastSuccessfulRunTime);
        if (gr.insert())
            return gr.getUniqueValue();
        return null;
    },

    _notifyEmployeeAdmin: function(defnGr, count) {

        var userDetails = this._getUserDetails(defnGr.getValue("sys_updated_by"));
        var templateDetails = {
            "count": count,
            "firstName": userDetails.firstName,
        };
        templateDetails = JSON.stringify(templateDetails);
        if (userDetails)
            gs.eventQueue("sn_employee.generate_employee_profiles", defnGr, templateDetails, userDetails.sysid);
    },

    _getUserDetails: function(userId) {
        var user = {};
        var userGr = new GlideRecord("sys_user");
        userGr.addQuery("user_name", userId);
        userGr.query();
        if (userGr.next()) {
            user["firstName"] = userGr.getDisplayValue("first_name") || '';
            user["sysid"] = userGr.getUniqueValue();
            return user;
        }
        return null;
    },

    type: 'ep_generateEmployeeProfileUtilSNC'
};
