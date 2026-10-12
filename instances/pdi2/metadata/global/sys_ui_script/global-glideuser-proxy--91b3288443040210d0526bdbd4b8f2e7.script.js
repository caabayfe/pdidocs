// Original "GlideUser" source:
// https://code.devsnc.com/dev/glide/blob/76f9f1a72028261edffb426cfabe433d49715fb4/glide/ui.html/scripts/classes/GlideUser.js
// Reference Portal Impl: https://code.devsnc.com/dev/glide/blob/b887fb68903baa35881bf59bf85613563149b035/glide-ng/src/main/plugins/com.glide.ui.ng/ui.html/scripts/sn/common/clientScript/glideUser.js

var GlideUserProxy = Class.create();
GlideUserProxy.prototype = {
	initialize: function(userName, firstName, lastName, nonDefaultRoles, userID, userEmail, userAvatar, userTitle) {
		this.userName = userName;
		this.firstName = firstName;
		this.lastName = lastName;
		this.setFullName(this.firstName + " " + this.lastName);
		this.setRoles(nonDefaultRoles);
		this.userID = userID;
		this.title = userTitle;
		this.email = userEmail;
		this.avatar = userAvatar;
	},

	hasRoleExactly: function(role, includeDefaults) {
		if (!role || typeof role != 'string')
			return false;

		var rolesToCheck = this.roles;
		if (includeDefaults)
			rolesToCheck = this.allRoles;

		for (var x = 0, l = rolesToCheck.length; x < l; x++) {
			if (rolesToCheck[x].toLowerCase() == role.toLowerCase())
				return true;
		}
		return false;
	},

	hasRoles: function(includeDefaults) {
		if (includeDefaults)
			return (this.allRoles.length > 0);
		else
			return (this.roles.length > 0);
	},

	hasRole: function(role, includeDefaults) {
		// if we're maint we win
		if (this.hasRoleExactly('maint', includeDefaults))
			return true;
		// if we've got it we've got it
		if (this.hasRoleExactly(role, includeDefaults))
			return true;
		// if we don't have maint, we aren't maint
		if (role == 'maint')
			return false;
		// if we've got admin, we are all roles (except maint)
		if (this.hasRoleExactly('admin', includeDefaults))
			return true;
		return false;
	},

	hasRoleFromList: function(roles, includeDefaults) {
		var rolesToMatch = new Array();

		if (roles)
			rolesToMatch = roles.split(/\s*,\s*/);

		// if the roles is empty, return true
		if (rolesToMatch.length == 0)
			return true;

		for (var i = 0; i < rolesToMatch.length; i++) {
			var r = rolesToMatch[i];
			if (r && this.hasRole(r, includeDefaults))
				return true;
		}

		return false;
	},

	getFullName: function() {
		return this.fullName;
	},

	setFullName: function(fn) {
		this.fullName = fn;
	},

	getUserName: function() {
		return this.userName;
	},

	getUserID: function() {
		return this.userID;
	},

	getRoles: function(includeDefaults) {
		if (includeDefaults)
			return this.allRoles;

		return this.roles;
	},

	setRoles: function(r, includeDefaults) {
		if (includeDefaults) {
			if (r)
				this.allRoles = r.split(/\s*,\s*/);
			else
				this.allRoles = new Array();
		} else {
			if (r)
				this.roles = r.split(/\s*,\s*/);
			else
				this.roles = new Array();
		}
	},

	getClientData: function(n) {
		return gs.getSession().getClientData(n);
	},

	setClientData: function(n, v) {
		return gs.getSession().putClientData(n, v);
	},

	type: "GlideUserProxy"
};

var user = gs.getUser();
var gUser = new GlideUserProxy(
	String(user.getName()),
	String(user.getFirstName()),
	String(user.getLastName()),
	user_roles,
	String(user.getID()),
	user_email,
	user_avatar,
	user_title
);
gUser.setRoles(user_allRoles, true);

var g_user = gUser;

// TBD - set "g_user" in the global context
// _globalContext_['g_user'] = gUser;
csGlobals['g_user'] = gUser;
