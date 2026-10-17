var DiscoveryScheduleRunType = Class.create();
DiscoveryScheduleRunType.prototype = {

	// Constants
	AFTER_DISCOVERY: 'after_discovery',
	CALENDAR_QUARTER_END: 'calendar_quarter_end',
	DAILY: 'daily',
	MONTH_LAST_DAY: 'month_last_day',
	ON_DEMAND: 'on_demand',
	WEEKDAYS: 'weekdays',
	WEEKENDS: 'weekends',	
	
	initialize: function(run_type) {
    	this.run_type = run_type;
	},
	
	/** 
	 * Returns legacy equivalent for new disco_run_type choices
	 */
	getLegacyConversion: function() {
		if (this.run_type + '' == this.AFTER_DISCOVERY)
			return this.ON_DEMAND;
		else if (this.isDaily())
			return this.DAILY;
		else 
			return this.run_type;
	},

	/**
	 * For additional discovery schedule run types, we need to make sure it is actually a weekeday, weekend, etc.. 
	 */
	match: function() {
		switch (this.run_type) {
    	case this.WEEKDAYS:
        	return this._isWeekday();
    	case this.WEEKENDS:
        	return this._isWeekend();
    	case this.MONTH_LAST_DAY:
        	return this._isLastDayOfMonth();
		case this.CALENDAR_QUARTER_END:
        	return this._isEndOfQuarter();
		}
		
		// Run it if it is not one of above type		
		return true;
	},
	
	/** 
	 * It is a daily run_type if it is weekdays, weekends, last day of the month, calendar quarter end, or daily
	 */ 	
	isDaily: function() {
		return JSUtil.notNil(this.run_type) && ((this.run_type == this.WEEKDAYS || this.run_type == this.WEEKENDS || this.run_type == this.MONTH_LAST_DAY || this.run_type == this.CALENDAR_QUARTER_END || this.run_type == this.DAILY));
	},
	
	_isWeekday: function() {
		var day = new GlideDateTime().getDayOfWeekLocalTime();  
  	  return (day < 6); 
	},
	
	_isWeekend: function() {
		var day = new GlideDateTime().getDayOfWeekLocalTime();
  	  return (day > 5); 
	},
	
	_isLastDayOfMonth: function() {
		// If we add one day it should go to next month or next year (December)
		var gdt = new GlideDateTime();
		var month = gdt.getMonthLocalTime();
		var year = gdt.getYearLocalTime();		
		gdt.addDaysLocalTime(1);
		
		return gdt.getMonthLocalTime() > month || gdt.getYearLocalTime() > year;
	},

	_isEndOfQuarter: function() {
		var gdt = new GlideDateTime();
		var date = gdt.getMonthLocalTime() + '-' + gdt.getDayOfMonthLocalTime();
		
		return (date == '3-31') || (date == '6-30') || (date == '9-30') || (date == '12-31');
	},
		
    type: 'DiscoveryScheduleRunType'
}
