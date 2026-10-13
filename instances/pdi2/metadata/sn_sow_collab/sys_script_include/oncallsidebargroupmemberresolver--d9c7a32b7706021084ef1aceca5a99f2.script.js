var OnCallSidebarGroupMemberResolver = Class.create();
OnCallSidebarGroupMemberResolver.prototype = {
    initialize: function() {},

    applies: function(groupId, documentId, documentTable) {
        var tables = ['incident', 'problem', 'change_request'];
        if (!tables.includes(documentTable)) {
            return false;
        }
        var shiftsGr = new GlideRecord("cmn_rota");
        shiftsGr.addQuery('group', groupId);
        shiftsGr.setLimit(1);
        shiftsGr.query();
        return shiftsGr.getRowCount() > 0;
    },

    getResolvedMembers: function(groupId, documentId, documentTable) {
        this.userIds = [];
        var usersOnCall = new global.OnCallRotation().whoIsOnCall(groupId);
		var rosterSet = [];
        for (var i = 0; i < usersOnCall.length; i++) {
            if (rosterSet.indexOf(usersOnCall[i].roster) === -1) {
                rosterSet.push(usersOnCall[i].roster);
                this.userIds.push(usersOnCall[i].userId); //we only add the first id that is returned per roster
            }
        }
        return this.userIds;
    },

    getSystemMessage: function(groupId, documentId, documentTable) {
        var groupGr = new GlideRecord("sys_user_group");
        if (groupGr.get(groupId)) {
            var groupName = groupGr.getValue('name');
            var userIds = this.userIds || [];
            if (userIds.length === 0) {
                return gs.getMessage("No members currently on-call for {0} group", [groupName]);
            }
            return gs.getMessage("On-Call members of {0} joined the discussion", [groupName]);
        }
        return gs.getMessage("Invalid group");
    },

    type: 'OnCallSidebarGroupMemberResolver'
};
