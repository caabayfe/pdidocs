function transform(input) {

    var convertDateToScheduleDateTime = function(input) {
        var response = {};
        var startDateTime = new GlideDateTime(input.startDateTime);
        var endDateTime = new GlideDateTime(input.endDateTime);
		//datetime in current timezone
        if (gs.nil(input.timeZone)) {
            response.startDateTime = new ScheduleDateTimeUtil().convertGlideDateTimetoScheduleDateTime(startDateTime);
            response.endDateTime = new ScheduleDateTimeUtil().convertGlideDateTimetoScheduleDateTime(endDateTime);
            return response;
        }
		//datetime in utc
        response.startDateTime = new ScheduleDateTimeUtil().convertGlideDateTimetoScheduleDateTimeForTZ(startDateTime, input.timeZone);
        response.endDateTime = new ScheduleDateTimeUtil().convertGlideDateTimetoScheduleDateTimeForTZ(endDateTime, input.timeZone);
        return response;
    };

    var convertScheduleDateTimeToDate = function(input) {
        var response = {};
        response.startDateTime = new ScheduleDateTimeUtil().convertScheduleDateTimeForTZ(input.startDateTime, input.timeZone);
        response.endDateTime = new ScheduleDateTimeUtil().convertScheduleDateTimeForTZ(input.endDateTime, input.timeZone);
        return response;
    };

    if (input.isConvertToScheduleDateTime) {
        return convertDateToScheduleDateTime(input);
    }
    return convertScheduleDateTimeToDate(input);
}
