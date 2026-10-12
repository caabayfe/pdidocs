var CMDBWsDMExclusionListAccessor = Class.create();
CMDBWsDMExclusionListAccessor.prototype = Object.extendsObject(CMDBWsDMConstants, {
    /**
     * This class will have all methods that does CRUD operation using GlideRecord on policy exclusion list table
     */
    initialize: function() {},
    type: 'CMDBWsDMExclusionListAccessor',

    /**
     * Add record(only cmdb ci) into exclusion list via encoded query.
     * @param {*} policyTypeId : Policy Type for which record will be excluded
     * @param {*} queryFilter : Add all records into exclusion list eligible to this query filter.
     *                      {
                                table: Name of from which record need to be excluded
                                encoded_query: Exclude all records eligible to this encoded query. 
     *                       }
     * @returns: Final count of records got inserted into exclusion list. 
     */
    addCIToExclusionListUsingQueryFilter: function(policyType, queryFilter) {
        if (global.JSUtil.nil(queryFilter) || global.JSUtil.nil(queryFilter.table))
            return;

        var grRecords = new GlideRecord(queryFilter.table);
        // Eligible records for query Filter
        if (global.JSUtil.notNil(queryFilter.encoded_query)) {
            grRecords.addEncodedQuery(queryFilter.encoded_query, true);
        }
        // Filter out existing excluded records for given policy type
        grRecords.addEncodedQuery("RLQUERYcmdb_policy_ci_exclusion_list.ci,=0^policy_type=" + policyType + "^ENDRLQUERY", false);
        grRecords.query();
        /* EXAMPLE SQL STATEMENT
            SELECT  
                sys_id 
            FROM cmdb cmdb0 
                LEFT JOIN cmdb_policy_ci_exclusion_list sj0 ON sj0.`ci`=cmdb0.`sys_id` AND sj0.`policy_type` = '66306fcb7352201026f6aa114df6a77c'
            WHERE 
                cmdb0.`sys_class_path` LIKE '/!!%' AND 
                cmdb0.`name` LIKE 'access%' 
            GROUP BY cmdb0.`sys_id` 
            HAVING count(sj0.`sys_id`) = 0
         */

        var insertedRecordCount = 0;
        var gr = new GlideRecordSecure(this.POLICY_CI_EXCLUSION_LIST.TABLE);
        while (grRecords.next()) {
            gr.initialize();
            gr.setValue(this.POLICY_CI_EXCLUSION_LIST.POLICY_TYPE, policyType);
            gr.setValue(this.POLICY_CI_EXCLUSION_LIST.CI, grRecords.getUniqueValue());
            var sysId = gr.insert();
            if (global.JSUtil.notNil(sysId))
                insertedRecordCount++; // insert succeeded
        }
        return insertedRecordCount;
    },

    /**
     * Add CI to exclusion list for given policy type.
     * Note: This method only supports CMDB_CI sysIds
     * @param {*} policyType 
     * @param {*} ciList 
     * @returns list of CIs that failed to insert into exclusion list.
     */
    addCIToExclusionList: function(policyType, ciList) {
        if (global.JSUtil.nil(ciList) || ciList.length == 0)
            return;

        var result = {};
        result.erroredCiSysIds = [];
        result.successfulCiNames = [];
        var gr = new GlideRecordSecure(this.POLICY_CI_EXCLUSION_LIST.TABLE);
        for (var i = 0; i < ciList.length; i++) {
            var ci = ciList[i];
            gr.initialize();
            gr.setValue(this.POLICY_CI_EXCLUSION_LIST.POLICY_TYPE, policyType);
            gr.setValue(this.POLICY_CI_EXCLUSION_LIST.CI, ci);
            try {
                // We have unique key constrain on the policyType and CI combination.
                // adding duplicate row will throw SQLIntegrityConstraintViolationException
                var sysId = gr.insert();
                if (global.JSUtil.nil(sysId))
                    result.erroredCiSysIds.push(ci);
                else {
                    result.successfulCiNames.push(gr.ci.getRefRecord().getDisplayValue());
                }
            } catch (ex) {
                result.erroredCiSysIds.push(ci);
                //Just log the error. No need to throw it.
                new CMDBWsError({
                    code: this.ERROR_CODES.DM_FAILED_INSERT,
                    message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Exclusion List insert failed for CI:{0}", {
                        0: ci
                    }),
                    action: this.ACTIONS.DM_ADD_RECORD_TO_EXCLUSION_LIST,
                    source: this.DM_ERROR_SOURCE,
                    details: "Server side unexpected error occurred when inserting record into policy exclusion list. See syslog for more details.",
                    logError: true,
                    originalError: ex
                });
            }
        }
        return result;
    },

    /**
     * Remove selected records from exclusion list.
     * This method only supports CMDB_CI sysIds
     * @param {*} selectedRecords
     * @returns 
     */
    removeSelectedRecordsFromExclusionList: function(selectedRecords) {
        if (global.JSUtil.nil(selectedRecords) || selectedRecords.length == 0)
            return;

        var gr = new GlideRecordSecure(this.POLICY_CI_EXCLUSION_LIST.TABLE);
        gr.addQuery(this.SYS_ID, "IN", selectedRecords);
        try {
            gr.deleteMultiple();
        } catch (ex) {
            throw new CMDBWsError({
                code: this.ERROR_CODES.DM_FAILED_DELETE,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Deletion from Exclusion List failed for one or more selectedRecords"),
                action: this.ACTIONS.DM_REMOVE_RECORD_FROM_EXCLUSION_LIST,
                source: this.DM_ERROR_SOURCE,
                details: "Server side unexpected error occurred when deleting records from policy exclusion list. See syslog for more details. Records being deleted " + selectedRecords.join(","),
                logError: true,
                originalError: ex
            });
        }
    },

    /**
     * Remove records with given encoded_query from exclusion list
     * This method only supports CMDB_CI sysIds
     * @param {*} encodedQuery
     * @returns 
     */
    removeRecordsFromExclusionList: function(encodedQuery) {
        var gr = new GlideRecordSecure(this.POLICY_CI_EXCLUSION_LIST.TABLE);
        gr.addEncodedQuery(encodedQuery);

        try {
            gr.deleteMultiple();
        } catch (ex) {
            throw new CMDBWsError({
                code: this.ERROR_CODES.DM_FAILED_DELETE,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Deletion from Exclusion List failed"),
                action: this.ACTIONS.DM_REMOVE_RECORD_FROM_EXCLUSION_LIST,
                source: this.DM_ERROR_SOURCE,
                details: "Server side unexpected error occurred when deleting records with encodedQuery " + encodedQuery + " from policy exclusion list. See syslog for more details.",
                logError: true,
                originalError: ex
            });
        }
    },


    /**
     * Remove CIs from exclusion list for given policy Type.
     * This method only supports CMDB_CI sysIds
     * @param {*} policyType 
     * @param {*} ciList 
     * @returns 
     */
    removeCIFromExclusionList: function(policyType, ciList) {
        if (global.JSUtil.nil(ciList) || ciList.length == 0)
            return;

        var gr = new GlideRecordSecure(this.POLICY_CI_EXCLUSION_LIST.TABLE);
        gr.addQuery(this.POLICY_CI_EXCLUSION_LIST.CI, ciList);
        gr.addQuery(this.POLICY_CI_EXCLUSION_LIST.POLICY_TYPE, policyType);
        try {
            gr.deleteMultiple();
        } catch (ex) {
            throw new CMDBWsError({
                code: this.ERROR_CODES.DM_FAILED_DELETE,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Deletion from Exclusion List failed for one or more CIs:{0}", {
                    0: ciList.join(",")
                }),
                action: this.ACTIONS.DM_REMOVE_RECORD_FROM_EXCLUSION_LIST,
                source: this.DM_ERROR_SOURCE,
                details: "Server side unexpected error occurred when deleting record from policy exclusion list. See syslog for more details.",
                logError: true,
                originalError: ex
            });
        }
    },
});
