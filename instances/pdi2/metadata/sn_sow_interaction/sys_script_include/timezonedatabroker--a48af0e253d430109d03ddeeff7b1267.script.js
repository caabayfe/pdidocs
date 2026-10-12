var TimeZoneDatabroker = Class.create();
TimeZoneDatabroker.prototype = {
    initialize: function(timezone) {
		this.timezone = timezone;
    },
	
	getUserTime: function() {
		var scheduleGdt = new GlideScheduleDateTime();
		var convertedDateTimeString = scheduleGdt.convertTimeZone('', this.timezone);

		var gdt = new GlideDateTime();
		gdt.setDisplayValue(convertedDateTimeString);

		return gdt;
	},

    type: 'TimeZoneDatabroker'
};
