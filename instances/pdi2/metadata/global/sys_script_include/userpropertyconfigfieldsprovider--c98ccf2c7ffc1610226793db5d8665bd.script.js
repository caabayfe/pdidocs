var UserPropertyConfigFieldsProvider = Class.create();
UserPropertyConfigFieldsProvider.prototype = {
    initialize: function() {},
    getFields: function() {
        var table = current.table_name.name.toString();
        var query = "internal_type=reference^ORinternal_type=boolean^ORinternal_type=choice^name=" + table;
        if (table == "sys_user_grmember")
            query += "^element=group";
        else if (table == "sys_user_has_role")
            query += "^element=role";
        return query;
    },
    type: 'UserPropertyConfigFieldsProvider'
};
