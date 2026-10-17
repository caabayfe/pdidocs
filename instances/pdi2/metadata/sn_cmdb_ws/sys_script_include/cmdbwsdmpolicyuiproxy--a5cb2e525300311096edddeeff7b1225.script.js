var CMDBWsDMPolicyUIProxy = Class.create();
CMDBWsDMPolicyUIProxy.prototype = {
    /**
     * This class will have all methods that UI Data broker will call.
     * Rather than directly calling any backend script include, UI broker will only call method exposed via Proxy Class. 
     * This way we can decouple the backend script include changes, like method signature changes, without impacting UI.
     * Also it would be simple to find out all backend methods exposed to UI.
     */
    _policyMgr: undefined,
    _policyTypeMgr: undefined,
    _policySettingMgr: undefined,
    initialize: function() {
        this._policyMgr = new CMDBWsDMPolicyManager();
        this._policyTypeMgr = new CMDBWsDMPolicyTypeManager();
        this._policySettingMgr = new CMDBWsDMPolicySettingManager();
    },

    /**
     * Get Policy information.
     * @param {*} policyId
     * @returns: Policy Dto with policy details.
     * {
     *  "general_info": {},
     *  "data_filter" : {},
     *  "assignment"  : {},
     *  "options"     : {},
     *  "schedule"    : {}
     * }
     */
    getPolicyInfo: function(policyId) {
        return this._policyMgr.getPolicyInfo(policyId);
    },

    getPolicyReviewInfo: function(policyId) {
        return this._policyMgr.getPolicyReviewInfo(policyId);
    },

    /**
     * Gets policy execution details
     * @param {*} policyExecutionId 
     * @returns Policy execution details
     */
    getPolicyExecutionInfo: function(policyExecutionId) {
        return this._policyMgr.getPolicyExecutionInfo(policyExecutionId);
    },

    /**
     * Create Draft Policy. This function will create draft policy by simply passing general information of the policy.
     * @param {*} name
     * @param {*} description
     * @param {*} policyType
     * @param {*} workNotes
     */
    createDraftPolicy: function(name, description, policyType, workNotes) {
        return this._policyMgr.createDraftPolicy(name, description, policyType, workNotes);
    },
    /**
     * Update Policy information based on the Update Payload.
     * @param {*} policyId
     * @param {*} policyPayload : {
     *                              "general_info": {},
     *                              "data_filter" : {},
     *                              "assignment"  : {},
     *                              "options"     : {},
     *                              "schedule"    : {}
     *                             }
     */
    updatePolicy: function(policyId, policyPayload) {
        return this._policyMgr.updatePolicy(policyId, policyPayload);
    },
    /**
     * Delete Policy
     * @param {*} policyId
     */
    deletePolicy: function(policyId) {
        return this._policyMgr.deletePolicy(policyId);
    },
    /**
     * Delete Selected Policies
     * @param {*} encodedQuery
     * @param {*} runTimeAttrSysIds - policy runtime attribute sysIds
     */
    deleteSelectedPolicies: function(encodedQuery, runTimeAttrSysIds) {
        return this._policyMgr.deleteSelectedPolicies(encodedQuery, runTimeAttrSysIds);
    },
    /**
     * Mark Policies for Deletion
     * @param {*} encodedQuery
     * @param {*} runTimeAttrSysIds - policy runtime attribute sysIds
     */
    markPoliciesForDeletion: function(encodedQuery, runTimeAttrSysIds) {
        return this._policyMgr.markPoliciesForDeletion(encodedQuery, runTimeAttrSysIds);
    },
    /**
     * Activate/deactivate the policy
     * @param {*} policyId
     * @param {*} flag: boolean value of true/false. True means activate and false means deactivate
     */
    activatePolicy: function(policyId, flag) {
        return this._policyMgr.activatePolicy(policyId, flag);
    },
    /**
     * Publish policy
     * @param {*} policyId
     */
    publishPolicy: function(policyId) {
        return this._policyMgr.publishPolicy(policyId);
    },
    searchDataFilterTableOptions: function(searchTerm, policyType, currentValue) {
        return this._policyMgr.searchDataFilterTableOptions(searchTerm, policyType, currentValue);
    },
    buildDataFilterForPreview: function(policyTypeId, table, encodedQuery) {
        return this._policyMgr.buildDataFilterForPreview(policyTypeId, table, encodedQuery);
    },
    getSubflows: function(policyTypeId) {
        return this._policyTypeMgr.getSubflows(policyTypeId);
    },
    addRecordToExclusionList: function(policyTypeID, recordList) {
        return this._policyTypeMgr.addRecordToExclusionList(policyTypeID, recordList);
    },
    removeRecordFromExclusionList: function(policyTypeID, recordList) {
        return this._policyTypeMgr.removeRecordFromExclusionList(policyTypeID, recordList);
    },
    addRetirementCustomDefinition: function(tableName, queryCondition, activeFlag) {
        return this._policySettingMgr.addRetirementCustomDefinition(tableName, queryCondition, activeFlag);
    },
    updateRetirementCustomDefinition: function(definitionId, tableName, queryCondition, activeFlag) {
        return this._policySettingMgr.updateRetirementCustomDefinition(definitionId, tableName, queryCondition, activeFlag);
    },
    getEligibleTables: function(policyId) {
        return this._policyMgr.getEligibleTables(policyId);
    },
    getGroupFieldsForTable: function(tableName) {
        return this._policyMgr.getReferenceFieldsForTableByType(tableName, this._policyMgr.SYS_DICTIONARY.SYS_USER_GROUP);
    },
    getReferenceFieldsForTable: function(tableName) {
        return this._policyMgr.getReferenceFieldsForTableByType(tableName, '');
    },
    getUserFieldsForTable: function(tableName) {
        return this._policyMgr.getReferenceFieldsForTableByType(tableName, this._policyMgr.SYS_USER.TABLE);
    },
    getAssignmentSearchResults: function(args) {
        return this._policyMgr.getSearchResults(args);
    },
    getDataManagerUserGroups: function(searchTerm) {
        return this._policyMgr.getDataManagerUserGroups(searchTerm);
    },
    getPropertiesNameAndValue: function() {
        return CMDBWsDMProperties.getPropertiesNameAndValue();
    },
    getUserGroups: function(searchText) {
        return this._policyMgr.getUserGroups(searchText);
    },
    updateProperties: function(properties) {
        return CMDBWsDMProperties.updateProperties(properties);
    },
    resetToDefaultProperties: function(properties) {
        return CMDBWsDMProperties.resetToDefaultProperties(properties);
    },
    getUpcomingSchedules: function(startDate, endDate) {
        return this._policyMgr.getUpcomingSchedules(startDate, endDate);
    },
    getAssignmentTypeOptions: function(tableName) {
        return this._policyMgr.getAssignmentTypeOptions(tableName);
    },
    getCertSchedulesCounts: function() {
        return this._policyMgr.getCertSchedulesCounts();
    },
    migrateLegacyDataCertSchedules: function(progressId) {
        return this._policyMgr.migrateLegacyDataCertSchedules(progressId);
    },
    getJobRunnersList: function(userGroupId, currUserId) {
        return this._policySettingMgr.getScheduledJobRunnersList(userGroupId, currUserId);
    },
    getDefaultJobRunner: function() {
        return this._policySettingMgr.getDefaultJobRunner();
    },
    getRecordLabel: function(recordId, recordTable, defaultLabel) {
        if (!gs.nil(recordId) && !gs.nil(recordTable)) {
            var recordGr = new GlideRecord(recordTable);
            if (recordGr.get(recordId)) {
                return recordGr.getDisplayValue();
            }
        }
        return defaultLabel;
    },

    type: 'CMDBWsDMPolicyUIProxy'
};
