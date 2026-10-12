var CustomTableInfoProvider = Class.create();
CustomTableInfoProvider.prototype = {
    initialize: function() {
    },

    /**
     * Return the count of custom tables found in specified scope which have not been
     * exempted for licensing purposes
     * 
     * @param {string} scope is the name of the scope in sys_scope.scope 
     * @param {integer} count of custom tables
     */
    getCustomTableCountForCustomApp: function(scope) {
        return this._getCustomTableCount(scope);
    },

    /**
     * Return the count of custom tables which have not been exempted for licensing purposes
     * 
     * @param {integer} count of custom tables
     */
    getCustomTableCount: function() {
        return this._getCustomTableCount(null);
    },

    _getCustomTableCount: function(scope) {
        const gr = new GlideRecord('ua_custom_table_inventory');
        if (scope)
            gr.addQuery('app_scope', scope);
        gr.addQuery('allotment_type', '!=', '2').addOrCondition('allotment_type', '=', 'null');
        const exemptedTableNames = this._getManuallyExemptedTableNames();
        // even though table_ref_id (sys_id of sys_db_object) would have been more
        // efficient to match since there is an index on it, it is not looked up and
        // stored when a manually exempted table record is created
        if (exemptedTableNames.length > 0)
            gr.addQuery('table_name', 'NOT IN', exemptedTableNames);
        gr.query();

        return gr.getRowCount();
    },

    _getManuallyExemptedTableNames: function() {
        const gr = new GlideRecord('ua_exempted_table_inventory');
        gr.addQuery('exempt_type', 'manually_exempted_table');
        gr.query();
        const tables = [];
        while (gr.next())
            tables.push(this._getTableName(gr));

        return tables;
    },

    _getTableName: function(gr) {
        return gr.table_name + '';
    },

    type: 'CustomTableInfoProvider'
};
