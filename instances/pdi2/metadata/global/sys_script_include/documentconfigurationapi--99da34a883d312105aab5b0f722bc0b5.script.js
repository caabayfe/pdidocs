var DocumentConfigurationAPI = Class.create();
DocumentConfigurationAPI.prototype = {
    initialize: function() {},

    /**
     * Starts execution of permission rules asynchronously defined in the `ds_document_configuration` table
     * for the specified table and record SysID.
     *
     * @param {String} tableName - The name of the table for which the permission rules need to be executed.
     * @param {String} recordSysID - The SysID of the record for which the permission rules need to be applied.
     * @returns {Object} The result of executing the permission rules from the DocumentPermissionRuleUtils class.
     */
    executePermissionRules: function(tableName, recordSysID) {
        var permissionsUtils = new DocumentPermissionRuleUtils(tableName, recordSysID);
        return permissionsUtils.execute();
    },

    type: 'DocumentConfigurationAPI'
};
