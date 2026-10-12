var CollabSlackUserSync = Class.create();
CollabSlackUserSync.prototype = {
    initialize: function() {
		this.providerId = '1f2e35d1a3f382106cdec213d51e61ae';
		this.limit = 200;
    },
	sync: function() {
		var cursor = '';
		var activeUserIds = [];

		do {
			var result = this.__fetchSlackUsers(cursor);
			cursor = result.next_cursor;
			for (user of result.users) {
				// Do not import bot users
				if (!user.is_bot && user.profile.email && !user.deleted) {
					this.__processSlackUserEntry(user);
					activeUserIds.push(user.id);
				}
			}
		} while(cursor != null && cursor != "");

		this.__removeDeletedUsers(activeUserIds);
	},
	__fetchSlackUsers: function(cursor) {
		return sn_fd.FlowAPI.executeActionQuick('sn_oe_sfs.get_slack_users', {
			limit: this.limit,
			cursor
		});
	},
	__processSlackUserEntry: function(user) {
		var exGr = new GlideRecord("sys_cs_collab_provider_user_profile");
        exGr.addQuery("provider_user_id", user.id);
        exGr.query();
        if (!exGr.next()) {
			var sysUser = this.__getSysUser(user);
            if (sysUser) {
                var collabUserGr = new GlideRecord("sys_cs_collab_user");
                collabUserGr.addQuery('user', sysUser.sys_id);
                collabUserGr.query();
                if (collabUserGr.next()) {
                    this.__addCollabProfile(user, collabUserGr.sys_id);
                    return;
                }
            }
			var collabUserId = this.__createCollabUser(sysUser);
            this.__addCollabProfile(user, collabUserId);
		} else if (!exGr.active) {
            exGr.active = true;
            exGr.provider_user_id = user.id;
            exGr.display_name = user.real_name;
            exGr.external_user_id = user.id;
            exGr.update();
        } else {
            gs.info("The user profile is already active: " + user.real_name);
        }
	},
	__createCollabUser: function(sysUserGR) {
        var externalUser = sysUserGR == null ? true : false;
        var newCollabUser = new GlideRecord("sys_cs_collab_user");
        newCollabUser.external_user = externalUser;
        newCollabUser.create_external_conversation = externalUser;
        if (!externalUser)
            newCollabUser.user = sysUserGR.sys_id;

        return newCollabUser.insert();
    },
	__getSysUser: function(user) {
        var sysUser = new GlideRecord("sys_user");
        sysUser.addQuery("email", user.profile.email);
        sysUser.setWorkflow(false);
        sysUser.query();
        if (sysUser.next())
            return sysUser;

        return null;
    },
	__addCollabProfile: function(user, collabUserId) {
		var newGr = new GlideRecord("sys_cs_collab_provider_user_profile");
        newGr.initialize();
        newGr.provider_user_id = user.id;
        newGr.display_name = user.real_name;
        newGr.external_user_id = user.id;
        newGr.provider = this.providerId;
        newGr.active = true;
        newGr.collab_user = collabUserId;
        newGr.insert();
	},
	__removeDeletedUsers: function(activeUserIds) {
		var existingExternal = new GlideRecord("sys_cs_collab_provider_user_profile");
		existingExternal.addQuery("provider", this.providerId);
        existingExternal.addQuery("collab_user.external_user", true);
        existingExternal.query();

		while(existingExternal.next()) {
			if (activeUserIds.indexOf(existingExternal.getValue('external_user_id')) == -1) {
				existingExternal.deleteRecord();
			}
		}
	},
    type: 'CollabSlackUserSync'
};
