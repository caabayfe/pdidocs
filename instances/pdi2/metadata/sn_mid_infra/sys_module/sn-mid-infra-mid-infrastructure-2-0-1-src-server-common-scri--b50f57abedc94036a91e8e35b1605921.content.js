/**
 * RecordUtility class for common record validation operations.
 */
var RecordUtility = Class.create();
RecordUtility.prototype = {
    initialize: function() {
        this.validationUtil = new ValidationUtility();
        this.sessionToken = undefined;
    },

    /**
     * Checks if a table exists in the system.
     * @param {string} tableName - The name of the table to check
     * @returns {boolean} True if the table exists; otherwise false
     * @throws {InvalidValueError} When tableName is invalid
     */
    tableExists: function(tableName) {
        this.validationUtil.validateNonEmptyString(tableName, 'tableName', true);
        return gs.tableExists(tableName);
    },

    /**
     * Validates if a record exists in the specified table.
     * @param {string} tableName - The name of the table to check
     * @param {string} sysId - The sys_id of the record to validate
     * @returns {boolean} True if the record exists in the table; otherwise false
     * @throws {InvalidValueError} When tableName is invalid
     * @throws {InvalidValueError} When sysId is not string
     */
    exists: function(tableName, sysId) {
        this.validationUtil.validateNonEmptyString(tableName, 'tableName', true);
        
        // Return false if sysId is null or undefined
        if (gs.nil(sysId)) {
            return false;
        }

        this.validationUtil.validateString(sysId, 'sysId', true);

        // Check if table exists
        if (!this.tableExists(tableName)) {
            throw new InvalidValueError('Invalid tableName: Table does not exist: ' + tableName + ' Session Token: ' + this._getSessionToken());
        }

        // Check if record exists
        var gr = new GlideRecord(tableName);
        gr.addQuery('sys_id', sysId)
        gr.query();
        return gr.next();
    },

    /**
     * Gets a list of unique values for a given column in a table.
     * @param {string} tableName - The name of the table to query.
     * @param {string} columnName - The name of the column to get unique values from.
     * @param {string} [encodedQuery] - An optional encoded query string to filter the records.
     * @returns {string[]} An array of unique values.
     */
    _getSessionToken: function() {
        if (this.sessionToken === undefined) {
            this.sessionToken = gs.getSession() ? gs.getSession().getSessionToken() : '';
        }
        return this.sessionToken;
    },

    getUniqueColumnValues: function(tableName, columnName, encodedQuery) {
        var values = [];
        var ga = new GlideAggregate(tableName);
        if (encodedQuery)
            ga.addEncodedQuery(encodedQuery);
        ga.addNotNullQuery(columnName);
        ga.groupBy(columnName);
        ga.query();
        while (ga.next()) {
            values.push(ga.getValue(columnName));
        }
        return values;
    },

    type: 'RecordUtility'
};
