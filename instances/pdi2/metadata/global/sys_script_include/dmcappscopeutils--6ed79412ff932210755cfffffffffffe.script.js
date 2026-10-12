var DMCAppScopeUtils = Class.create();
DMCAppScopeUtils.prototype = Object.extendsObject(DMRuleConstants, {

    currentScope: undefined,

    initialize: function() {
        this.currentScope = this.getCurrentScope();
    },

    _getSysScopeName: function(scopeSysId) {
        var gr = new GlideRecord(this.TABLES.SYS_SCOPE);
        gr.get(scopeSysId);
        return gr.isValidRecord() ? gr.getValue(this.FIELDS.NAME) : this.GLOBAL.SCOPE_ID;
    },

    getCurrentScope: function() {
        if (this.currentScope) return this.currentScope;
        var sysID = gs.getCurrentApplicationId();
        return {
            sysID: sysID,
            name: this._getSysScopeName(sysID)
        };
    },

    getTableScope: function(tableName) {
        var sysDBGr = new GlideRecord(this.TABLES.SYS_DB_OBJECT);
        sysDBGr.addQuery(this.FIELDS.NAME, tableName);
        sysDBGr.query();
        if (sysDBGr.next()) {
            var sysID = sysDBGr.getValue(this.FIELDS.SYS_SCOPE);
            return {
                sysID: sysID,
                name: this._getSysScopeName(sysID)
            };
        }
        return {
            sysID: this.GLOBAL.SCOPE_ID,
            name: this.GLOBAL.SCOPE_NAME
        };
    },

    switchToTableScope: function(tableName) {
        var scope = this.getTableScope(tableName);
        gs.setCurrentApplicationId(scope.sysID);
        return scope;
    },

    switchToCurrentScope: function() {
        gs.setCurrentApplicationId(this.currentScope.sysID);
        return this.currentScope;
    },

    type: 'DMCAppScopeUtils'
});
