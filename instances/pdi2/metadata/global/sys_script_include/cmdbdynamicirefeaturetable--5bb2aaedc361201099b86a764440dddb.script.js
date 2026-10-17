var CMDBDynamicIREFeatureTable = Class.create();
CMDBDynamicIREFeatureTable.prototype = {

    // Tables to filter out from the base table cmdb_ci.
    _EXCLUDED_TABLES: {
        ecc_event: true,
        discovery_log: true,
        cmdb_metric: true,
        u_eal_submission: true,
        cmdb_dynamic_ire_match: true,
        sa_notification: true
    },

    _CMDB_CI: 'cmdb_ci',

    initialize: function() {
        this.baseTable = this._CMDB_CI;
        this.addRef = false;

        // If we are a cmdb_dynamic_ire_filter_condition add extended and ref tables from the current parent table.
        if (!gs.nil(current.dynamic_model)) {
            this.baseTable = current.dynamic_model.cmdb_class;
            this.addRef = true;
        }

        // If we are a cmdb_dynamic_ire_feature add extended and ref tables from the current parent table.
        if (!gs.nil(current.filter_condition)) {
            this.baseTable = current.filter_condition.cmdb_class;
            this.addRef = true;
        }
    },

    process: function() {
        var map = {};
        var tables = GlideDBObjectManager.get().getHierarchy(this.baseTable);

        for (var i = 0; i < tables.size(); i++) {
            var table = tables.get(i) + '';
            map[table] = '';
            if (this.addRef == true) {
                var refTables = this._getReferencingTables(table);
                for (var j = 0; j < refTables.length; j++)
                    map[refTables[j]] = '';
            }
        }

        var result = [];
        for (var tab in map)
            if (!this._filterTable(tab))
                result.push(tab);

        return result;
    },

    _filterTable: function(table) {
        return table == this.baseTable ||
            this._EXCLUDED_TABLES[table] ||
            table.startsWith('var__');
    },

    _getReferencingTables: function(table) {
        var tables = [];
        var gr = new GlideAggregate('sys_dictionary');
        gr.addQuery('reference', table);
        // exclude entries for duplicate_of field
        gr.addQuery('element', '!=', 'duplicate_of');
        gr.addAggregate('count');
        gr.orderByAggregate('count');
        gr.groupBy('name');
        gr.query();
        while (gr.next())
            tables.push('' + gr.name);

        return tables;
    },

    type: 'CMDBDynamicIREFeatureTable'
};
