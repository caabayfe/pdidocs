var ExemptedOOBTableDAO = Class.create();
ExemptedOOBTableDAO.prototype = {
    initialize: function() {
        this.UA_EXEMPTED_OOB_TABLE = "ua_exempted_oob_table";
        this.COLUMN_TABLE_NAME = "table_name";
        this.COLUMN_SCOPE = "scope";
        this.COLUMN_IS_EXEMPTED = "is_exempted";
        this.tableExemptMap = new Map();
    },

    insertOrUpdateExemptedOobTableRecords(exemptedOobTables) {
        try {
            for (var i = 0; i < exemptedOobTables.length; i++) {
                var gr = new GlideRecord(this.UA_EXEMPTED_OOB_TABLE);
                gr.addQuery(this.COLUMN_TABLE_NAME, exemptedOobTables[i][this.COLUMN_TABLE_NAME]);
                gr.addQuery(this.COLUMN_SCOPE, exemptedOobTables[i][this.COLUMN_SCOPE]);
                gr.query();
                if (gr.next()) {
                    if (gr.getValue(this.COLUMN_IS_EXEMPTED) != exemptedOobTables[i][this.COLUMN_IS_EXEMPTED]) {
                        gr.setValue(this.COLUMN_IS_EXEMPTED, exemptedOobTables[i][this.COLUMN_IS_EXEMPTED] == '1' ? true : false);
                        gr.update();
                    }
                } else {
                    gr = new GlideRecord(this.UA_EXEMPTED_OOB_TABLE);
                    gr.setValue(this.COLUMN_TABLE_NAME, exemptedOobTables[i][this.COLUMN_TABLE_NAME]);
                    gr.setValue(this.COLUMN_SCOPE, exemptedOobTables[i][this.COLUMN_SCOPE]);
                    gr.setValue(this.COLUMN_IS_EXEMPTED, exemptedOobTables[i][this.COLUMN_IS_EXEMPTED] == '1' ? true : false);
                    gr.insert();
                }
            }
        } catch (e) {
            gs.error("ExemptedOOBTableDAO failed to insert table : " + exemptedOobTables[i]);
        }
    },

    /**
     * @param {String} name of the table
     * @param {String} scope of the app
     * @param {Boolean} is table exempt
     * @returns {Boolean} true if table exists with exempt flag passed
     */
    isTableToExempt: function(tableName, appScope, isExempt) {
        if (!this.tableExemptMap.size)
            this.loadTableExemptMap();

        const flag = this.tableExemptMap.get(tableName + "_" + appScope);
        if (global.JSUtil.nil(flag))
            return false;
        return flag == isExempt;
    },

    loadTableExemptMap: function() {
        var gr = new GlideRecord(this.UA_EXEMPTED_OOB_TABLE);
        gr.query();
        while (gr.next())
            this.tableExemptMap.set(gr.getValue(LicensingEngineDBConstants.TABLE_NAME) + "_" + gr.getValue(LicensingEngineDBConstants.SCOPE), gr.getValue(this.COLUMN_IS_EXEMPTED) == '1');
    },

    type: 'ExemptedOOBTableDAO'
};
