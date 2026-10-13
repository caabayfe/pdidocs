var OnCallCommonDynamicFilters = Class.create();
OnCallCommonDynamicFilters.prototype = Object.extendsObject(OnCallCommonDynamicFiltersSNC, {
	initialize: function () {
		OnCallCommonDynamicFiltersSNC.prototype.initialize.call(this);
	},
	type: 'OnCallCommonDynamicFilters'
});
