var CompanyActiveUserAuthenticationGate = Class.create();

CompanyActiveUserAuthenticationGate.prototype = {
    initialize: function(user, roles, user_type) {
        this.user = '' + user;
        this.roles = '' + roles;
        this.user_type = '' + user_type;
    },

    isAllowed: function() {
        if (this.user == "admin" || this.user == "itil" || this.user == "employee" || this.user == "guest")
            return true;

        var u = new GlideRecord("sys_user");
        if (!u.get("user_name", this.user))
            return true;

        if (u.company.nil())
            return true;

        if (u.company.active == true)
            return true;

        if (u.managed_domain == true)
            return true;

        gs.log('CompanyActive authentication gate: denied access to ' + this.user);
        gs.getSession().addErrorMessage('Company inactive - your access to this instance is not authorized');
        return false;
    },

    type: 'CompanyActiveUserAuthenticationGate'
};
