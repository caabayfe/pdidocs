var CMDBWsDMRetirementCustomDefAccessor = Class.create();
CMDBWsDMRetirementCustomDefAccessor.prototype = Object.extendsObject(CMDBWsDMConstants, {
    /**
     * This class will have all methods that does CRUD operation using GlideRecord on Retirement Custom Definition table
     */
    initialize: function() {},
    type: 'CMDBWsDMRetirementCustomDefAccessor',


    /**
     * Add Retirement Custom definition
     * NOTE: Business Rule on the table verifies following things
     *  - Only one definition per cmdb table is allowed.
     *  - The use of 'OR' conditions are not permitted when defining retirement state. Single conditions and conjoined conditions using 'AND' are allowed
     *  - All retirement definitions must be in the form of '<field> is <value>' statements
     * @param {*} tableName : Table name
     * @param {*} queryCondition : Encoded Query condition
     * @param {*} activeFlag : true/false
     * 
     * @returns sys_id of the newly added retirement custom definition.
     */
    addRetirementCustomDefinition: function(tableName, queryCondition, activeFlag) {
        if (global.JSUtil.nil(tableName) || global.JSUtil.nil(queryCondition))
            return;

        this._validate(null, tableName, queryCondition, this.ACTIONS.DM_ADD_RETIREMENT_CUSTOM_DEFINITION);
        queryCondition = this._cleanLifeCycleFields(queryCondition);
        var gr = new GlideRecordSecure(this.RETIREMENT_CUSTOM_DEFINITIONS.TABLE);
        gr.initialize();
        gr.setValue(this.RETIREMENT_CUSTOM_DEFINITIONS.TABLE_COL, tableName);
        gr.setValue(this.RETIREMENT_CUSTOM_DEFINITIONS.RETIREMENT_DEFINITION, queryCondition);
        gr.setValue(this.RETIREMENT_CUSTOM_DEFINITIONS.ACTIVE, activeFlag);
        var sysId = gr.insert();
        if (sysId)
            return sysId;
        else {
            var lastError = gr.getLastErrorMessage();
            throw new CMDBWsError({
                code: this.ERROR_CODES.DM_FAILED_INSERT,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Fail to insert Retirement definition: {0}", { 0: lastError }),
                action: this.ACTIONS.DM_ADD_RETIREMENT_CUSTOM_DEFINITION,
                source: this.DM_ERROR_SOURCE,
                details: "Fail to insert Retirement definition. Reason: " + lastError
            });
        }
    },

    /** 
     * Do following validation for retirement custom definition.
     *  - Only one definition per cmdb table is allowed.
     *  - The use of 'OR' conditions are not permitted when defining retirement state. Single conditions and conjoined conditions using 'AND' are allowed
     *  - All retirement definitions must be in the form of '<field> is <value>' statements
     * @param {*} definitionId 
     * @param {*} tableName 
     * @param {*} queryCondition 
     * @param {*} action 
     */
    _validate: function(definitionId, tableName, queryCondition, action) {
        // Note: purposefully using GlideRecord to perform duplicate checks against all records
        var gr = new GlideRecord(this.RETIREMENT_CUSTOM_DEFINITIONS.TABLE);
        gr.addQuery(this.RETIREMENT_CUSTOM_DEFINITIONS.TABLE_COL, tableName);
        gr.query();

        //Check for duplicate entry for the table
        if (gr.next() && gr.getUniqueValue() != definitionId) {
            throw new CMDBWsError({
                code: this.ERROR_CODES.DM_RETIREMENT_CUSTOM_DEFINITION_VALIDATION_ERROR,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Validation failed: Only one Retirement definition per cmdb table is allowed."),
                action: action,
                source: this.DM_ERROR_SOURCE,
                details: "Validation failed: Only one Retirement definition per cmdb table is allowed."
            });
        }

        //no use of "OR" conditions not allowed
        if (queryCondition.includes('^OR') || queryCondition.includes('^NQ')) {
            throw new CMDBWsError({
                code: this.ERROR_CODES.DM_RETIREMENT_CUSTOM_DEFINITION_VALIDATION_ERROR,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Validation failed: The use of 'OR' conditions are not permitted when defining retirement state. Single conditions and conjoined conditions using 'AND' are allowed."),
                action: action,
                source: this.DM_ERROR_SOURCE,
                details: "Validation failed: The use of 'OR' conditions are not permitted when defining retirement state. Single conditions and conjoined conditions using 'AND' are allowed."
            });
        }

        //check for non '=' pairs
        var encodedPairs = queryCondition.split('^');
        for (var i = 0; i < encodedPairs.length; i++) {
            if ('EQ'.equals(encodedPairs[i])) //default final clause in all encoded queries
                continue;

            // check if operator used is 'is not' (!=) or missing of 'is' (=) operator 
            if (encodedPairs[i].indexOf('!=') > 0 || encodedPairs[i].indexOf('=') < 0) {
                throw new CMDBWsError({
                    code: this.ERROR_CODES.DM_RETIREMENT_CUSTOM_DEFINITION_VALIDATION_ERROR,
                    message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Validation failed: All Retirement definitions must be in the form of '<field> is <value>' statements. Not allowed condition: '{0}'", { 0: encodedPairs[i] }),
                    action: action,
                    source: this.DM_ERROR_SOURCE,
                    details: "Validation failed: All retirement definitions must be in the form of '<field> is <value>' statements.  Not allowed condition: " + encodedPairs[i]
                });
            }
            var pair = encodedPairs[i].split('=');
            if (pair.length != 2 || gs.nil(pair[0]) || gs.nil(pair[1])) {
                throw new CMDBWsError({
                    code: this.ERROR_CODES.DM_RETIREMENT_CUSTOM_DEFINITION_VALIDATION_ERROR,
                    message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Validation failed: All Retirement definitions must be in the form of '<field> is <value>' statements. Not allowed condition: '{0}'", { 0: encodedPairs[i] }),
                    action: action,
                    source: this.DM_ERROR_SOURCE,
                    details: "Validation failed: All retirement definitions must be in the form of '<field> is <value>' statements.  Not allowed condition: " + encodedPairs[i]
                });
            }
        }
    },
    /**
        * life_cycle_stage and life_cycle_stage_status use the name field as their reference keys
        * from cmdb_ci and UIB condition builder does not honor non-sysId reference keys
        * @param {*} queryCondition : Encoded Query condition
        * @returns updated encoded query string
        */
    _cleanLifeCycleFields: function(queryCondition) {
        var encodedPairs = queryCondition.split('^');
        for (var i = 0; i < encodedPairs.length; i++) {
            var condition = encodedPairs[i].split('=');
            if (condition.length == 2) {
                var field = condition[0];
                var value = condition[1];
                // check if field is a life cycle field
                if (field === this.CMDB_CI.LIFE_CYCLE_STAGE || field === this.CMDB_CI.LIFE_CYCLE_STAGE_STATUS) {
                    var gr = new GlideRecordSecure(field);
                    // if a record is returned, get the name and update the condition to use it
                    if (gr.get(value)) {
                        condition[1] = gr.getValue(this.NAME);
                    }
                }
            }
            // rejoin the condition
            condition = condition.join('=');
            // update the condition within the encoded query in case there was an update
            encodedPairs[i] = condition;
        }
        return encodedPairs.join('^');
    },
    /* Update Retirement Custom definition
     * NOTE: Business Rule on the table verifies following things
     *  - Only one definition per cmdb table is allowed.
     *  - The use of 'OR' conditions are not permitted when defining retirement state. Single conditions and conjoined conditions using 'AND' are allowed
     *  - All retirement definitions must be in the form of '<field> is <value>' statements
     * @param {*} definitionId : SysId for existing Retirement custom definition record
     * @param {*} tableName : Table name
     * @param {*} queryCondition : Encoded Query
     * @param {*} activeFlag : true/false
     * 
     * @returns.
     */
    updateRetirementCustomDefinition: function(definitionId, tableName, queryCondition, activeFlag) {
        if (global.JSUtil.nil(definitionId) || global.JSUtil.nil(tableName) || global.JSUtil.nil(queryCondition))
            return;

        if (!CMDBWsDMUtil.hasPermissionToModifyPolicy()) {
            throw new CMDBWsError({
                code: this.ERROR_CODES.DM_USER_MISSING_WRITE_ACL,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "The user does not have permission to update Retirement definition"),
                action: this.ACTIONS.DM_UPDATE_RETIREMENT_CUSTOM_DEFINITION,
                source: this.DM_ERROR_SOURCE,
                details: "No permission to update retirement definition. Data manager admin role required"
            });
        }
        var gr = new GlideRecord(this.RETIREMENT_CUSTOM_DEFINITIONS.TABLE);
        gr.addQuery(this.SYS_ID, definitionId);
        gr.query();
        if (gr.next()) {
            this._validate(definitionId, tableName, queryCondition, this.ACTIONS.DM_UPDATE_RETIREMENT_CUSTOM_DEFINITION);
            queryCondition = this._cleanLifeCycleFields(queryCondition);
            gr.setValue(this.RETIREMENT_CUSTOM_DEFINITIONS.TABLE_COL, tableName);
            gr.setValue(this.RETIREMENT_CUSTOM_DEFINITIONS.RETIREMENT_DEFINITION, queryCondition);
            gr.setValue(this.RETIREMENT_CUSTOM_DEFINITIONS.ACTIVE, activeFlag);
            if (!gr.update()) {
                var lastError = gr.getLastErrorMessage();
                throw new CMDBWsError({
                    code: this.ERROR_CODES.DM_FAILED_UPDATE,
                    message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Fail to update Retirement definition: {0}", { 0: lastError }),
                    action: this.ACTIONS.DM_UPDATE_RETIREMENT_CUSTOM_DEFINITION,
                    source: this.DM_ERROR_SOURCE,
                    details: "Fail to update Retirement Definition. Reason: " + lastError
                });
            }
        } else {
            throw new CMDBWsError({
                code: this.ERROR_CODES.DM_FAILED_UPDATE,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Invalid Retirement definition Id: {0}", { 0: definitionId }),
                action: this.ACTIONS.DM_UPDATE_RETIREMENT_CUSTOM_DEFINITION,
                source: this.DM_ERROR_SOURCE,
                details: "Invalid Retirement definition id has been provided.",
            });
        }
    },
});
