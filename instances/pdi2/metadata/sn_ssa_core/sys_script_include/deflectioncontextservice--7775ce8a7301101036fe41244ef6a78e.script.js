var DeflectionContextService = Class.create();
DeflectionContextService.prototype =  Object.extendsObject(global.ActivityContextServiceSNC, {
    initialize: function(activitySubContext) {
		global.ActivityContextServiceSNC.prototype.initialize.call(this, activitySubContext);
		this.activityContextDao = new sn_ssa_core.DeflectionContextDAO(activitySubContext);
    },

    type: 'DeflectionContextService'
});
