var IdentificationMainTables = Class.create();
IdentificationMainTables.prototype = {
    // This method will be used by create/edit UI from CI Class Manager
    // Under Main Table Settings tab, valid tables are current table or one of its parent table
    getParentTablesForClassManager: function(className) {
        var result = [];
        // Security: prevent enumeration of tables the caller cannot read.
        if (!this._canReadTable(className))
            return result;
        var tables = j2js(new TableUtils(className).getTables());
        for (var i = 0; i < tables.length; i++) {
            var entry = {};
            entry.value = tables[i];
            entry.name = this._getClassLabel(tables[i]);
            result.push(entry);
        }
        return result;
    },

    // Returns parent tables of current table
    // Current table is not included in the list
    process: function() {
        var parent = '' + current.identifier.applies_to;
        var result = j2js(new TableUtils(parent).getTables());
        var invalidTables = ["cmdb", "cmdb_ci", parent];
        for (var i = 0; i < invalidTables.length; i++) {
            var index = result.indexOf(invalidTables[i]);
            if (index >= 0)
                result.splice(index, 1);
        }
        return result;
    },

    _getClassLabel: function(className) {
        var descriptor = GlideTableDescriptor.get(className);
        return descriptor.getLabel();
    },

    _canReadTable: function(className) {
        if (!className)
            return false;
        // Verify the caller has read access to the target table.
        // IRE rules can apply to non-CMDB tables (via the
        // glide.identification_engine.non_cmdb_tables property and scoped apps),
        // so a hierarchy check is too restrictive; an ACL-based guard is used instead.
        var gr = new GlideRecord(className);
        return gr.isValid() && gr.canRead();
    },

    type: 'IdentificationMainTables'
};
