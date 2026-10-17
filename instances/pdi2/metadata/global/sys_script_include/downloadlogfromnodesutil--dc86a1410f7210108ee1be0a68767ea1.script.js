var DownloadLogFromNodesUtil = Class.create();

DownloadLogFromNodesUtil.prototype = Object.extendsObject(AbstractAjaxProcessor, {

	convertDatesToSystemFormat: function() {
		var startDate = this.getParameter("sysparm_start_date");
		var endDate = this.getParameter("sysparm_end_date");
		var dates = {};
		dates.start_date = this.convertDateToSystemFormat(startDate);
		if (endDate)
			dates.end_date = this.convertDateToSystemFormat(endDate);
		return JSON.stringify(dates);
	},

	convertDateToSystemFormat: function(date) {
		var gd = new GlideDate();
		gd.setDisplayValue(date, gs.getSession().getUser().getDateFormat());
		return gd.getDisplayValueInternal();
	}
});
