var LicensingEngineGlideRecordHelper = Class.create();
LicensingEngineGlideRecordHelper.prototype = {
    initialize: function() {
        this._helper = new global.LicensingEngineGlobalHelper();
        this.logger = new LoggingUtil();
        this.loggingEnabled = this.logger.isEntitlementLoggingEnabled();
    },

    /**
     * Adds a JOIN query for the dot-walked field. For example,
     * Note: when iterating over multiple records, the ReferenceOptimizer can preLoad() the references 
     * and addExtraField can degrade performance. Use "Debug SQL" to check if addExtraField() is required and is helpful.
     * 
     * const gr = new GlideRecord("subscription_has_family");
     * // gr.addQuery(...)
     * helper.addExtraField(gr, "subscription.sys_id");
     * gr.query();
     * if (gr.next()) {
     *   this dot-walk does not issue a subscription lookup by sys_id query
     *   var subscriptionId = gr.subscription.sys_id
     * }
     * 
     * @param {GlideRecord} gr
     * @param {string} fieldName
     */
    addExtraField: function(gr, fieldName) {
        this._helper.addExtraField(gr, fieldName);
    },

    hasAttachments: function(current) {
        return this._helper.hasAttachments(current);
    },

    /**
     * We have added this method here becuase on certain global licensing tables (CTI,ETI...) we have an access handler active (UATableAccessHandler) which checks if the GlideRecord is not createdByRhino to give CUD permissions. 
     * If the GR is initialised in a scoped app 
     * gr.createdByRhino() returns false 
     * If the GR is initialised in global scope
     * gr.createdByRhino() returns true. 
     * 
     * Only use this method if the table exists in global scope and has delete operation blocked from other scopes.
     * 
     * Helper function to delete records from a table
     * @params {String} name of the table
     * @params Array{Object} query parameters 
     * Ex : query : {"field" : "table_name", 
     * 				 "value" : ["test_1", "test_2"],
     * 				 "operator" : "IN"}
     */
    deleteTableRecordHelper: function(tableName, queryParamsList, isDeleteMultiple) {
        const gr = new GlideRecord(tableName);
        for (var i = 0; i < queryParamsList.length; i++) {
            var queryObj = queryParamsList[i];
            var field = Object.keys(queryObj).includes('field') ? queryObj['field'] : null;
            var value = Object.keys(queryObj).includes('value') ? queryObj['value'] : null;
            var operator = Object.keys(queryObj).includes('operator') ? queryObj['operator'] : null;
            if (global.JSUtil.nil(field) || global.JSUtil.nil(value))
                return "Invalid query param object passed";
            if (!global.JSUtil.nil(operator))
                gr.addQuery(field, operator, value);
            else
                gr.addQuery(field, value);
        }
        gr.query();
        try {
            this._helper.deleteGR(gr, isDeleteMultiple);
        } catch (error) {
            if (this.loggingEnabled) {
                errorMsg = "Failure in delete operation on table : " + tableName + " " + error + " \n " + error.stack;
                this.logger.logError(LicensingEngineConstants.LICENSING_ENGINE_GLIDE_RECORD_HELPER, LicensingEngineConstants.DELETE_TABLE_RECORD_HELPER, errorMsg);
            }
        }
    },

    type: 'LicensingEngineGlideRecordHelper'
};
