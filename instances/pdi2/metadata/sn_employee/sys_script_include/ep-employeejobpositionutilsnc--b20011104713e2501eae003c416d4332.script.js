var EP_EmployeeJobPositionUtilSNC = Class.create();
EP_EmployeeJobPositionUtilSNC.prototype = {
    initialize: function() {
        this.TABLE_NAME = 'sn_employee_position';

        this.DUPLICATE_CHECK_FIELDS = [
            'business_title',
            'primary',
            'location',
            'start_date',
            'end_date',
            'employment_type',
            'employee_profile'
        ];

        this.CONDITIONAL_FIELDS = [
            'job_profile',
            'job_family'
        ];
    },

    /**
     * Creates employee position records for a user based on their HR job records.
     * This function retrieves all HR job records associated with the specified user
     * and synchronizes them to create corresponding employee position records.
     * 
     * @param {string} userSysId - The sys_id of the user for whom to create employee positions
     * @returns {void} - No return value
     * 
     * @throws {Error} Logs error if userSysId is invalid or if an exception occurs during processing
     */
    createEmpPositionByHRJob: function(userSysId) {
        try {
            if (gs.nil(userSysId)) {
                gs.error('Cannot create employee position as userSysId is invalid');
                return;
            }
            var hrJobGr = new GlideRecord('sn_hr_core_job');
            hrJobGr.addQuery('user', userSysId);
            hrJobGr.query();
            while (hrJobGr.next()) {
                gs.info("EP_EmployeeJobPositionUtilSNC: Employee job position sync started for user " + userSysId);
                this.syncEmployeeJobPositionWithHRJob(hrJobGr, null, true);
                gs.info("EP_EmployeeJobPositionUtilSNC: Employee job position sync completed for user " + userSysId);

            }
        } catch (exception) {
            gs.error("Exception occoured in createEmpPositionByHRJob " + exception);
        }
    },

    /**
     * Synchronizes employee job position with HR job record
     * @param {GlideRecord} jobGR - Current job GlideRecord from sn_hr_core_job table
     * @param {GlideRecord} prevJobGR - Previous job GlideRecord from sn_hr_core_job table
     * @param {boolean} isInsert - True if this is a new job record insertion
     * @returns {boolean} - True if synchronization was successful, false otherwise
     */
    syncEmployeeJobPositionWithHRJob: function(jobGR, prevJobGR, isInsert) {
        if (!this._validateJobRecords(jobGR, prevJobGR, isInsert)) {
            return false;
        }

        const empProfileSysId = this.getEmployeeProfileFromJob(jobGR);
        if (gs.nil(empProfileSysId)) {
            gs.error('EP_EmployeeJobPositionUtilSNC: No employee profile found for user: ' +
                jobGR.getDisplayValue('user') + ' (sys_id: ' + jobGR.getUniqueValue() + ')');
            return false;
        }

        if (isInsert) {
            return this._createEmployeeJobPosition(jobGR, empProfileSysId) !== null;
        } else {
            const empProfileSysIdPrev = this.getEmployeeProfileFromJob(prevJobGR);
            const employeeJobPosGR = this._findExistingEmployeePosition(empProfileSysIdPrev, prevJobGR);

            if (!employeeJobPosGR || gs.nil(employeeJobPosGR)) {
                gs.error('EP_EmployeeJobPositionUtilSNC: Could not find employee job position for user: ' +
                    prevJobGR.getDisplayValue('user') + ' (sys_id: ' + prevJobGR.getUniqueValue() + '). Creating new position.');
                return this._createEmployeeJobPosition(jobGR, empProfileSysId) !== null;
            } else {
                return this._updateExistingJobPositionRecord(employeeJobPosGR, jobGR, empProfileSysId) !== null;
            }
        }
    },

    /**
     * Get employee profile sys_id using the user reference from sn_hr_core_job record
     * @param {GlideRecord} jobGR - GlideRecord of sn_hr_core_job table
     * @returns {String|null} - Employee profile sys_id if found, null otherwise
     */
    getEmployeeProfileFromJob: function(jobGR) {
        if (!jobGR || !jobGR.isValid()) {
            gs.error('EP_EmployeeJobPositionUtilSNC: Invalid job GlideRecord provided to getEmployeeProfileFromJob');
            return null;
        }

        const userSysID = jobGR.getValue('user');
        if (gs.nil(userSysID)) {
            gs.error('EP_EmployeeJobPositionUtilSNC: No user reference found in job record: ' + jobGR.getUniqueValue());
            return null;
        }

        const empGR = new GlideRecord('sn_employee_profile');
        empGR.addQuery('user', userSysID);
        empGR.setLimit(1);
        empGR.query();

        if (empGR.next() && empGR.canRead()) {
            return empGR.getUniqueValue();
        }
        return null;
    },

    /**
     * Find existing employee position record based on provided criteria
     * @param {String} employeeProfileSysID - Employee profile sys_id
     * @param {GlideRecord} prevJobGR - Previous job GlideRecord
     * @returns {GlideRecord|null} - Employee position GlideRecord if found, null otherwise
     */
    _findExistingEmployeePosition: function(employeeProfileSysID, prevJobGR) {
        if (!prevJobGR || !prevJobGR.isValid() || gs.nil(employeeProfileSysID)) {
            gs.error('EP_EmployeeJobPositionUtilSNC: Invalid parameters provided to _findExistingEmployeePosition. ' +
                'employeeProfileSysID: ' + employeeProfileSysID + ', prevJobGR valid: ' + (prevJobGR && prevJobGR.isValid()));
            return null;
        }

        const empPositionGR = new GlideRecord('sn_employee_position');
        empPositionGR.addQuery('employee_profile', employeeProfileSysID);
        empPositionGR.addQuery('primary', prevJobGR.getValue('primary'));
        empPositionGR.addQuery('start_date', prevJobGR.getValue('job_start_date'));
        empPositionGR.addQuery('end_date', prevJobGR.getValue('job_end_date'));
        empPositionGR.addQuery('business_title', prevJobGR.getValue('business_title'));

        // Add job profile query if applicable
        this._addJobProfileQuery(empPositionGR, prevJobGR.getValue('job_code'));

        empPositionGR.query();
        if (empPositionGR.next() && empPositionGR.canRead()) {
            return empPositionGR;
        }
        return null;
    },

    /**
     * Create new employee job position record
     * @param {GlideRecord} jobGR - Job GlideRecord from sn_hr_core_job table
     * @param {String} employeeProfileSysID - Employee profile sys_id
     * @returns {String|null} - Created record sys_id if successful, null otherwise
     */
    _createEmployeeJobPosition: function(jobGR, employeeProfileSysID) {
        if (!this._validateCreateParameters(jobGR, employeeProfileSysID)) {
            return null;
        }

        try {
            const empPositionGR = new GlideRecord('sn_employee_position');

            if (!empPositionGR.canCreate()) {
                gs.error('EP_EmployeeJobPositionUtilSNC: No create access to sn_employee_position table');
                return null;
            }

            this._setEmployeePositionFields(empPositionGR, jobGR, employeeProfileSysID, true);

            const sysId = empPositionGR.insert();
            if (sysId) {
                gs.info('EP_EmployeeJobPositionUtilSNC: Successfully created employee position: ' + sysId +
                    ' for user: ' + jobGR.getDisplayValue('user'));
                return sysId;
            } else {
                gs.error('EP_EmployeeJobPositionUtilSNC: Failed to create employee position for user: ' +
                    jobGR.getDisplayValue('user') + ' (job sys_id: ' + jobGR.getUniqueValue() + ')');
                return null;
            }
        } catch (error) {
            gs.error('EP_EmployeeJobPositionUtilSNC: Error creating employee position: ' + error.message +
                ' for job sys_id: ' + jobGR.getUniqueValue());
            return null;
        }
    },

    /**
     * Get job profile sys_id by job code
     * @param {String} jobCode - Job code to search for
     * @returns {String|null} - Job profile sys_id if found, null otherwise
     */
    _getJobProfileByJobCode: function(jobCode) {
        if (gs.nil(jobCode)) {
            return null;
        }

        const gr = new GlideRecord('sn_skills_int_job_profile');
        gr.addQuery('job_code', jobCode);
        gr.setLimit(1);
        gr.query();

        if (gr.next() && gr.canRead()) {
            return gr.getUniqueValue();
        } else {
            gs.info('EP_EmployeeJobPositionUtilSNC: No Job Profile found with job_code: ' + jobCode);
            return null;
        }
    },

    /**
     * Update existing employee job position record
     * @param {GlideRecord} empPositionGR - Existing employee position GlideRecord
     * @param {GlideRecord} jobGR - New job GlideRecord from sn_hr_core_job table
     * @param {String} employeeProfileSysID - Employee profile sys_id
     * @returns {String|null} - Updated record sys_id if successful, null otherwise
     */
    _updateExistingJobPositionRecord: function(empPositionGR, jobGR, employeeProfileSysID) {
        if (!this._validateUpdateParameters(empPositionGR, jobGR, employeeProfileSysID)) {
            return null;
        }

        try {
            if (!empPositionGR.canWrite()) {
                gs.error('EP_EmployeeJobPositionUtilSNC: No write access to employee position record: ' +
                    empPositionGR.getUniqueValue());
                return null;
            }

            this._setEmployeePositionFields(empPositionGR, jobGR, employeeProfileSysID, false);

            const sysId = empPositionGR.update();
            if (sysId) {
                gs.info('EP_EmployeeJobPositionUtilSNC: Successfully updated employee position: ' + sysId +
                    ' for user: ' + jobGR.getDisplayValue('user'));
                return sysId;
            } else {
                gs.error('EP_EmployeeJobPositionUtilSNC: Failed to update employee position: ' +
                    empPositionGR.getUniqueValue() + ' for job sys_id: ' + jobGR.getUniqueValue());
                return null;
            }
        } catch (error) {
            gs.error('EP_EmployeeJobPositionUtilSNC: Error updating employee position: ' + error.message +
                ' for position sys_id: ' + empPositionGR.getUniqueValue());
            return null;
        }
    },

    /**
     * Helper method to set employee position fields from job record
     * @param {GlideRecord} empPositionGR - Employee position GlideRecord
     * @param {GlideRecord} jobGR - Job GlideRecord
     * @param {String} employeeProfileSysID - Employee profile sys_id
     * @param {boolean} isInsert - True if this is an insert operation, false for update
     */
    _setEmployeePositionFields: function(empPositionGR, jobGR, employeeProfileSysID, isInsert) {
        empPositionGR.setValue('employee_profile', employeeProfileSysID);

        // Handle location field - for inserts, only set if not null/empty
        const locationValue = jobGR.getValue('location');
        if (isInsert) {
            if (!gs.nil(locationValue)) {
                empPositionGR.setValue('location', locationValue);
            }
        } else {
            // For updates, always set to clear existing values when null
            empPositionGR.setValue('location', locationValue || '');
        }

        empPositionGR.setValue('primary', jobGR.getValue('primary'));
        empPositionGR.setValue('end_date', jobGR.getValue('job_end_date'));
        empPositionGR.setValue('start_date', jobGR.getValue('job_start_date'));
        empPositionGR.setValue('business_title', jobGR.getValue('business_title'));

        this._setJobProfileWithNullHandling(empPositionGR, jobGR.getValue('job_code'), isInsert);
    },

    /**
     * Helper method to set job profile with proper null/empty handling
     * @param {GlideRecord} empPositionGR - Employee position GlideRecord
     * @param {String} jobCode - Job code to lookup (can be null/empty)
     * @param {boolean} isInsert - True if this is an insert operation, false for update
     */
    _setJobProfileWithNullHandling: function(empPositionGR, jobCode, isInsert) {
        if (empPositionGR.isValidField('job_profile')) {
            if (gs.nil(jobCode)) {
                // For inserts, don't set empty job_profile field
                // For updates, clear the field to remove existing value
                if (!isInsert) {
                    empPositionGR.setValue('job_profile', '');
                }
            } else {
                const jobProfile = this._getJobProfileByJobCode(jobCode);
                if (jobProfile) {
                    empPositionGR.setValue('job_profile', jobProfile);
                } else if (!isInsert) {
                    // For updates, clear if job profile not found
                    empPositionGR.setValue('job_profile', '');
                }
            }
        }
    },

    /**
     * Helper method to add job profile query if applicable
     * @param {GlideRecord} empPositionGR - Employee position GlideRecord
     * @param {String} jobCode - Job code to lookup
     */
    _addJobProfileQuery: function(empPositionGR, jobCode) {
        const jobProfile = this._getJobProfile(empPositionGR, jobCode);
        if (jobProfile) {
            empPositionGR.addQuery('job_profile', jobProfile);
        }
    },

    /**
     * Helper method to get job profile if field is valid and job code exists
     * @param {GlideRecord} empPositionGR - Employee position GlideRecord
     * @param {String} jobCode - Job code to lookup
     * @returns {String|null} - Job profile sys_id if found and valid, null otherwise
     */
    _getJobProfile: function(empPositionGR, jobCode) {
        if (empPositionGR.isValidField('job_profile') && !gs.nil(jobCode)) {
            return this._getJobProfileByJobCode(jobCode);
        }
        return null;
    },

    /**
     * Validate job records for sync operation
     * @param {GlideRecord} jobGR - Current job GlideRecord
     * @param {GlideRecord} prevJobGR - Previous job GlideRecord
     * @returns {boolean} - True if valid, false otherwise
     */
    _validateJobRecords: function(jobGR, prevJobGR, isInsert) {
        if (!jobGR || !jobGR.isValid()) {
            gs.error('EP_EmployeeJobPositionUtilSNC: Invalid current job GlideRecord provided');
            return false;
        }
        if (!isInsert && (!prevJobGR || !prevJobGR.isValid())) {
            gs.error('EP_EmployeeJobPositionUtilSNC: Invalid previous job GlideRecord provided');
            return false;
        }
        return true;
    },

    /**
     * Validate parameters for create operation
     * @param {GlideRecord} jobGR - Job GlideRecord
     * @param {String} employeeProfileSysID - Employee profile sys_id
     * @returns {boolean} - True if valid, false otherwise
     */
    _validateCreateParameters: function(jobGR, employeeProfileSysID) {
        if (!jobGR || !jobGR.isValid()) {
            gs.error('EP_EmployeeJobPositionUtilSNC: Invalid job GlideRecord provided to _createEmployeeJobPosition');
            return false;
        }
        if (gs.nil(employeeProfileSysID)) {
            gs.error('EP_EmployeeJobPositionUtilSNC: Empty employeeProfileSysID provided to _createEmployeeJobPosition');
            return false;
        }
        return true;
    },

    /**
     * Validate parameters for update operation
     * @param {GlideRecord} empPositionGR - Employee position GlideRecord
     * @param {GlideRecord} jobGR - Job GlideRecord
     * @param {String} employeeProfileSysID - Employee profile sys_id
     * @returns {boolean} - True if valid, false otherwise
     */
    _validateUpdateParameters: function(empPositionGR, jobGR, employeeProfileSysID) {
        if (!empPositionGR || !empPositionGR.isValid()) {
            gs.error('EP_EmployeeJobPositionUtilSNC: Invalid employee position GlideRecord provided to _updateExistingJobPositionRecord');
            return false;
        }
        if (!jobGR || !jobGR.isValid()) {
            gs.error('EP_EmployeeJobPositionUtilSNC: Invalid job GlideRecord provided to _updateExistingJobPositionRecord');
            return false;
        }
        if (gs.nil(employeeProfileSysID)) {
            gs.error('EP_EmployeeJobPositionUtilSNC: Empty employeeProfileSysID provided to _updateExistingJobPositionRecord');
            return false;
        }
        return true;
    },


    /**
     * Check for duplicate records in sn_employee_position table
     * @param {GlideRecord} inputRecord - GlideRecord object of sn_employee_position
     * @returns {boolean} - True if duplicates found, false if not found
     */
    checkForDuplicates: function(inputRecord) {
        try {
            // Validate input
            if (!inputRecord) {
                gs.warn('EmployeePositionDuplicateChecker: No input record provided');
                return false;
            }

            if (inputRecord.getTableName() !== this.TABLE_NAME) {
                gs.warn('EP_EmployeeJobPositionUtilSNC: Input record is not from sn_employee_position table');
                return false;
            }

            var duplicateQuery = new GlideRecord(this.TABLE_NAME);
            if (!inputRecord.isNewRecord()) {
                duplicateQuery.addQuery('sys_id', '!=', inputRecord.getUniqueValue());
            }

            // Add all standard field conditions
            this._addStandardFieldConditions(duplicateQuery, inputRecord);

            // Add conditional field conditions if they exist in the table
            this._addConditionalFieldConditions(duplicateQuery, inputRecord);

            duplicateQuery.query();
            return duplicateQuery.hasNext();

        } catch (ex) {
            gs.error('EP_EmployeeJobPositionUtilSNC.checkForDuplicates: ' + ex);
            return false;
        }
    },

    /**
     * Add standard field conditions to the query
     * @param {GlideRecord} query - Query object
     * @param {GlideRecord} inputRecord - Input record
     */
    _addStandardFieldConditions: function(query, inputRecord) {
        for (var i = 0; i < this.DUPLICATE_CHECK_FIELDS.length; i++) {
            var fieldName = this.DUPLICATE_CHECK_FIELDS[i];
            var fieldValue = inputRecord.getValue(fieldName);

            if (gs.nil(fieldValue)) {
                query.addNullQuery(fieldName);
            } else {
                query.addQuery(fieldName, fieldValue);
            }
        }
    },

    /**
     * Add conditional field conditions to the query (only if fields exist in table)
     * @param {GlideRecord} query - Query object
     * @param {GlideRecord} inputRecord - Input record
     */
    _addConditionalFieldConditions: function(query, inputRecord) {
        var tableGR = new GlideRecord(this.TABLE_NAME);
        for (var i = 0; i < this.CONDITIONAL_FIELDS.length; i++) {
            var fieldName = this.CONDITIONAL_FIELDS[i];

            // Check if the field exists in the table structure
            if (this._fieldExistsInTable(fieldName, tableGR)) {
                var fieldValue = inputRecord.getValue(fieldName);

                if (gs.nil(fieldValue)) {
                    query.addNullQuery(fieldName);
                } else {
                    query.addQuery(fieldName, fieldValue);
                }
            }
        }
    },

    /**
     * Check if a field exists in the table structure
     * @param {string} fieldName - Name of the field to check
     * @returns {boolean} - True if field exists, false otherwise
     */
    _fieldExistsInTable: function(fieldName, tableGR) {
        try {
            return tableGR.isValidField(fieldName);
        } catch (ex) {
            gs.warn('EP_EmployeeJobPositionUtilSNC: Error checking field existence for ' + fieldName + ': ' + ex);
            return false;
        }
    },

    type: 'EP_EmployeeJobPositionUtilSNC'
};
