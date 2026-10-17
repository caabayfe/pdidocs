var UpdateSetRollBackVisible = Class.create();
UpdateSetRollBackVisible.prototype = Object.extendsObject(AbstractUpdateUIActionUtil, {
    initialize: function() {
    },

	_userHasAccess: function(gr) {
		var ctx = GlideUpdateSet.getRollbackContext(gr);
		var rollbackAvailable = ctx != null && ctx.isRollbackable();
		return ((new GlideUpdateManager2()).allowVersionBackout(gr.sys_id) &&
			this._isCurrentDomainSafe() &&
			gs.hasRole('admin')) &&
			rollbackAvailable;
	},

    type: 'UpdateSetRollBackVisible'
});
