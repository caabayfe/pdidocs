var TableListAPI = Class.create();
TableListAPI.prototype = {
		initialize: function(options) {
        this.options = options;
        this.tableList = {};
    },

    build: function() {
        var result = this._validate();

        if (!result.isValid) return PreferredTablesUtil.error(result);

        return this._getTableList();
    },

    _getTableList: function() {
        var inScopeTbSysIds = [];
        var preferredTbNames = [];
        if (
            this.options.include_in_scope &&
            this.options.include_in_scope === 'true'
        ) {
            var inScopeTables = this._getInScopeTables();
            inScopeTbSysIds = inScopeTables.sysIds;
            this.tableList['inScopeTables'] = inScopeTables.tables;
        }
        if (
            this.options.include_preferred_tables &&
            this.options.include_preferred_tables === 'true'
        ) {
            var preferredTables = this._getPreferredTables(inScopeTbSysIds);
            preferredTbNames = preferredTables.names;
            this.tableList['preferredTables'] = preferredTables.tables;
        }
        if (
            this.options.include_out_scope &&
            this.options.include_out_scope === 'true'
        ) {
            var outScopeTables = this._getOutScopeTables(preferredTbNames);
            this.tableList['outScopeTables'] = outScopeTables.tables;
        }
        
        if (
            this.options.include_exact_match &&
            this.options.include_exact_match === 'true'
        ) {
            var exactMatchTables = this._getExactMatchTables();
            this.tableList['exactMatchTables'] = exactMatchTables.tables;
        }

        return this.tableList;
    },

    _getInScopeTables: function() {
        var sysObj = new SysDBObject(this.options, {
            inScope: true
        });
        var inScopeTables = sysObj.build();
        return inScopeTables;
    },
    _getPreferredTables: function(inScopeTbSysIds) {
        var sysObj = new PrefrdTableContextMapping(this.options, {
            inScopeTbSysIds: inScopeTbSysIds,
        });
        var preferredTables = sysObj.build();
        return preferredTables;
    },

    _getOutScopeTables: function(preferredTbNames) {
        var sysObj = new SysDBObject(this.options, {
            inScope: false,
            preferredTbNames: preferredTbNames
        });
        var outScopeTables = sysObj.build();
        return outScopeTables;
    },

    _getExactMatchTables: function(preferredTbNames) {
        var sysObj = new SysDBObject(this.options, {
            exactMatch: true
        });
        var exactMatchTables = sysObj.build();
        return exactMatchTables;
    },

    _validate: function() {
        var res = Validators.isValidContext(this.options.context);
        if (!res.isValid) return res;
        if (
            (this.options.include_in_scope &&
                this.options.include_in_scope === 'true') ||
            (this.options.include_out_scope &&
                this.options.include_out_scope === 'true')
        ) {
            res = Validators.isAppScopeExists(this.options);
            if (!res.isValid) return res;
        }
        return {
            isValid: true,
        };
    },

    type: 'TableListAPI',
};
