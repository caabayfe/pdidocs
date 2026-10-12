var CollabTeamsUserSync = Class.create();
CollabTeamsUserSync.prototype = {
    initialize: function(providerId, pageSize) {
        this.providerId = providerId;
        this.pageSize = pageSize || 100;
        this._usersById = {};
    },

    sync: function() {
        var teamsUsers = {};
        gs.info("Starting sync with provider: " + this.providerId);

        do {
            teamsUsers = this._fetchTeamUsersPage(teamsUsers.skip_token);
            teamsUsers.users.forEach(this._processTeamsUserEntry, this);

            gs.debug("got " + Object.keys(this._usersById).length + " users so far");
        } while (teamsUsers.skip_token);

        this._checkRemovedUsers();
    },

    //Private
    _fetchTeamUsersPage: function(skipToken) {
        var params = {
            'page_size': this.pageSize
        };
        if (skipToken) {
            params.skip_token = skipToken;
        }
        return sn_fd.FlowAPI.executeActionQuick('sn_oe_sfs.get_users', params);
    },

    _processTeamsUserEntry: function(user) {
        gs.debug("Fetched Teams User displayName is: " + user.displayName);
        this._usersById[user.id] = true;
        var exGr = new GlideRecord("sys_cs_collab_provider_user_profile");
        exGr.addQuery("provider_user_id", user.userPrincipalName);
        exGr.query();
        if (!exGr.next()) {
            gs.debug("Teams provider user profile does not exist: " + user.userPrincipalName);
            var sysUser = this._getSysUser(user);
            if (sysUser) {
                var collabUserGr = new GlideRecord("sys_cs_collab_user");
                collabUserGr.addQuery('user', sysUser.sys_id);
                collabUserGr.query();
                if (collabUserGr.next()) {
                    this._addCollabProfile(user, collabUserGr.sys_id);
                    return;
                }
            }
            var collabUserId = this._createCollabUser(sysUser);
            this._addCollabProfile(user, collabUserId);
            gs.info("Teams User " + user.displayName + " added");
        } else if (!exGr.active) {
            gs.debug("Teams provider user profile is inactive: " + user.userPrincipalName);
            exGr.active = true;
            exGr.provider_user_id = user.userPrincipalName;
            exGr.display_name = user.displayName;
            exGr.external_user_id = user.id;
            exGr.update();
        } else {
            gs.debug("The user profile is already active: " + user.displayName);
        }
    },

    _createCollabUser: function(sysUser) {
        var externalUser = sysUser == null ? true : false;
        var newCollabUser = new GlideRecord("sys_cs_collab_user");
        newCollabUser.external_user = externalUser;
        newCollabUser.create_external_conversation = externalUser;
        if (!externalUser)
            newCollabUser.user = sysUser.sys_id;

        return newCollabUser.insert();
    },

    _getSysUser: function(user) {
        var teamsEmail = this._emailToUse(user);
        var sysUser = new GlideRecord("sys_user");
        sysUser.addActiveQuery();
        sysUser.addQuery("email", teamsEmail);
        sysUser.setWorkflow(false);
        sysUser.query();
        if (sysUser.next())
            return sysUser;

        return null;
    },

    _checkRemovedUsers: function() {
        var existingExternal = new GlideRecord("sys_cs_collab_provider_user_profile");
        existingExternal.addQuery("collab_user.external_user", true);
        existingExternal.query();
        while (existingExternal.next()) {
            if (!this._usersById[existingExternal.external_user_id]) {
                gs.info(existingExternal.display_name + " is no longer an external user");
                existingExternal.deleteRecord();
            }
        }
    },

    _emailToUse: function(teamsUser) {
        if (teamsUser.mail) {
            return teamsUser.mail;
        } else {
            return teamsUser.userPrincipalName;
        }
    },

    _addCollabProfile: function(teamsUser, collabUserId) {
        gs.debug("Create Provider user profile for collab user: " + collabUserId);
        var newGr = new GlideRecord("sys_cs_collab_provider_user_profile");
        newGr.initialize();
        newGr.provider_user_id = teamsUser.userPrincipalName;
        newGr.display_name = teamsUser.displayName;
        newGr.external_user_id = teamsUser.id;
        newGr.provider = this.providerId;
        newGr.active = true;
        newGr.collab_user = collabUserId;
        newGr.insert();
    },

    type: 'CollabTeamsUserSync'
};
