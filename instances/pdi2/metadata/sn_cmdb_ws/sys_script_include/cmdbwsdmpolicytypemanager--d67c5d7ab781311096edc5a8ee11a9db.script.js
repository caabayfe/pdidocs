var CMDBWsDMPolicyTypeManager = Class.create();
CMDBWsDMPolicyTypeManager.prototype = Object.extendsObject(CMDBWsDMConstants, {
    /**
     * This class will have all core business logic to perform on various operation related to policy type.
     */
    initialize: function() {
    },

    getSubflows: function(policyTypeId) {
        return CMDBWsDMUtil.execute.call(this, this.ACTIONS.DM_GET_SUB_FLOWS, this._getSubFlows, policyTypeId);
    },

    _getSubFlows: function(policyTypeId) {
        var subflowArr = [];
        var categorySysId = null;

        var grPolicyCat = new GlideRecordSecure(this.CMDB_POLICY_TYPE_CATEGORIES.TABLE);
        grPolicyCat.addQuery(this.CMDB_POLICY_TYPE_CATEGORIES.CMDB_POLICY_TYPE, policyTypeId);
        grPolicyCat.query();
        if (!grPolicyCat.next()) {
            return subflowArr;
        }
        categorySysId = grPolicyCat.getValue(this.CMDB_POLICY_TYPE_CATEGORIES.SUBFLOW_CATEGORY);
        var grSubflow = new GlideRecordSecure(this.SUBFLOW.TABLE);
        grSubflow.addQuery(this.SUBFLOW.CATEGORY, categorySysId);
        grSubflow.addQuery(this.SUBFLOW.TYPE, this.SUBFLOW.SUBFLOW);
        grSubflow.orderByDesc(this.SYS_CREATED_ON);
        grSubflow.addActiveQuery();
        grSubflow.query();
        while (grSubflow.next()) {
            subflowArr.push({
                id: grSubflow.getValue(this.SYS_ID),
                label: grSubflow.getDisplayValue(this.SUBFLOW.NAME)
            });
        }
        return subflowArr;
    },

    /**
     * Add record into exclusion list via encoded query. This method currently only support cmdb_cis.
     * @param {*} policyTypeId : Policy Type for which record will be excluded
     * @param {*} queryFilter : Add all records into exclusion list eligible to this query filter.
     *                      {
                                table: Name of from which record need to be excluded
                                encoded_query: Exclude all records eligible to this encoded query. 
     *                       }
     * @returns: Final count of records got inserted into exclusion list.
     */
    addRecordToExclusionListUsingQueryFilter: function(policyTypeId, queryFilter, recordsSelected) {
        return CMDBWsDMUtil.execute.call(this, this.ACTIONS.DM_ADD_RECORD_TO_EXCLUSION_LIST_USING_QUERY_FILTER, this._addRecordToExclusionListUsingQueryFilter, policyTypeId, queryFilter, recordsSelected);
    },

    _addRecordToExclusionListUsingQueryFilter: function(policyTypeId, queryFilter, recordsSelected) {
        CMDBWsDMUtil.validateRequiredParam(
            policyTypeId, {
            action: this.ACTIONS.DM_ADD_RECORD_TO_EXCLUSION_LIST_USING_QUERY_FILTER,
            message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Policy Type ID is required"),
            details: "Policy Type ID is required when adding record into exclusion list",
        });

        if (global.JSUtil.nil(queryFilter) || global.JSUtil.nil(queryFilter.table) ) {
            throw new CMDBWsError({
                code: this.ERROR_CODES.DM_EXCLUSION_INVALID_QUERY_FILTER,
                action: this.ACTIONS.DM_ADD_RECORD_TO_EXCLUSION_LIST_USING_QUERY_FILTER,
                source: this.DM_ERROR_SOURCE,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Invalid value provided for queryFilter parameters"),
                details: "Invalid value provided for queryFilter parameters. Require format {table:cmdb_ci, encoded_query:''}"
            });
        }
        var insertedRecordCount  = 0;
        switch (policyTypeId) {
            case this.OOB_POLICY_TYPES.RETIRE.sys_id:
            case this.OOB_POLICY_TYPES.ARCHIVE.sys_id:
            case this.OOB_POLICY_TYPES.DELETE.sys_id:
            case this.OOB_POLICY_TYPES.ATTESTATION.sys_id:
            case this.OOB_POLICY_TYPES.DEPENDENT_CI_ARCHIVE.sys_id:
            case this.OOB_POLICY_TYPES.DEPENDENT_CI_DELETION.sys_id:
            case this.OOB_POLICY_TYPES.DEPENDENT_CI_RETIRE.sys_id:
            case this.OOB_POLICY_TYPES.DELETE_CMDB_RELATED_ENTRY.sys_id:
				if (recordsSelected <= CMDBWsDMProperties.getManualExclusionRecordLimit()) {
					insertedRecordCount = (new CMDBWsDMExclusionListAccessor()).addCIToExclusionListUsingQueryFilter(policyTypeId, queryFilter);
				} else {
					gs.eventQueue(this.EVENTS.ADD_EXCLUSION_LIST_RECORDS, null, policyTypeId, JSON.stringify(queryFilter));
					insertedRecordCount = -1;
				}
                break;
            default:
                //Note: in future we may add support for other policy type.
                throw new CMDBWsError({
                    code: this.ERROR_CODES.DM_EXCLUSION_NOT_SUPPORTED,
                    action: this.ACTIONS.DM_ADD_RECORD_TO_EXCLUSION_LIST_USING_QUERY_FILTER,
                    source: this.DM_ERROR_SOURCE,
                    message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Exclusion list is not supported for policyType:{0}", { 0: CMDBWsDMUtil.getPolicyTypeName(policyTypeId) }),
                    details: "Exclusion list is only supported currently for the retire, archive, delete and attestation policy type"
                });
        }
        return insertedRecordCount;
    },

    /**
     * Add record into exclusion list. This method currently only support cmdb_cis.
     * @param {*} policyTypeId 
     * @param {*} recordList 
     * @returns: Array of RecordIds failed to insert into exclusion list.
     */
    addRecordToExclusionList: function(policyTypeId, recordList) {
		return CMDBWsDMUtil.execute.call(this, this.ACTIONS.DM_ADD_RECORD_TO_EXCLUSION_LIST, this._addRecordToExclusionList, policyTypeId, recordList);
    },

    _addRecordToExclusionList: function(policyTypeId, recordList) {
        CMDBWsDMUtil.validateRequiredParam(
            policyTypeId, {
            action: this.ACTIONS.DM_ADD_INTO_EXCLUSION_LIST,
            message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Policy Type ID is required"),
            details: "Policy Type ID is required when adding record into exclusion list",
        });

        if (global.JSUtil.nil(recordList) || recordList.length == 0)
            return;

        var result = {};
        result.failedRecordIds = [];
        switch (policyTypeId) {
            case this.OOB_POLICY_TYPES.RETIRE.sys_id:
            case this.OOB_POLICY_TYPES.ARCHIVE.sys_id:
            case this.OOB_POLICY_TYPES.DELETE.sys_id:
            case this.OOB_POLICY_TYPES.ATTESTATION.sys_id:
            case this.OOB_POLICY_TYPES.DEPENDENT_CI_ARCHIVE.sys_id:
            case this.OOB_POLICY_TYPES.DEPENDENT_CI_DELETION.sys_id:
            case this.OOB_POLICY_TYPES.DEPENDENT_CI_RETIRE.sys_id:
            case this.OOB_POLICY_TYPES.DELETE_CMDB_RELATED_ENTRY.sys_id:
                result = (new CMDBWsDMExclusionListAccessor()).addCIToExclusionList(policyTypeId, recordList);
                break;
            default:
                //Note: in future we may add support for other policy type.
                throw new CMDBWsError({
                    code: this.ERROR_CODES.DM_EXCLUSION_NOT_SUPPORTED,
                    action: this.ACTIONS.DM_ADD_RECORD_TO_EXCLUSION_LIST,
                    source: this.DM_ERROR_SOURCE,
                    message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Exclusion list is not supported for policyType:{0}", { 0: CMDBWsDMUtil.getPolicyTypeName(policyTypeId) }),
                    details: "Exclusion list is only supported currently for the retire, archive, delete and attestation policy type"
                });
        }
        if (result && result.erroredCiSysIds && result.erroredCiSysIds.length > 0) {
            throw new CMDBWsError({
                code: this.ERROR_CODES.DM_EXCLUSION_INSERT_ERROR,
                action: this.ACTIONS.DM_ADD_RECORD_TO_EXCLUSION_LIST,
                source: this.DM_ERROR_SOURCE,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Failed to insert records:{0} into exclusion list for policy type:{1}.", { 0: result.failedRecordIds.join(","), 1: CMDBWsDMUtil.getPolicyTypeName(policyTypeId) }),
                details: "Error encounter adding records into exclusion list!!"
            });
        }
		return result;
    },

    removeSelectedRecordsFromExclusionList: function(selectedSysId) {
        return CMDBWsDMUtil.execute.call(this, this.ACTIONS.DM_REMOVE_RECORD_FROM_EXCLUSION_LIST, this._removeSelectedRecordFromExclusionList, selectedSysId);
    },

    _removeSelectedRecordFromExclusionList: function(selectedSysId) {
        if (global.JSUtil.nil(selectedSysId) || selectedSysId.length == 0)
            return;

        new CMDBWsDMExclusionListAccessor().removeSelectedRecordsFromExclusionList(selectedSysId);
    },


    /**
     * Remove Records from exclusion list for given policy type.This method currently only support cmdb_cis.
     * @param {*} policyTypeId 
     * @param {*} recordList 
     * @returns 
     */
    removeRecordFromExclusionList: function(policyTypeId, recordList) {
        return CMDBWsDMUtil.execute.call(this, this.ACTIONS.DM_REMOVE_RECORD_FROM_EXCLUSION_LIST, this._removeRecordFromExclusionList, policyTypeId, recordList);
    },

    _removeRecordFromExclusionList: function(policyTypeId, recordList) {
        CMDBWsDMUtil.validateRequiredParam(
            policyTypeId, {
            action: this.ACTIONS.DM_REMOVE_RECORD_FROM_EXCLUSION_LIST,
            message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Policy Type ID is required"),
            details: "Policy Type ID is required when removing record from exclusion list",
        });

        if (global.JSUtil.nil(recordList) || recordList.length == 0)
            return;

        switch (policyTypeId) {
            case this.OOB_POLICY_TYPES.RETIRE.sys_id:
            case this.OOB_POLICY_TYPES.ARCHIVE.sys_id:
            case this.OOB_POLICY_TYPES.DELETE.sys_id:
            case this.OOB_POLICY_TYPES.ATTESTATION.sys_id:
            case this.OOB_POLICY_TYPES.DEPENDENT_CI_ARCHIVE.sys_id:
            case this.OOB_POLICY_TYPES.DEPENDENT_CI_DELETION.sys_id:
            case this.OOB_POLICY_TYPES.DEPENDENT_CI_RETIRE.sys_id:
            case this.OOB_POLICY_TYPES.DELETE_CMDB_RELATED_ENTRY.sys_id:
                new CMDBWsDMExclusionListAccessor().removeCIFromExclusionList(policyTypeId, recordList);
                break;
            default:
                //Note: in future we may add support for other policy type.
                throw new CMDBWsError({
                    code: this.ERROR_CODES.DM_EXCLUSION_NOT_SUPPORTED,
                    action: this.ACTIONS.DM_REMOVE_RECORD_FROM_EXCLUSION_LIST,
                    source: this.DM_ERROR_SOURCE,
                    message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Exclusion list is not supported for policyType:{0}", { 0: CMDBWsDMUtil.getPolicyTypeName(policyTypeId) }),
                    details: "Exclusion list is only supported currently for the retire, archive, delete and attestation policy type"
                });
        }
    },
    /**
     * Remove all records from exclusion list, with optional encoded_query. executed when user selects all records from the list. 
     * @param {*} encoded_query - is used when user selects all records and then unselects some records
     * @returns 
     */
    removeRecordsFromExclusionList: function(encoded_query) {
        return CMDBWsDMUtil.execute.call(this, this.ACTIONS.DM_REMOVE_RECORD_FROM_ALL_EXCLUSION_LIST, this._removeRecordsFromExclusionList, encoded_query);
    },

    _removeRecordsFromExclusionList: function(encoded_query) {
        if (global.JSUtil.nil(encoded_query))
            encoded_query = ''; //encoded_query here is optional. If it's not passed in or empty, it should remove all records from exclusion list table
        new CMDBWsDMExclusionListAccessor().removeRecordsFromExclusionList(encoded_query);
    },
    type: 'CMDBWsDMPolicyTypeManager'
});
