var UserPropertyConfigTablesProvider = Class.create();
UserPropertyConfigTablesProvider.prototype = {
    initialize: function() {},
    getTables: function() {
        var tables = ['sys_user', 'sys_user_grmember', 'sys_user_has_role'];
        return "nameIN" + tables.toString();
    },
    type: 'UserPropertyConfigTablesProvider'
};
