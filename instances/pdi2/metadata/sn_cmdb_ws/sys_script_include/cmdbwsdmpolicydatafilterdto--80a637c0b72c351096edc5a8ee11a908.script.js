var CMDBWsDMPolicyDataFilterDto = Class.create();
CMDBWsDMPolicyDataFilterDto.prototype = Object.extendsObject(CMDBWsDMConstants, {
    /**
     * This class to hold Policy DataFilter info required for PolicyDto JSON object.
     * Note: If you add any new property in this class it will show up under PolicyDto object when we send it to UI
     * 
     */
    initialize: function() {},

    //Start: Properties to expose
    table: "",
    table_label: "",
    encoded_query: "",
    enforced_condition: "",
    list_filter: "",
    //End: Properties to expose

    /**
     * Populates Data filter and encoded query for preview UI for given Policy
     * @param {*} policyGr 
     */
    populate: function(policyGr) {
        var pTypeId = policyGr.getValue(this.POLICY.TYPE);
        var pTable = policyGr.getValue(this.POLICY.TABLE_COL);
        var pEncodedQuery = policyGr.getValue(this.POLICY.ENCODED_QUERY) || "";

        this.buildDataFilterForPreview(pTypeId, pTable, pEncodedQuery, false);
    },

    validate: function(policyGr) {
        var policyName = policyGr.getValue(this.POLICY.NAME);
        var policyTable = policyGr.getValue(this.POLICY.TABLE_COL);
        //NOTE: empty encoded string should be allowed in case when user would like to run policy for all records within table
        if (gs.nil(policyTable)) {
            throw new CMDBWsError({
                code: this.ERROR_CODES.DM_POLICY_VALIDATION_ERR,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Table is empty for Policy:{0}!", {
                    0: policyName
                }),
                action: this.ACTIONS.DM_VALIDATE_POLICY,
                source: this.DM_ERROR_SOURCE,
                details: "Value of Table must be populated for every policy"
            });
        }
    },

    /**
     * Builds encoded query for preview for given policyTypeId, table and encoded query
     * @param {*} policyTypeId
     * @param {*} policyTable
     * @param {*} encodedQuery
     * @returns: {
     *   table: "",
     *   encodedQuery: "",
     *   enforcedCondition: "",
     *   overlap_message: false
     *   list_filter: ""
     *   excl_list_filter: ""
     * }
     */
    buildDataFilterForPreview: function(policyTypeId, policyTable, encodedQuery, validate) {
        var enforcedConditionObj = {
            enforced_condition: "",
            overlapping_definitions: false
        };

        if (global.JSUtil.nil(policyTable)) {
            policyTable = this.DEFAULT_POLICY_TABLE;
        }

        var gr = new GlideRecord(policyTable);
        if (global.JSUtil.notNil(encodedQuery)) {
            gr.addEncodedQuery(encodedQuery, true);
        }

        if (policyTypeId !== this.OOB_POLICY_TYPES.DELETE_CMDB_RELATED_ENTRY.sys_id) {
            if (CMDBWsDMUtil.isLifecyclePolicyType(policyTypeId)) {
                var policyType = CMDBWsDMUtil.getPolicyTypeInfo(policyTypeId);
                enforcedConditionObj = this._getEnforcedConditionForLifecyclePolicy(policyTable, encodedQuery, policyTypeId);
                if (global.JSUtil.notNil(enforcedConditionObj.enforced_condition) && "sys_class_nameISEMPTY^EQ" != enforcedConditionObj.enforced_condition) {
                    gr.addEncodedQuery(enforcedConditionObj.enforced_condition, false);
                } else if (validate) {
                    throw new CMDBWsError({
                        code: this.ERROR_CODES.DM_MISSING_RETIREMENT_DEFINITION,
                        source: this.ACTIONS.GET_DATA_FILTER,
                        message: sn_i18n.Message.getMessage("sn_cmdb_ws", "No retirement definitions for the impacted classes"),
                        details: "Retirement definition missing for " + policyTable,
                        logError: true
                    });
                }
            }

            //we do not support exclusion list for data cert
            if (policyTypeId !== this.OOB_POLICY_TYPES.CERTIFICATION.sys_id) {
                var exclusionFilter = this._getExclusionFilter(policyTypeId);
                gr.addEncodedQuery(exclusionFilter, false);
            }
        }

        this.table = policyTable;
        this.table_label = gr.getLabel();
        this.encoded_query = encodedQuery;
        this.enforced_condition = enforcedConditionObj.enforced_condition;
        this.enforced_condition_display = enforcedConditionObj.enforced_condition_display;
        this.overlap_message = enforcedConditionObj.overlapping_definitions;
        this.list_filter = gr.getEncodedQuery();
        this.excl_list_filter = this._buildExclFilter(policyTable, encodedQuery, enforcedConditionObj.enforced_condition, policyTypeId);
    },

    _buildExclFilter: function(table, encodedQuery, enforcedCondition, policyTypeId) {
        //sample of what we're trying to transform the input encodedQuery into
        //ci.sys_class_nameINSTANCEOFcmdb_ci_computer^policy_type="+policyTypeId+"^ci.ref_cmdb_ci_computer.hardware_status = in_maintenance
        var finalQuery = "ci.sys_class_nameINSTANCEOF" + table + "^policy_type=" + policyTypeId;
        var wsUtil = new sn_cmdb_ws.CMDBWorkspaceUtil();
        var prefix = (table === "cmdb_ci") ? "ci" : "ci.ref_" + table;
        var transformedQuery = wsUtil.appendRefAlias(encodedQuery, prefix);
        var transformedEnforcedCondition = wsUtil.appendRefAlias(enforcedCondition, 'ci');

        finalQuery = (transformedQuery === '') ? finalQuery : finalQuery + "^" + transformedQuery;
        finalQuery = (transformedEnforcedCondition === '') ? finalQuery : finalQuery + "^" + transformedEnforcedCondition;

        return finalQuery;
    },

    /**
     * Gets the enforced condition for lifecycle policy type
     * @param {*} table
     * @param {*} encodedQuery
     * @param {*} policyTypeName
     * @returns: enforced condition
     * */
    _getEnforcedConditionForLifecyclePolicy: function(table, encodedQuery, policyTypeId) {
        // DEF0387916: This calculation will fail for large CMDBs, commenting out and just using table for data filter preview step
        // var affectedClassNames = CMDBWsDMUtil.getDistinctValues(table, encodedQuery, this.SYS_CLASS_NAME).join();
        var grRetirementDefs = new GlideRecord('cmdb_retirement_custom_definitions');
        grRetirementDefs.addActiveQuery();
        grRetirementDefs.query();
        var overlappingDefinitionCount = 0;
        while (grRetirementDefs.next()) {
            var retTable = new GlideTableHierarchy(grRetirementDefs.getValue('table'));
            var retTables = retTable.getTables();
            if (retTables.indexOf(table) > -1)
                overlappingDefinitionCount++;
        }
        var affectedClassNames = table;
	var policyTypeName = "";
	var policyGr = new GlideRecord("cmdb_policy_type");
	if (policyGr.get(policyTypeId)) {
		policyTypeName = policyGr.getValue('name');
	}
	
        return {
            enforced_condition: sn_cmdb.CMDBRetirementScriptableApi.getFullEncodedQueryCombined(affectedClassNames, policyTypeId, encodedQuery, table),
	    enforced_condition_display: sn_cmdb.CMDBRetirementScriptableApi.getFullEncodedQuery(affectedClassNames, policyTypeName, true),
            overlapping_definitions: overlappingDefinitionCount > 1
        };
    },

    /**
     * Gets the exclusion filter for the policy type
     * @param {*} policyTypeId
     * @returns: exclusion filter
     * */
    _getExclusionFilter: function(policyTypeId) {
        return "RLQUERYcmdb_policy_ci_exclusion_list.ci,=0^policy_type=" + policyTypeId + "^ENDRLQUERY";
    },

    type: 'CMDBWsDMPolicyDataFilterDto'
});
