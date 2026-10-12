var SidebarChatUserUtilSNC = Class.create();
SidebarChatUserUtilSNC.prototype = {
    initialize: function() {},

    checkForPermission: function(userSysId, recordSysId, table) {
        var hasPermission = false;
        if (!userSysId || !recordSysId || !table)
            return false;
        var myUser = gs.getSession().impersonate(userSysId);
        var gr = new GlideRecordSecure(table);
        gr.addQuery('sys_id', recordSysId);
        gr.query();
        if (gr.next() && gr.canRead())
            hasPermission = true;
        gs.getSession().impersonate(myUser);

        return hasPermission;
    },

    type: 'SidebarChatUserUtilSNC'
};
