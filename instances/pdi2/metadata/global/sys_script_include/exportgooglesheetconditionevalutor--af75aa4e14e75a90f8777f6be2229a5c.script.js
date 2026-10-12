var ExportGoogleSheetConditionEvalutor = Class.create();
ExportGoogleSheetConditionEvalutor.prototype = {
    initialize: function() {
    },

    // Change this method to restrict export to google sheets context menu based on roles,groups or any custom logic. By default, we show export to google sheets context menu for all the users.
	isExportToSheetsVisible: function() {
		return true;
	},

    type: 'ExportGoogleSheetConditionEvalutor'
};
