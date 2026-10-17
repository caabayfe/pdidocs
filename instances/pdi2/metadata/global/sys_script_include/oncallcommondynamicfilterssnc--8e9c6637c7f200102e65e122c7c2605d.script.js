var OnCallCommonDynamicFiltersSNC = Class.create();
OnCallCommonDynamicFiltersSNC.prototype = {
    initialize: function() {
        this.onCallCommon = new OnCallCommon();
    },

    getManagedGroups: function() {
        return this.onCallCommon.getManagedGroups();
    },

    getMyGroups: function() {
        return this.onCallCommon.getMyGroups();
	},
	
	getOnCallGroups: function() {
		return this.onCallCommon.getOnCallGroups();
	},

	getUserGroups: function () {
		return this.onCallCommon.getUserGroups();
	},

    type: 'OnCallCommonDynamicFiltersSNC'

};
