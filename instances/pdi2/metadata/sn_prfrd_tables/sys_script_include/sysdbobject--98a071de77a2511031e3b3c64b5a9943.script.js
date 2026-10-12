var SysDBObject = Class.create();
SysDBObject.prototype = {

    initialize: function(options, additionalArgs) {
        this.options = options;
        this.gr = new GlideRecord('sys_db_object');
        this.rotatedTables = [];
        this.additionalArgs = additionalArgs || {};
    },

    getName: function() {
        return this.gr.getValue('name');
    },

    _isExcludedRotation: function(name) {
        return this.rotatedTables.indexOf(name) > -1;
    },

    _getRotatedTables: function() {
        var rotatedList = [];
        var rotations = [];
        var rotatedTable = new GlideRecord("sys_table_rotation");
        rotatedTable.query();

        while (rotatedTable.next())
            rotatedList.push(rotatedTable.getValue("name"));

        var rotatedExtension = new GlideRecord("sys_table_rotation_schedule");
        rotatedExtension.query();

        while (rotatedExtension.next()) {
            if (rotatedList.indexOf(rotatedExtension.getValue("table_name")) === -1)
                rotations.push(rotatedExtension.getValue("table_name"));
        }
        return rotations;
    },

    _startsWith: function(str, word) {
        return str.lastIndexOf(word, 0) === 0;
    },

    _shouldExcludeTable: function(tableName) {
        if (this._isExcludedRotation(tableName))
            return true;

        if (
            this._startsWith(tableName, 'v_') ||
            this._startsWith(tableName, 'sysx_') ||
            this._startsWith(tableName, 'var__') ||
            this._startsWith(tableName, 'ts_')

        )
            return true;

        if (this.additionalArgs.preferredTbNames && this.additionalArgs.preferredTbNames.indexOf(tableName) >= 0)
            return true;

        return false;
    },

    _addAdditionalQueries: function() {
        var queryParams = this.options;
        var gr = this.gr;
        if (queryParams.context && queryParams.context.toLowerCase() === 'extension')
            gr.addQuery('is_extendable', 'true');

        if (queryParams.order_by && typeof queryParams.order_by === 'string')
            gr.orderBy(queryParams.order_by);
        if (queryParams.limit && typeof queryParams.limit === 'string')
            gr.setLimit(queryParams.limit);

        if (this.additionalArgs) {
            if (this.additionalArgs.inScope !== undefined) {
                var operator = this.additionalArgs.inScope ? '=' : '!=';
                gr.addQuery('sys_scope', operator, queryParams.app_scope);
            }
        }

        if (queryParams.search_query && typeof queryParams.search_query === 'string') {
            var encodedQuery = this.additionalArgs.exactMatch ? queryParams.exact_match_query : queryParams.search_query;
            if (this.additionalArgs.exactMatch) {
                gr.setLimit(5);
            }
            gr.addEncodedQuery(encodedQuery);
        }
    },
    build: function() {
        var tables_output = [];
        var sysIds = [];
        this._addAdditionalQueries();
        this.gr.query();
        this.rotatedTables = this._getRotatedTables();
        while (this.gr.next()) {
            var tableName = this.gr.getValue('name');

            if (this._shouldExcludeTable(tableName))
                continue;

            var table = {
                name: tableName,
                sys_id: this.gr.getUniqueValue(),
                label: this.gr.getDisplayValue('label'),
                is_extendable: this.gr.getDisplayValue('is_extendable')
            };
            if (this.additionalArgs && this.additionalArgs.inScope) {
                sysIds.push(table.sys_id);
            }
            tables_output.push(table);
        }
        return {
            'tables': tables_output,
            'sysIds': sysIds
        };
    },

    type: 'SysDBObject'
};
