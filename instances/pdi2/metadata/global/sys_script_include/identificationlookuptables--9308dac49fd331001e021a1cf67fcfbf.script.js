var IdentificationLookUpTables = Class.create();
IdentificationLookUpTables.prototype = {
	getLookupTables: function(className) {
		var map = {};
		var tables = j2js(new TableUtils(className).getTables());
        for (var i = 0; i < tables.length; i++) {
            var refTables = this._getReferencingTables(tables[i]);
            for (var j = 0; j < refTables.length; j++)
                map[refTables[j]] = '';
        }

        var result = [];
        result.push(className);
        for (var tab in map)
            if (tab != className)
                result.push(tab);

        result = this.filterTable(result);
        return result;
	},

	getLookupTablesForClassManager: function(className) {
		var result = [];
		// Security: prevent enumeration of tables the caller cannot read.
		if (!this._canReadTable(className))
			return result;
		var lookupTables = this.getLookupTables(className);
		for (var i = 0; i < lookupTables.length; i++) {
			if (className == lookupTables[i])
				continue;
			var entry = {};
      entry.value = lookupTables[i];
			entry.name = this._getClassLabel(lookupTables[i]);
			result.push(entry);
		}
		return result;
	},

    filterTable: function(tables) {
		var excluded = ['ecc_event', 'discovery_log', 'cmdb_metric'];
        var filtered = [];
        for (var i = 0; i < tables.length; i++) {
            var tbl = tables[i];
			var j=0;
			while (j<excluded.length) {
				if (tbl.indexOf(excluded[j])==0)
					break;
				j++;
			}
                        // filter out tables meant for workflow
			if (tbl.startsWith('var__'))
				continue;

			if (j==excluded.length)
				filtered.push(tbl);
        }
        return filtered;
    },
	
	getParent : function(table) {
		var result = '';
		var baseTable = new TableUtils(table);
		result = baseTable.getAbsoluteBase(table);
		return result;
	},
	
	process: function() {
        var parent = '' + current.identifier.applies_to;
        var map = {};
        if (GlideStringUtil.nil(current.identifier) || GlideStringUtil.nil(parent)) {
			parent = this.getParent(parent);
            var extensions = j2js(new TableUtils(parent).getTableExtensions());
            for (var i = 0; i < extensions.length; i++) // add all CI types
                map[extensions[i]] = '';
        }
        var tables = j2js(new TableUtils(parent).getTables());
        for (i = 0; i < tables.length; i++) {
            var refTables = this._getReferencingTables(tables[i]);
            for (var j = 0; j < refTables.length; j++)
                map[refTables[j]] = '';
        }

        var result = [];
        result.push(parent);
        for (var tab in map)
            if (tab != parent)
                result.push(tab);

        result = this.filterTable(result);
        return result;
    },

    _getReferencingTables: function(table) {
        var referencingTables = [];
        var gr = new GlideAggregate('sys_dictionary');
        gr.addQuery('reference', table);
        // exclude entries for duplicate_of field
        gr.addQuery('element', '!=', 'duplicate_of');
        gr.addAggregate('count');
        gr.orderByAggregate('count');
        gr.groupBy('name');
        gr.query();
        while (gr.next()) {
			var elementName = gr.name;
			referencingTables.push('' + elementName);
			var extensions = j2js(new TableUtils(elementName).getTableExtensions());
            for (var i = 0; i < extensions.length; i++) // add all children types as well
                referencingTables.push('' + extensions[i]);
		}
            
        return referencingTables;
    },

	_getClassLabel : function(className) {
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

    type: 'IdentificationLookUpTables'
};
