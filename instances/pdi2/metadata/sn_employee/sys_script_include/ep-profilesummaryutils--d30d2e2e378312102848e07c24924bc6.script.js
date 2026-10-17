var ep_ProfileSummaryUtils = Class.create();
ep_ProfileSummaryUtils.prototype = Object.extendsObject(ep_ProfileSummaryUtilsSNC, {
    initialize: function() {
		ep_ProfileSummaryUtilsSNC.prototype.initialize.apply(this, arguments);
    },

    type: 'ep_ProfileSummaryUtils'
});
