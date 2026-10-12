var ContentLookupScopedGlobalAccessUtil = Class.create();
ContentLookupScopedGlobalAccessUtil.prototype = {

	initialize: function() {},

	convertDateToContentVersionFormat: function(isLineChart) {
		var today = gs.nowGlideDateTime();
		if (isLineChart) {
			today.addDays(-1);
		}
		return today.getDate().getByFormat('yyyyMMdd');
	},

	getLastThreeMonthsDate: function(today) {
		today.addMonths(-3);
		return today.getDate().getByFormat('yyyyMMdd');
	},

	type: 'ContentLookupScopedGlobalAccessUtil',
};
