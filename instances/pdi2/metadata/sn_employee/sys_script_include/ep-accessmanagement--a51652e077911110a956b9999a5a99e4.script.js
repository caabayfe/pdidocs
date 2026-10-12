var ep_AccessManagement = Class.create();
ep_AccessManagement.prototype = {
    initialize: function(appName) {
        this.GRANT_ACTION = 'GRANT';
        this.CREATE_ACTION = 'CREATE';
        this.REVOKE_ACTION = 'REVOKE';
        this.SYNC_PROFILE_ACTION = 'SYNC_PROFILE';
        this.ACTION_EVENT_NAME = 'sn_employee.update.employee.app.access';
        this.REFRESH_APP_EVENT_NAME = 'sn_employee.refresh.employee.app.access';
        this.REFRESH_EVENT_STAGGER_NAME = 'sn_employee.refresh_app_event_stagger';
        this.GRANT_STAGGER_NAME = 'sn_employee.app_access_grant_stagger';
        this.REVOKE_STAGGER_NAME = 'sn_employee.app_access_revoke_stagger';
        this.MAX_USER_PER_EVENT_NAME = 'sn_employee.max_users_per_grant_event';
        this.IS_HR_ACTIVE = GlidePluginManager.isActive('com.sn_hr_core');
        this.MAX_USERS_PER_EVENT = this._getNumberProperty(this.MAX_USER_PER_EVENT_NAME, 25000);
        this.appGr = null;
        this.appName = null;
        this.accessCondition = '';
        this.profileCondition = '';
        var appGr = new GlideRecord('sn_employee_app');
        if (appGr.get('name', appName)) {
            this.appName = appName;
            this.appGr = appGr;
        }
    },

    /** 
     *  Schedule events to refresh access accross all Licensed Applications (sn_employee_app)
     *  @returns void
     */
    refreshAccessForAllApps: function() {
        var gdtWhenToProcess = new GlideDateTime();
        var employeeAppGr = new GlideRecord('sn_employee_app');
        employeeAppGr.query();
        while (employeeAppGr.next()) {
            gs.eventQueueScheduled(this.REFRESH_APP_EVENT_NAME, employeeAppGr, '', '', gdtWhenToProcess);
            gdtWhenToProcess.addSeconds(this._getNumberProperty(this.REFRESH_EVENT_STAGGER_NAME, 300));
        }

    },

    /** 
     *  Schedule events to revoke access accross all Licensed Applications (sn_employee_app)
     *  @returns void
     */
    revokeAccessForAllApps: function() {
        var employeeAppGr = new GlideRecord('sn_employee_app');
        employeeAppGr.query();
        while (employeeAppGr.next()) {
            this.appGr = employeeAppGr;
            this.appName = employeeAppGr.getValue('name');
            if (this._hasRecentUpdates(30, this.appName, "sn_employee_app_access") || this._checkAppUpdated(employeeAppGr, 10)) {
                this._logWarning("Cannot revoke access as another process might be running for the app " + this.appName);
                continue;
            }
            var params = {};
            params['appName'] = this.appName;
            params['action'] = this.REVOKE_ACTION;
            //schedule another revokeAccess
            this._scheduleEvent(this.REVOKE_STAGGER_NAME, 300, this.ACTION_EVENT_NAME, params);
        }
    },

    /** 
     *  Refresh access for a Licensed Application (sn_employee_app)
     *  @param {GlideRecord} employeeAppGr - sn_employee_app record to refresh access
     *  @returns void
     */
    refreshAccessForApp: function(employeeAppGr) {
        if (!employeeAppGr.isValidRecord())
            throw this._getError('Invalid employee app GlideRecord');

        if (this._hasRecentUpdates(30, employeeAppGr.name, "sn_employee_app_access") || this._checkAppUpdated(employeeAppGr, 10)) {
            this._logWarning("Cannot grant access as another process might be running for the app " + this.appName);
            return;
        }

        //no criteria for app
        var criteriaGr = new GlideRecord("sn_employee_app_access_criteria");
        criteriaGr.addActiveQuery();

        if (!criteriaGr.get('app', employeeAppGr.getUniqueValue()))
            return;
        this.appGr = employeeAppGr;
        this.appName = employeeAppGr.getValue('name');
        employeeAppGr.setValue('last_run_time', new GlideDateTime());
        employeeAppGr.update();
        var criteriaAggregate = new GlideAggregate('sn_employee_app_access_criteria');
        criteriaAggregate.addQuery('active', true);
        criteriaAggregate.groupBy('table');
        criteriaAggregate.query();

        while (criteriaAggregate.next()) {
            var criteriaTableName = criteriaAggregate.getValue('table');
            this.profileCondition = '';
            this.accessCondition = '';

            if (gs.nil(criteriaTableName)) {
                this._logWarning("For AppName: " + this.appName + "criteriaTable is empty");
                continue;
            }
            this._setConditions(criteriaTableName);
            this.grantAccess(this.profileCondition, criteriaTableName);
            // Schedule create event:
            var params = {};
            params['appName'] = this.appName;
            params['action'] = this.CREATE_ACTION;
            params['condition'] = this.accessCondition;
            params['criteriaTableName'] = criteriaTableName;
            this._scheduleEvent(this.GRANT_STAGGER_NAME, 30, this.ACTION_EVENT_NAME, params);
        }
    },

    /** 
     *  Grant app access by updating sn_employee_app_access to active for each profile that meets the @param condition
     *  @param {String} condition - condition used to evaluate granting access for employee app access
     *  @returns void
     */
    grantAccess: function(condition, criteriaTableName) {
        var appAccessGr = this._constructAppAccessQuery(criteriaTableName, condition, this.MAX_USERS_PER_EVENT);
        appAccessGr.setValue('last_granted', this.appGr.getValue('last_run_time'));
        appAccessGr.setValue('date_revoked', '');
        appAccessGr.setValue('active', true);
        appAccessGr.setWorkflow(false);
        appAccessGr.updateMultiple();

        //check if we have more records to grant outside of batch size.
        var extraGrantAccessGr = this._constructAppAccessQuery(criteriaTableName, condition, 1);
        extraGrantAccessGr.query();

        if (extraGrantAccessGr.hasNext()) {
            var params = {};
            params['appName'] = this.appName;
            params['action'] = this.GRANT_ACTION;
            params['condition'] = condition;
            params['criteriaTableName'] = criteriaTableName;

            //schedule another grantAccess
            this._scheduleEvent(this.GRANT_STAGGER_NAME, 30, this.ACTION_EVENT_NAME, params);
        }
    },

    /** 
     *  Grant app access by creating sn_employee_app_access for each profile that meets the @param condition 
     *  @param {String} condition - condition used to evaluate granting access for employee app access
     *  @returns void
     */
    createAccess: function(condition, criteriaTableName) {

        var counter = this.MAX_USERS_PER_EVENT;
        //includes all profiles that meet a condition which have no matching sn_employee_app_access.profile for the current app

        var profileGr;
        var rlCondition = "";
        // if criteria is not based on emp_profile or hr_profile, we can't proceed 
        if (((criteriaTableName != 'sn_employee_profile') && (criteriaTableName != 'sn_hr_core_profile')))
            return;

        if (criteriaTableName == 'sn_employee_profile') {
            profileGr = new GlideRecord('sn_employee_profile');
            profileGr.addQuery('user.active', true);
            rlCondition = '^RLQUERYsn_employee_app_access.profile,=0^app=' + this.appGr.getUniqueValue() + '^ENDRLQUERY';

        } else if (criteriaTableName == 'sn_hr_core_profile' && this.IS_HR_ACTIVE) {
            profileGr = new GlideRecord('sn_hr_core_profile');
            profileGr.addQuery('user.active', true);
            rlCondition = '^RLQUERYsn_employee_app_access.hr_profile,=0^app=' + this.appGr.getUniqueValue() + '^ENDRLQUERY';

        }

        profileGr.addEncodedQuery(condition + rlCondition);
        profileGr.setLimit(counter + 1); // limit query results because processing in batch size of counter
        profileGr.query();
        while (counter > 0 && profileGr.next()) {
            try {
                //update if present. 
                var appAccessGr = new GlideRecord('sn_employee_app_access');
                appAccessGr.addQuery("user", profileGr.getValue('user'));
                appAccessGr.setLimit(1);
                appAccessGr.query();
                if (appAccessGr.next()) {
                    appAccessGr.setValue('date_granted', this.appGr.getValue('last_run_time'));
                    appAccessGr.setValue('last_granted', this.appGr.getValue('last_run_time'));
                    appAccessGr.setValue('date_revoked', '');
                    appAccessGr.setValue('app', this.appGr.getUniqueValue());
                    appAccessGr.setValue('active', true);
                    appAccessGr.setWorkflow(false);
                    if (criteriaTableName == 'sn_employee_profile')
                        appAccessGr.setValue('profile', profileGr.getUniqueValue());
                    if (criteriaTableName == 'sn_hr_core_profile')
                        appAccessGr.setValue('hr_profile', profileGr.getUniqueValue());
                    appAccessGr.update();
                } else {
                    appAccessGr = new GlideRecord('sn_employee_app_access');
                    appAccessGr.initialize();
                    appAccessGr.setValue('app', this.appGr.getUniqueValue());
                    if (criteriaTableName == 'sn_employee_profile')
                        appAccessGr.setValue('profile', profileGr.getUniqueValue());
                    else if (criteriaTableName == 'sn_hr_core_profile')
                        appAccessGr.setValue('hr_profile', profileGr.getUniqueValue());

                    appAccessGr.setValue('user', profileGr.getValue('user'));
                    appAccessGr.setValue('date_granted', this.appGr.getValue('last_run_time'));
                    appAccessGr.setValue('last_granted', this.appGr.getValue('last_run_time'));
                    appAccessGr.setValue('active', true);
                    appAccessGr.setWorkflow(false);
                    appAccessGr.insert();

                }

            } catch (error) {
                throw this._getError('Insert of an employee app access record failed - ' + error);
            }
            counter--;
        }

        var params = {};
        var gdtWhenToProcess = null;

        if (profileGr.hasNext()) {
            params['appName'] = this.appName;
            params['action'] = this.CREATE_ACTION;
            params['condition'] = condition;
            params['criteriaTableName'] = criteriaTableName;

            //schedule another createAccess
            this._scheduleEvent(this.GRANT_STAGGER_NAME, 30, this.ACTION_EVENT_NAME, params);

        } else {
            //schedule profile sync
            var syncParams = {};
            syncParams['appName'] = this.appName;
            syncParams['action'] = this.SYNC_PROFILE_ACTION;
            this._scheduleEvent(this.REVOKE_STAGGER_NAME, 30, this.ACTION_EVENT_NAME, syncParams);
        }

    },

    /** 
     *  Revoke app access by setting sn_employee_app_access inactive for employees that did not 
     *  meet the sn_employee_app_access_criteria condition
     *  @returns void
     */
    revokeAccess: function() {
        var appAccessGr = this._constructRevokeAccessQuery(this.MAX_USERS_PER_EVENT);
        appAccessGr.setValue('active', false);
        appAccessGr.setValue('date_revoked', this.appGr.getValue('last_run_time'));
        appAccessGr.updateMultiple();

        //check if we have more records to revoke outside of batch size
        var extraRevokeAccessGr = this._constructRevokeAccessQuery(1);
        extraRevokeAccessGr.query();

        if (extraRevokeAccessGr.hasNext()) {
            var params = {};
            params['appName'] = this.appName;
            params['action'] = this.REVOKE_ACTION;
            //schedule another revokeAccess
            this._scheduleEvent(this.REVOKE_STAGGER_NAME, 30, this.ACTION_EVENT_NAME, params);

        } else {
            //schedule profile sync
            var syncParams = {};
            syncParams['appName'] = this.appName;
            syncParams['action'] = this.SYNC_PROFILE_ACTION;
            this._scheduleEvent(this.REVOKE_STAGGER_NAME, 30, this.ACTION_EVENT_NAME, syncParams);
        }

    },

    /**
     * Synchronizes employee profiles by ensuring that each record in the 
     * "sn_employee_app_access" table has associated HR and employee profiles.
     * If necessary, schedules a follow-up sync event.
     */
    syncProfiles: function() {
        var eq = "profileISEMPTY";
        if (this.IS_HR_ACTIVE)
            eq += "^ORhr_profileISEMPTY";
        var appAccessGr = new GlideRecord("sn_employee_app_access");
        appAccessGr.addActiveQuery();
        appAccessGr.addEncodedQuery(eq);
        appAccessGr.setLimit(this.MAX_USERS_PER_EVENT + 1);
        appAccessGr.query();
        var count = 0;
        while (appAccessGr.next() && count < this.MAX_USERS_PER_EVENT) {
            var userId = appAccessGr.getValue("user");
            if (!userId)
                continue;
            if (this.IS_HR_ACTIVE && !appAccessGr.hr_profile) {
                var hrProfileGr = new sn_hr_core.hr_Profile().getProfileFromUser(userId);
                if (hrProfileGr)
                    appAccessGr.setValue("hr_profile", hrProfileGr.getUniqueValue());
            }

            if (!appAccessGr.profile) {
                var employeeProfileGr = new sn_employee.ep_Utils().getEmployeeProfileRecord(userId);
                if (employeeProfileGr)
                    appAccessGr.setValue("profile", employeeProfileGr.getUniqueValue());

            }
            appAccessGr.update();
            count++;
        }
        //schedule profile sync if needed
        if (appAccessGr.hasNext()) {
            var params = {};
            params['appName'] = this.appName;
            params['action'] = this.SYNC_PROFILE_ACTION;
            this._scheduleEvent(this.REVOKE_STAGGER_NAME, 30, this.ACTION_EVENT_NAME, params);
        }
    },

    /**
     * Schedules an event to be processed at a specified time in the future.
     *
     * @param {string} propName - The name of the property that determines the delay time.
     * @param {number} defaultStaggerTimeInSeconds - The default number of seconds to delay if the property is not found.
     * @param {string} actionName - The name of the event to be queued.
     * @param {Object} params - Additional parameters to be passed to the event.
     */

    _scheduleEvent: function(propName, defaultStaggerTimeInSeconds, actionName, params) {
        var gdtWhenToProcess = new GlideDateTime().addSeconds(this._getNumberProperty(propName, defaultStaggerTimeInSeconds));
        gs.eventQueueScheduled(actionName, this.appGr, JSON.stringify(params), '', gdtWhenToProcess);
    },

    /** 
     *  Set encoded query conditions for all criteria for an sn_employee_app
     *  @returns void
     */
    _setConditions: function(criteriaTableName) {
        var accessCondition = '';
        var profileCondition = '';

        var criteriaGr = new GlideRecord('sn_employee_app_access_criteria');
        criteriaGr.addQuery('app', this.appGr.getUniqueValue());
        criteriaGr.addQuery('table', criteriaTableName);
        criteriaGr.addActiveQuery();
        criteriaGr.query();
        while (criteriaGr.next()) {
            if (accessCondition !== '')
                accessCondition += '^NQ';
            if (profileCondition !== '')
                profileCondition += '^NQ';

            var criteria = criteriaGr.getValue('criteria');
            if (criteria && criteria !== '') {
                accessCondition += criteria;
                if (criteriaTableName == "sn_hr_core_profile" && this.IS_HR_ACTIVE)
                    profileCondition += this._getProfileQuery(criteria, 'hr_profile');
                else
                    profileCondition += this._getProfileQuery(criteria, 'profile');
            }
        }

        //used when querying employee profile table for create records
        this.accessCondition = accessCondition;
        //used when querying sn_employee_app_access with a profile column name preappended to each condition field for grant
        this.profileCondition = profileCondition;
    },


    /**
     * Checks if the "last run time" of an application was within a specified number of minutes.
     *
     * @param {number} minutes - The number of minutes to compare against. If the "last run time" is less than this value, the function returns `true`.
     * @param {GlideRecord} appGr - A GlideRecord object representing the application record, containing the "last_run_time" field.
     * @returns {boolean} - Returns `true` if the "last run time" is within the specified number of minutes, otherwise returns `false`.
     */
    _checkAppUpdated: function(appGr, minutes) {
        if (!appGr || typeof minutes !== 'number' || isNaN(minutes))
            return false;
        var lastUpdatedTime = appGr.getValue('last_run_time');
        if (!lastUpdatedTime)
            return false;
        try {
            var currentTime = new GlideDateTime();
            var updatedTime = new GlideDateTime(lastUpdatedTime);
            var duration = currentTime.getNumericValue() - updatedTime.getNumericValue(); // Difference in milliseconds
            // Convert minutes to milliseconds and compare
            return duration < (minutes * 60 * 1000);
        } catch (e) {
            gs.error("Error in _checkAppUpdated: " + e.message);
            return false;
        }
    },

    /**
     * Checks if there have been recent updates in a specific table within the given time frame.
     * 
     * @param {number} minutes - The time frame in minutes to check for recent updates.
     * @param {string} appName - The name of the application to filter by (optional).
     * @param {string} tableName - The name of the table to query.
     * 
     * @returns {boolean} - Returns true if there are recent updates, false otherwise.
     */
    _hasRecentUpdates: function(minutes, appName, tableName) {
        if (typeof minutes !== 'number' || isNaN(minutes) || !tableName)
            return false;
        var gr = new GlideRecord(tableName);
        gr.addEncodedQuery("sys_updated_on>=javascript:gs.minutesAgo(" + minutes + ")");
        if (appName)
            gr.addQuery("app.name", appName);
        gr.setLimit(1);
        gr.query();
        return gr.hasNext();
    },

    /*
     * Adapt an employee profile encoded query to work on a non employee profile table using the @param profileColumn
     * @param {String} encodedQuery - Encoded query to adapt
     * @param {String} profileColumn - employee profile field name to use to adapt encoded query
     * @return (String) Parsed encoded query
     */
    _getProfileQuery: function(encodedQuery, profileColumn) {
        if (!encodedQuery || !profileColumn || profileColumn == 'sys_id')
            return encodedQuery;
        if (encodedQuery.endsWith('^EQ'))
            encodedQuery = encodedQuery.substring(0, encodedQuery.length - 3);

        var queries = encodedQuery.split('^NQ');
        var queriesRet = [];
        for (var i = 0; i < queries.length; i++) {
            var orConditions = queries[i].split('^OR');
            var orConditionsRet = [];
            for (var j = 0; j < orConditions.length; j++) {
                var andConditions = orConditions[j].split('^');
                var andConditionsRet = [];
                for (var k = 0; k < andConditions.length; k++)
                    andConditionsRet.push(profileColumn + '.' + andConditions[k]);
                if (andConditionsRet.length > 0)
                    orConditionsRet.push(andConditionsRet.join('^'));
            }
            if (orConditionsRet.length > 0)
                queriesRet.push(orConditionsRet.join('^OR'));
        }
        return queriesRet.join('^NQ');
    },

    /**
     * Creates GlideQuery on app access table based on table of criteria to grant access to those records
     * @param {String} criteriaTable - table on which criteria is based on
     * @param {String} condition - condition defined in criteria
     * @param {Integer} limit - number of records to be fetched from table
     * 
     * @return {GlideQueryCondition} - Query condition constructed on app access table
     */
    _constructAppAccessQuery: function(criteriaTable, condition, limit) {
        var appAccessGr = new GlideRecord('sn_employee_app_access');
        appAccessGr.addEncodedQuery(condition);
        appAccessGr.addQuery('app', this.appGr.getUniqueValue());
        appAccessGr.addQuery('last_granted', '!=', this.appGr.getValue('last_run_time'));

        if (criteriaTable === 'sn_employee_profile')
            appAccessGr.addQuery('profile.user.active', true);
        else if (criteriaTable === 'sn_hr_core_profile')
            appAccessGr.addQuery('hr_profile.user.active', true);

        appAccessGr.setLimit(limit);

        return appAccessGr;
    },

    /**
     * Creates GlideQuery on app access table to revoke access to those records
     * @param {Integer} limit - number of records to be fetched from table
     * 
     * @return {GlideQueryCondition} - Query condition constructed on app access table
     */
    _constructRevokeAccessQuery: function(limit) {
        var appAccessGr = new GlideRecord('sn_employee_app_access');
        var lastRunTime = this.appGr.getDisplayValue('last_run_time');

        var gdt = new GlideDateTime();
        gdt.setDisplayValue(lastRunTime);

        appAccessGr.addQuery('last_granted', '<', gdt);
        appAccessGr.addQuery('app', this.appGr.getUniqueValue());
        appAccessGr.addActiveQuery();
        appAccessGr.setLimit(limit);

        return appAccessGr;
    },

    /** Return a number value for a given property
     * @param {String} propName - Name of a property
     * @param {Number} defaultValue - The default value to use for a property
     * @return {Number} The number value for a given property
     */
    _getNumberProperty: function(propName, defaultValue) {
        var propValue = Number(gs.getProperty(propName, defaultValue));
        if (isNaN(propValue) || propValue <= 0) {
            gs.warn('Script - ' + this.type + ': Overriding invalid property value for ' + propName);
            propValue = defaultValue;
        }
        return propValue;
    },

    /** 
     *  Function to return an error
     *  @param {String} message - error message print in thrown exception
     *  @returns {Error} The error to throw
     */
    _getError: function(message) {
        var errorMessage = 'Script Include - ' + this.type + ' : ' + message;
        return new Error(errorMessage);
    },

    /** 
     *  Function to log a warning by prefixing current script include details
     *  @param {String} message - error message to print in warning logs
     */
    _logWarning: function(message) {
        gs.warn('Script Include - ' + this.type + ' : ' + message);
    },

    type: 'ep_AccessManagement'
};
