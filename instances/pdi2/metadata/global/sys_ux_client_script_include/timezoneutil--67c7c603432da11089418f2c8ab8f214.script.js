function include({
    imports
}) {
    const {
        NowDateTime
    } = imports['sn_uxf.core_libraries']();
    const {
        dateFormatMap
    } = imports['global.ScheduleCalendarUtils']();

    const DEFAULT_DATETIME_FORMAT = "YYYY-MM-DD HH:mm:ss";

    const convertTimezone = function (time, fromTZ, toTZ, dateTimeFormat) {
        dateTimeFormat = dateTimeFormat == null ? DEFAULT_DATETIME_FORMAT : dateTimeFormat;
        return NowDateTime.tz(time, dateTimeFormat, fromTZ)
            .tz(toTZ)
            .format(dateTimeFormat);
    };

    const getNowDateTimeWithTZ = (api, dateTime, scheduleTimeZone, dateTimeFormat) => {
        const userTimeZone = api.context.session.user.timeZone;

        if (scheduleTimeZone) {
            dateTime = convertTimezone(dateTime, userTimeZone, scheduleTimeZone, dateTimeFormat);
        }
        return NowDateTime(dateTime, dateFormat);
    };

    const getFormattedDateStringForMoveEventModal = async function (api, helpers, startDateTime, endDateTime, scheduleTimeZone) {
        const userTimeFormat = api.context.session.user.timeFormat;
        const userDateFormat = dateFormatMap['DAY'][api.context.session.user.dateFormat];
        const startDateTimeConvertedTZ = getNowDateTimeWithTZ(api, startDateTime, scheduleTimeZone, DEFAULT_DATETIME_FORMAT);
        const endDateTimeConvertedTZ = getNowDateTimeWithTZ(api, endDateTime, scheduleTimeZone, DEFAULT_DATETIME_FORMAT);
        const startDateFormatted = startDateTimeConvertedTZ.format(userDateFormat);
        const startTime = startDateTimeConvertedTZ.format(userTimeFormat);
        const endDateTimeFormatted = endDateTimeConvertedTZ.format(userDateFormat);
        const endTime = endDateTimeConvertedTZ.format(userTimeFormat);
        const returnStringTemplate = 'Please confirm that you would like to move this event to now start on {0} {1} and end on {2} {3}.';
        return await helpers.translate(returnStringTemplate, startDateFormatted, startTime, endDateTimeFormatted, endTime);
    }

    return {
        convertTimezone: convertTimezone,
        getFormattedDateStringForMoveEventModal: getFormattedDateStringForMoveEventModal
    };
}
