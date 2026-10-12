var SOWCommonUtilsSNC = Class.create();
SOWCommonUtilsSNC.prototype = {
    initialize: function() {
    },
	TABLES: {
		SYS_USER_GRMEMBER: 'sys_user_grmember'
	},
	
	getMemberGroups: function(userSysID, setlimit) {
		var memberGroups = [];
		var grMembers = new GlideRecord(this.TABLES.SYS_USER_GRMEMBER);
		grMembers.addQuery('group.active', 'true');
		grMembers.addQuery('user', userSysID);
		if (setlimit)
			grMembers.setLimit(setlimit);
		grMembers.query();
		while (grMembers.next()) {
			memberGroups.push(grMembers.group.sys_id);
		}
		return memberGroups;
	},

    type: 'SOWCommonUtilsSNC'
};
