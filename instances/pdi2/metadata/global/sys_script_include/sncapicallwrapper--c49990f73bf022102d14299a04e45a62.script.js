var SNCAPICallWrapper = Class.create();
SNCAPICallWrapper.prototype = Object.extendsObject(AbstractAjaxProcessor, {

	// work-around for making GlideSecurityManager.get() call available from scoped apps
	hasRightsToConditionalTableQueryRange: function(tableName) {
		var path = 'record/' + tableName + '/conditional_table_query_range';
		var gsm = global.GlideSecurityManager.get();
		return gsm.hasRightsTo(path, new GlideRecord(tableName));
	},

	// make isImpersonating available from all scopes
	isImpersonating: function() {
		return  new GlideImpersonate().isImpersonating();
	},

    // make gs.getUser().hasRoles() available from all scopes
	gsGetUserHasRoles: function() {
		return gs.getUser().hasRoles();
	},

    //special case: HI has script-include named hasRole which results in flaggin scrits as having "current"
	gsHasRole: function(roleName) {
		return gs.hasRole(roleName);
	},

    //special case: HI has script-include named hasRole which results in flaggin scrits as having "current"
	gsGetUserHasRole: function(roleName) {
		return gs.getUser().hasRole(roleName);
	},

	// scope issue: gs.getUser().getRoles().length should be replaced with gsGetUserGetRolesSize()
	gsGetUserGetRolesSize: function() {
		return gs.getUser().getRoles().size();
	},

    type: 'SNCAPICallWrapper'
});
