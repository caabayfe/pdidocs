var ReportSourceUtil = Class.create();
ReportSourceUtil.prototype = {
    initialize: function() {
    },
	getFullQuery: function(table,filter,reportSourceID) {
		return SNC.ReportSource.getFullQuery(table,filter,null,reportSourceID);
	},

    type: 'ReportSourceUtil'
};
