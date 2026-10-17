var TriggerRuleTableConfigUtilSNC = Class.create();

TriggerRuleTableConfigUtilSNC.LOG_PROPERTY = "com.snc.trigger_rules.log.level";

TriggerRuleTableConfigUtilSNC.prototype = {
    TRIGGER_RULE_TABLE_CFG: "trigger_rule_table_cfg",
    TASK: "task",
    TABLE_NAME: "table",

    initialize: function () {
        this._log = new GSLog(TriggerRuleTableConfigUtilSNC.LOG_PROPERTY, this.type);
    },

    process: function () {
        var tableList = this._getTableExtensions(this.TASK);

        if (this._log.atLevel(global.GSLog.DEBUG))
            this._log.debug("[process] tableList: " + JSON.stringify(tableList));

        var additionalTables = this._getTriggerRuleTables();

        if (this._log.atLevel(global.GSLog.DEBUG))
            this._log.debug("[process] additionalTables: " + JSON.stringify(additionalTables));

        var uniqueTables = this._uniqueArray(tableList.concat(additionalTables));

        if (this._log.atLevel(global.GSLog.DEBUG))
            this._log.debug("[process] uniqueTables: " + JSON.stringify(uniqueTables));

        return uniqueTables;
    },

    getTriggerRuleTableConfigRecord: function(tableName) {
        var gr = new GlideRecord(this.TRIGGER_RULE_TABLE_CFG);
        gr.addActiveQuery();
        gr.query();
        while (gr.next()) {
            var tables = this._getTableExtensions(gr.getValue(this.TABLE_NAME));
            if (tables.indexOf(tableName) >= 0)
                return gr;
        }

        return null;
    },

    _getTriggerRuleTables: function () {
        var tables = [];
        var gr = new GlideRecord(this.TRIGGER_RULE_TABLE_CFG);
        gr.addActiveQuery();
        gr.query();
        while (gr.next())
            tables = tables.concat(this._getTableExtensions(gr.getValue(this.TABLE_NAME)));

        if (this._log.atLevel(global.GSLog.DEBUG))
            this._log.debug("[_getTriggerRuleTables] tables: " + JSON.stringify(tables));

        return tables;
    },

    _getTableExtensions: function (tablename) {
        if (!tablename)
            return [];

        var uniqueTableNames = {};
        var tableExtensions = GlideDBObjectManager.get().getAllExtensions(tablename);
        for (var i = 0; i < tableExtensions.size(); i++)
            uniqueTableNames[tableExtensions.get(i)] = tableExtensions.get(i);

        return Object.keys(uniqueTableNames);
    },

    _uniqueArray: function (arr) {
        if (this._log.atLevel(global.GSLog.DEBUG))
            this._log.debug("[_uniqueArray] arr: " + JSON.stringify(arr));

        var filteredArray = arr.filter(function (item, pos) {
            return arr.indexOf(item) === pos;
        });

        if (this._log.atLevel(global.GSLog.DEBUG))
            this._log.debug("[_uniqueArray] filteredArray: " + JSON.stringify(filteredArray));

        return filteredArray;
    },

    type: 'TriggerRuleTableConfigUtilSNC'
};
