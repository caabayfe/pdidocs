var SDRolesUtility = Class.create();
SDRolesUtility.prototype = {
    initialize: function() {},
    getSDRolesList: function() {
        return ['b43e3df207303010c7d559bf1ad30026', 'cc1eb9f207303010c7d559bf1ad300f8', '4f5d7db207303010c7d559bf1ad30096'];
    },
    getBMRolesList: function() {
        return ['553b1f166723220097eeff5557415a6a', 'b3299f166723220097eeff5557415ab1', 'e91b537d3b7b3200b90c4bb534efc494'];
    },
    getUsersWithGivenRole: function(roleId) {
        var gr = new GlideRecord('sys_user_has_role');
        gr.addQuery('state', 'active');
        gr.addQuery('role', roleId);
        gr.orderBy('inherited');
        gr.orderBy('user');
        gr.query();
        var users = [];
        while (gr.next()) {
            users.push({
                "id": gr.getUniqueValue(),
                "userName": gr.getDisplayValue('user'),
                "userId": gr.getDisplayValue('user.user_name'),
                "inherited": gr.getDisplayValue('inherited')
            });
        }
        return users;
    },
    assignSDRole: function(users, role) {
        if (!this.isAssignableSDRole(role))
            return false;
        try {
            this.assignRoleToUsers(users, role);
            return true;
        } catch (ex) {
            gs.error("An error occured while assigning role : " + ex);
            return false;
        }
    },
    isAssignableSDRole: function(roleId) {
        return this.getSDRolesList().indexOf(roleId) > -1 || this.getBMRolesList().indexOf(roleId) > -1;
    },
    assignRoleToUsers: function(users, role) {
        if (gs.nil(users) || users.length == 0 || gs.nil(role))
            return;
        for (var i = 0; i < users.length; i++) {
            if (!gs.nil(users[i]))
                this.insertGlideRecord('sys_user_has_role', {
                    user: users[i],
                    role: role
                });
        }
    },
    insertGlideRecord: function(table, params) {
        var gr = new GlideRecord(table);
        if (gr.isValid() && !gs.nil(params)) {
            for (var column in params) {
                gr.setValue(column, params[column]);
            }
            var sysId = gr.insert();
            gs.debug("Inserted record in table: " + table + ", sysId: " + sysId);
        }
    },
    createDropdownList: function(roles) {
        var response = [];
        var gr = new GlideRecord('sys_user_role');
        gr.addQuery('sys_id', roles);
        gr.orderBy('name');
        gr.query();
        while (gr.next()) {
            response.push({
                'id': gr.getUniqueValue(),
                'label': gr.getDisplayValue('name')
            });
        }
        return response;
    },
    getActiveUsersList: function(searchUserTerm) {
        var users = [];

        var gr = new GlideRecord('sys_user');
        gr.addActiveQuery();
        gr.orderBy('name');
        gr.setLimit(15);

        if (searchUserTerm && searchUserTerm.trim().length !== 0) {
            searchUserTerm = searchUserTerm.trim();

            var query = gr.addQuery('name', 'STARTSWITH', searchUserTerm);
        }

        gr.query();

        while (gr.next()) {
            users.push({
                sysId: gr.getUniqueValue(),
                id: gr.getValue('user_name'),
                label: gr.getDisplayValue('name'),
                sublabel: gr.getValue('email'),
            });
        }

        return users;
    },
    getAggregateData: function(roles) {
        var ga = new GlideAggregate('sys_user_has_role');
        ga.addQuery('state', 'active');
        ga.addQuery('role', 'IN', roles);
        ga.addAggregate('COUNT');
        ga.groupBy('role');
        ga.query();
        var data = [];
        while (ga.next()) {
            data.push({
                role: ga.getDisplayValue('role'),
                value: ga.getAggregate('COUNT')
            });
        }
        return data;
    },
    type: 'SDRolesUtility'
};
