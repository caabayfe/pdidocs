var AssetDateUtils = Class.create();
AssetDateUtils.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {

	validateStartEndDate: function() {
		var startDate = this.getParameter('sysparm_start_date');
		var endDate = this.getParameter('sysparm_end_date');
		var startDateLabel = this.getParameter('sysparm_start_date_label');
		var endDateLabel = this.getParameter('sysparm_end_date_label');
		var dateTimeFormat = this.getParameter('sysparm_date_time_format');

		if (!startDate || !endDate) {
			return '';
		}

		var gStartDate = new GlideDateTime();
		var gEndDate = new GlideDateTime();

		try {
			gStartDate.setDisplayValue(startDate, dateTimeFormat);
		} catch (e) {
			return gs.getMessage('{0} is invalid', startDateLabel);
		}

		try {
			gEndDate.setDisplayValue(endDate, dateTimeFormat);
		} catch (e) {
			return gs.getMessage('{0} is invalid', endDateLabel);
		}

		if (gStartDate.compareTo(gEndDate) > 0) {
			return gs.getMessage('{0} must be after {1}', [endDateLabel, startDateLabel]);
		}
		return '';
	},

	type: 'AssetDateUtils',
});
