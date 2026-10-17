var ScheduleDateTimeUtil = Class.create();
ScheduleDateTimeUtil.prototype = {
    initialize: function() {
        this.UTC_TZ_INDICATOR = 'Z';
		this.UTC_ID = 'Etc/UTC';
    },
    type: 'ScheduleDateTimeUtil',

    /* return type : String */
    convertGlideDateTimetoScheduleDateTimeForTZ: function( /*GlideDateTime in UTC*/ gdt, /*String*/ timeZone) {
        var scheduleDateTime = new GlideScheduleDateTime(gdt.getNumericValue(), timeZone);
        var internalValue = scheduleDateTime.getValueInternal();
        return internalValue;
    },

    /*when TimeZone is floating
     *or TimeZone is not in consideration
     *return type : String
     */
    convertGlideDateTimetoScheduleDateTime: function( /*GlideDateTime*/ glideDateTime) {
        var scheduleDateTime = new GlideScheduleDateTime(glideDateTime);
        var internalValue = scheduleDateTime.getValueInternal();
        if (internalValue.endsWith(this.UTC_TZ_INDICATOR)) {
            return internalValue.slice(0, -1);
        }
        return internalValue;
    },

    /* scheduleDateTime : ScheduleDateTime String(as stored in DB), eg : 20230301T190000Z
     *timeZone : timeZone of the schedule
     *return type : String 
	 *return value : datetime in the schedule's timezone in user format
     */
    convertScheduleDateTimeForTZ: function( /*String*/ scheduleDateTime, /*String*/ timeZone) {
        var sdt = new GlideScheduleDateTime();
        sdt.setValue(scheduleDateTime);
		if(gs.nil(timeZone) && scheduleDateTime.endsWith(this.UTC_TZ_INDICATOR)){ // case where schedule is type floating but entry date contains 'Z'
			return sdt.convertTimeZone(this.UTC_ID, gs.getSession().getTimeZoneName());
		}
        sdt.setTimeZone(timeZone);
        return sdt.convertTimeZone(gs.getSession().getTimeZoneName(), timeZone);
    }
};
