var RecordMemberBuilder = Class.create();
RecordMemberBuilder.prototype = {
    initialize: function() {
		this.members = {};
		this.debug = gs.getProperty("glide.ui.debug_record_member_builder", "false");
    },
	put: function(sysId, name, lastName) {
		sysId = sysId.trim();
		name = name.trim();
		
		if (this.debug === "true") {
			gs.log("#####################################");
			gs.log('members: ' + JSON.stringify(this.members));
			gs.log('sysId: ' + sysId);
			gs.log('name: ' + name);
			gs.log("#####################################");
		}
		
		if (sysId == "" || name == "" || JSUtil.nil(this.members) || this.members[sysId])
			return;

		// protect against truncated display name coming from sys_history_line.user_name
		if (name.endsWith('...')) {
			var u = GlideUser.resolveNameFromSysID(sysId);
			if (!GlideStringUtil.nil(u))
				name = u;
		}

		this.members[sysId] = {
			name: name,
			initials: GlideNGInitials.getInitials(name),
			last_name: lastName ? lastName.trim() : '',
			sys_id: sysId,
			record_is_visible: true
		};
	},
	getJson: function() {
		return JSON.stringify(this.members);
	},
    type: 'RecordMemberBuilder'
};
