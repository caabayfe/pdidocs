var UnconfirmedUserRoleDao = Class.create();
UnconfirmedUserRoleDao.prototype = {
    initialize: function() {
        this._table = "unconfirmed_user_role";
    },

    deleteAll: function() {
        const gr = new GlideRecord(this._table);
        gr.query();
        gr.deleteMultiple();
    },

    insert: function(subscriptionId, user, userName, unsubscribedRoleIds) {
        const gr = new GlideRecord(this._table);
        gr.setValue("user", user);
        gr.setValue("user_name", userName);
        gr.setValue("subscription", subscriptionId);
        gr.setValue("unsubscribed_roles", unsubscribedRoleIds);
        gr.insert();
    },

    type: 'UnconfirmedUserRoleDao'
};
