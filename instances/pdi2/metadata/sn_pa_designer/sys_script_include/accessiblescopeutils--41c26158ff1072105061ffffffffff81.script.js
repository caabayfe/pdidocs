var AccessibleScopeUtils = Class.create();
AccessibleScopeUtils.prototype = {
    initialize: function() {},

    type: 'AccessibleScopeUtils',

    getAccessibleScopes: function() {
        return gs.getSession().getApplicationPickerList();
    },

    getAccessibleScopeIds: function() {
        return this.getAccessibleScopes().map(function(app) {
            return app.sysId;
        });
    },

    isScopeAccessibleByUser: function(scopeId) {
        const scopeList = this.getAccessibleScopeIds();
        return scopeList.includes(scopeId);
    }
};
